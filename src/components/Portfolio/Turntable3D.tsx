import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------
   3D turntable.

   The scene is drawn in "deck units": the deck is 1 unit tall and
   1.1 units wide (its CSS aspect ratio), and an orthographic camera
   maps one unit to the deck's pixel height. That keeps every 3D part
   exactly under its DOM twin, so the transparent record <button>
   stays the click target and the flying records still land on it.
------------------------------------------------------------------- */

const DECK_W = 1.1;
const toWorldX = (fraction: number) => (fraction - 0.5) * DECK_W;

// Mirrors .platter / .record / .record__label / .record__hole in portfolio.css.
const PLATTER_R = (0.72 * DECK_W) / 2;
const RECORD_R = PLATTER_R * 0.94;
const LABEL_R = RECORD_R * 0.36;
const PLATTER_X = toWorldX(0.07 + 0.72 / 2);

// Mirrors .tonearm: pivot near the top right, arm 66% of the deck tall.
const ARM_X = toWorldX(1 - 0.09) - 0.02;
const ARM_Y = 0.5 - 0.09 - 0.02;
const ARM_LEN = 0.66;
const ARM_REST = THREE.MathUtils.degToRad(4);
const ARM_PLAY = THREE.MathUtils.degToRad(-27);

const PLATTER_H = 0.03;
const RECORD_H = 0.012;
const RECORD_TOP = PLATTER_H + RECORD_H;

const SPIN_SPEED = (Math.PI * 2) / 1.8; // One turn every 1.8s, like the CSS deck.
const MAX_TILT = 0.12;
const EMPTY = '__empty';

type LabelColor = 'red' | 'blue' | 'paper';

export type Turntable3DProps = {
    playing: boolean;
    deckNo: string | null;
    labelColor: LabelColor;
    active: boolean;
    onReady: () => void;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHoverPrecisely = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Frame-rate independent approach toward a target.
const damp = (current: number, target: number, rate: number, dt: number) =>
    current + (target - current) * (1 - Math.exp(-rate * dt));

const readTokens = (el: Element) => {
    const css = getComputedStyle(el);
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    return {
        red: token('--red', '#e3242b'),
        blue: token('--blue', '#1f4fd8'),
        paper: token('--paper', '#f2f0eb'),
        vinyl: token('--vinyl', '#0b0b0b'),
    };
};

type Tokens = ReturnType<typeof readTokens>;

/* ------------------------------------------------------------------
   Procedural textures
------------------------------------------------------------------- */

function makeCanvas(size: number) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return [canvas, canvas.getContext('2d')!] as const;
}

// Fine grooves plus a few wider gaps between tracks.
function createGrooveTexture() {
    const size = 1024;
    const [canvas, ctx] = makeCanvas(size);
    const c = size / 2;
    ctx.fillStyle = '#060606';
    ctx.fillRect(0, 0, size, size);

    const labelEdge = c * 0.37;
    const trackGaps = [0.5, 0.63, 0.74, 0.86];
    for (let r = labelEdge; r < c * 0.985; r += 1.6) {
        const t = r / c;
        const isGap = trackGaps.some((g) => Math.abs(t - g) < 0.006);
        ctx.strokeStyle = isGap ? '#1d1d1d' : Math.round(r / 1.6) % 2 ? '#111111' : '#070707';
        ctx.lineWidth = isGap ? 2.4 : 1;
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Lead-out ring by the label.
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(c, c, labelEdge - 4, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

// Tangential directions, so highlights wrap around the grooves like real vinyl.
function createAnisotropyTexture() {
    const size = 256;
    const [canvas, ctx] = makeCanvas(size);
    const image = ctx.createImageData(size, size);
    const c = size / 2;
    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            const x = px + 0.5 - c;
            const y = c - (py + 0.5);
            const len = Math.hypot(x, y) || 1;
            const i = (py * size + px) * 4;
            image.data[i] = ((-y / len + 1) / 2) * 255;
            image.data[i + 1] = ((x / len + 1) / 2) * 255;
            image.data[i + 2] = 255;
            image.data[i + 3] = 255;
        }
    }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.NoColorSpace;
    return texture;
}

function createShadowTexture() {
    const size = 256;
    const [canvas, ctx] = makeCanvas(size);
    const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

function createLabelTexture(deckNo: string | null, color: LabelColor, tokens: Tokens) {
    const size = 512;
    const [canvas, ctx] = makeCanvas(size);
    const c = size / 2;
    const background = tokens[color];
    const ink = color === 'paper' ? tokens.vinyl : tokens.paper;

    ctx.fillStyle = background;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();

    const mono = deckNo === 'Bonus' ? '★' : deckNo === EMPTY ? '' : deckNo ?? 'JS';
    const small = deckNo === EMPTY ? '' : deckNo ? (deckNo.startsWith('A') ? 'Side A' : 'Side B') : 'Juan Saracco';

    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    if ('fontStretch' in ctx) ctx.fontStretch = 'expanded';
    ctx.textBaseline = 'top';
    ctx.font = '800 108px Archivo, system-ui, sans-serif';
    ctx.fillText(mono, c, size * 0.15);

    ctx.globalAlpha = 0.85;
    ctx.textBaseline = 'alphabetic';
    if ('fontStretch' in ctx) ctx.fontStretch = 'normal';
    ctx.font = '600 44px Archivo, system-ui, sans-serif';
    ctx.fillText(small, c, size * 0.85);
    ctx.globalAlpha = 1;

    // Spindle hole.
    ctx.fillStyle = '#d9d6ce';
    ctx.beginPath();
    ctx.arc(c, c, size * 0.055, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
}

/* ------------------------------------------------------------------
   Scene
------------------------------------------------------------------- */

// One world unit = the deck's pixel height.
function DeckCamera() {
    const get = useThree((s) => s.get);
    const height = useThree((s) => s.size.height);
    useEffect(() => {
        const { camera, invalidate } = get();
        camera.zoom = height;
        camera.updateProjectionMatrix();
        invalidate();
    }, [get, height]);
    return null;
}

function useFontsReady() {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let alive = true;
        Promise.all([
            document.fonts.load('800 108px Archivo'),
            document.fonts.load('600 44px Archivo'),
        ])
            .catch(() => undefined)
            .then(() => alive && setReady(true));
        return () => {
            alive = false;
        };
    }, []);
    return ready;
}

type SceneProps = Omit<Turntable3DProps, 'onReady'>;

function Scene({ playing, deckNo, labelColor, active }: SceneProps) {
    const invalidate = useThree((s) => s.invalidate);
    const host = useThree((s) => s.gl.domElement);

    const tiltRef = useRef<THREE.Group>(null);
    const recordRef = useRef<THREE.Group>(null);
    const labelRef = useRef<THREE.Mesh>(null);
    const labelMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    const armRef = useRef<THREE.Group>(null);

    const motion = useRef({ speed: 0, arm: ARM_REST, labelScale: 1, pointerX: 0, pointerY: 0 });
    const reducedMotion = useMemo(prefersReducedMotion, []);
    const fontsReady = useFontsReady();

    const grooves = useMemo(createGrooveTexture, []);
    const anisotropyMap = useMemo(createAnisotropyTexture, []);
    const shadow = useMemo(createShadowTexture, []);
    const tokens = useMemo(() => readTokens(host.parentElement ?? host), [host]);
    // fontsReady is a dependency only to redraw the label once Archivo has loaded.
    const label = useMemo(
        () => createLabelTexture(deckNo, labelColor, tokens),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [deckNo, labelColor, tokens, fontsReady]
    );

    useEffect(() => () => label.dispose(), [label]);
    useEffect(
        () => () => {
            grooves.dispose();
            anisotropyMap.dispose();
            shadow.dispose();
        },
        [grooves, anisotropyMap, shadow]
    );

    // Subtle tilt toward the pointer, only for precise pointers.
    useEffect(() => {
        if (reducedMotion || !canHoverPrecisely()) return;
        const onMove = (event: PointerEvent) => {
            const rect = host.getBoundingClientRect();
            const nx = ((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 2;
            const ny = ((event.clientY - (rect.top + rect.height / 2)) / rect.height) * 2;
            motion.current.pointerX = THREE.MathUtils.clamp(nx, -1, 1);
            motion.current.pointerY = THREE.MathUtils.clamp(ny, -1, 1);
            if (active) invalidate();
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, [host, invalidate, reducedMotion, active]);

    // Under frameloop="demand" these props only drive useFrame, so kick the loop when they change.
    useEffect(() => {
        if (active) invalidate();
    }, [active, playing, deckNo, invalidate]);

    useFrame((_, rawDelta) => {
        const dt = Math.min(rawDelta, 1 / 20);
        const m = motion.current;
        const empty = deckNo === EMPTY;

        const targetSpeed = playing && !reducedMotion ? SPIN_SPEED : 0;
        m.speed = damp(m.speed, targetSpeed, playing ? 3 : 1.4, dt);
        if (Math.abs(m.speed) < 1e-3) m.speed = targetSpeed;
        if (recordRef.current) recordRef.current.rotation.z -= m.speed * dt;

        const targetArm = playing ? ARM_PLAY : ARM_REST;
        m.arm = reducedMotion ? targetArm : damp(m.arm, targetArm, 3.2, dt);
        const armTravel = Math.abs(targetArm - m.arm);
        if (armRef.current) {
            armRef.current.rotation.z = m.arm;
            // Lift the needle while the arm swings.
            armRef.current.rotation.x = -Math.min(armTravel * 0.4, 0.06);
        }

        const targetScale = empty ? 0.2 : 1;
        m.labelScale = reducedMotion ? targetScale : damp(m.labelScale, targetScale, 9, dt);
        labelRef.current?.scale.setScalar(m.labelScale);
        if (labelMaterialRef.current) {
            labelMaterialRef.current.opacity = THREE.MathUtils.clamp((m.labelScale - 0.2) / 0.8, 0, 1);
        }

        let tiltMoving = false;
        if (tiltRef.current) {
            const tx = m.pointerY * MAX_TILT * 0.6;
            const ty = m.pointerX * MAX_TILT;
            const g = tiltRef.current.rotation;
            g.x = damp(g.x, tx, 5, dt);
            g.y = damp(g.y, ty, 5, dt);
            tiltMoving = Math.abs(g.x - tx) + Math.abs(g.y - ty) > 1e-4;
        }

        const moving =
            m.speed !== 0 || armTravel > 1e-4 || Math.abs(m.labelScale - targetScale) > 1e-3 || tiltMoving;
        if (moving && active) invalidate();
    });

    return (
        <>
            <DeckCamera />
            <ambientLight intensity={0.55} />
            <directionalLight position={[-1.5, 2.2, 3]} intensity={2.1} />
            <directionalLight position={[2, -1, 1.5]} intensity={0.5} color="#c9d4ff" />

            <group ref={tiltRef}>
                {/* Platter */}
                <group position={[PLATTER_X, 0, 0]}>
                    <mesh rotation-x={Math.PI / 2} position-z={PLATTER_H / 2}>
                        <cylinderGeometry args={[PLATTER_R, PLATTER_R, PLATTER_H, 96]} />
                        <meshStandardMaterial color="#1c1c1b" roughness={0.6} metalness={0.3} />
                    </mesh>

                    <mesh position={[0.012, -0.02, PLATTER_H + 0.0005]}>
                        <planeGeometry args={[RECORD_R * 2.25, RECORD_R * 2.25]} />
                        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
                    </mesh>

                    {/* Record */}
                    <group ref={recordRef} position-z={PLATTER_H}>
                        <mesh rotation-x={Math.PI / 2} position-z={RECORD_H / 2}>
                            <cylinderGeometry args={[RECORD_R, RECORD_R, RECORD_H, 128]} />
                            <meshStandardMaterial color="#030303" roughness={0.5} />
                        </mesh>
                        <mesh position-z={RECORD_H + 0.0005}>
                            <circleGeometry args={[RECORD_R, 128]} />
                            <meshPhysicalMaterial
                                map={grooves}
                                roughness={0.38}
                                metalness={0}
                                clearcoat={0.7}
                                clearcoatRoughness={0.22}
                                anisotropy={0.85}
                                anisotropyMap={anisotropyMap}
                            />
                        </mesh>
                        <mesh ref={labelRef} position-z={RECORD_H + 0.001}>
                            <circleGeometry args={[LABEL_R, 96]} />
                            <meshStandardMaterial
                                ref={labelMaterialRef}
                                map={label}
                                roughness={0.85}
                                transparent
                            />
                        </mesh>
                    </group>

                    {/* Spindle */}
                    <mesh rotation-x={Math.PI / 2} position-z={RECORD_TOP + 0.008}>
                        <cylinderGeometry args={[0.006, 0.007, 0.02, 24]} />
                        <meshStandardMaterial color="#cfccc4" metalness={0.8} roughness={0.25} />
                    </mesh>
                </group>

                {/* Tonearm */}
                <group position={[ARM_X, ARM_Y, RECORD_TOP + 0.03]}>
                    <mesh rotation-x={Math.PI / 2} position-z={-0.012}>
                        <cylinderGeometry args={[0.046, 0.05, 0.04, 48]} />
                        <meshStandardMaterial color="#3a3936" roughness={0.5} metalness={0.4} />
                    </mesh>
                    <mesh rotation-x={Math.PI / 2} position-z={0.012}>
                        <cylinderGeometry args={[0.016, 0.016, 0.012, 32]} />
                        <meshStandardMaterial color="#8f8c84" roughness={0.3} metalness={0.7} />
                    </mesh>
                    <group ref={armRef} rotation-z={ARM_REST}>
                        <mesh position-y={-ARM_LEN / 2}>
                            <cylinderGeometry args={[0.0066, 0.0066, ARM_LEN, 16]} />
                            <meshStandardMaterial color="#dcd8d0" roughness={0.28} metalness={0.55} />
                        </mesh>
                        <mesh position-y={-ARM_LEN} rotation-z={THREE.MathUtils.degToRad(18)}>
                            <boxGeometry args={[0.048, 0.075, 0.018]} />
                            <meshStandardMaterial color="#2b2a28" roughness={0.6} />
                        </mesh>
                    </group>
                </group>
            </group>
        </>
    );
}

export default function Turntable3D({ onReady, ...scene }: Turntable3DProps) {
    return (
        <div className="deck__canvas" aria-hidden="true">
            <Canvas
                orthographic
                flat
                frameloop="demand"
                dpr={[1, 2]}
                camera={{ position: [0, 0, 5], near: 0.1, far: 20 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
                onCreated={() => onReady()}
            >
                <Scene {...scene} />
            </Canvas>
        </div>
    );
}
