import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import portrait from './portrait-line.json';

/* ------------------------------------------------------------------
   "The groove is the face".

   The drawing is one continuous line, like the groove of a record.
   At rest it is wound up as a record spiral that keeps spinning.
   Hovering the sleeve (or focusing it, or tapping it on touch screens)
   unwinds the line along its own length into the portrait, a wire
   sculpture with real depth that turns with the pointer; leaving winds
   it back into the record.

   portrait-line.json comes from scripts/trace-drawing.py.
------------------------------------------------------------------- */

const ASPECT = portrait.aspect;
const TURNS = 16;
const SPIRAL_OUTER = 0.36;
const SPIRAL_INNER = 0.1;
const SPIRAL_TILT = 0.95; // The record lies back, away from the viewer.
const UNWIND_WINDOW = 0.35; // How much of the line is in flight at once.
const SPIN_SPEED = (Math.PI * 2) / 1.8;
const LINE_WIDTH = 1.5;
// Seconds for a full unwind into the portrait, and to wind back up.
const ASSEMBLE_TIME = 1.3;
const DISASSEMBLE_TIME = 0.9;

export type LinerPortrait3DProps = {
    theme: 'light' | 'dark';
    onReady: () => void;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const damp = (current: number, target: number, rate: number, dt: number) =>
    current + (target - current) * (1 - Math.exp(-rate * dt));

const smoothstep = (x: number) => x * x * (3 - 2 * x);

// A rough head-and-shoulders relief, in image fractions (u across, v down).
function depthAt(u: number, v: number) {
    const du = (u - 0.5) / 0.36;
    const dv = (v - 0.31) / 0.25;
    const head = Math.sqrt(Math.max(0, 1 - du * du - dv * dv)) * 0.17;
    const nose = 0.07 * Math.exp(-((u - 0.53) ** 2 + (v - 0.37) ** 2) / (2 * 0.045 ** 2));
    const chin = 0.03 * Math.exp(-((u - 0.5) ** 2 + (v - 0.47) ** 2) / (2 * 0.07 ** 2));
    const wide = (u - 0.5) / 0.55;
    const body = v > 0.5 ? 0.07 * (1 - wide * wide) - 0.03 : -1;
    return Math.max(head + nose + chin, body);
}

type LineData = {
    target: Float32Array; // xyz per vertex, the finished portrait.
    t: Float32Array; // 0..1 position of each vertex along the whole line.
    segments: Uint32Array; // vertex index pairs; no segment jumps between paths.
};

function buildLine(): LineData {
    const count = portrait.paths.reduce((n, p) => n + p.length / 2, 0);
    const target = new Float32Array(count * 3);
    const lengths = new Float32Array(count);
    const pairs: number[] = [];

    let i = 0;
    let total = 0;
    for (const path of portrait.paths) {
        for (let k = 0; k < path.length; k += 2) {
            const u = path[k] / 1000 / ASPECT;
            const v = path[k + 1] / 1000;
            target[i * 3] = (u - 0.5) * ASPECT;
            target[i * 3 + 1] = 0.5 - v;
            target[i * 3 + 2] = depthAt(u, v);
            if (k > 0) {
                const dx = target[i * 3] - target[(i - 1) * 3];
                const dy = target[i * 3 + 1] - target[(i - 1) * 3 + 1];
                total += Math.hypot(dx, dy);
                pairs.push(i - 1, i);
            }
            // Jumps between paths add no length, so the spiral stays unbroken.
            lengths[i] = total;
            i++;
        }
    }
    const t = lengths.map((l) => l / total);
    return { target, t, segments: Uint32Array.from(pairs) };
}

// Index of the first vertex whose t is >= value.
function vertexAt(t: Float32Array, value: number) {
    let lo = 0;
    let hi = t.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (t[mid] < value) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// Writes every vertex for this frame, then copies them into the segment buffer.
function writeFrame(
    line: LineData,
    positions: Float32Array,
    attribute: THREE.InterleavedBufferAttribute,
    sweep: number,
    spin: number
) {
    const { target, t, segments } = line;
    const cosTilt = Math.cos(SPIRAL_TILT);
    const sinTilt = Math.sin(SPIRAL_TILT);

    for (let i = 0; i < t.length; i++) {
        const local = THREE.MathUtils.clamp((sweep - t[i]) / UNWIND_WINDOW, 0, 1);
        const e = smoothstep(local);

        // Groove spiral, outside in, on a record lying back.
        const r = SPIRAL_OUTER - (SPIRAL_OUTER - SPIRAL_INNER) * t[i];
        const angle = -t[i] * TURNS * Math.PI * 2 + spin;
        const sx = r * Math.cos(angle);
        const sy = r * Math.sin(angle) * cosTilt - 0.05;
        const sz = -r * Math.sin(angle) * sinTilt;

        const i3 = i * 3;
        const lift = Math.sin(Math.PI * e) * 0.22;
        positions[i3] = sx + (target[i3] - sx) * e;
        positions[i3 + 1] = sy + (target[i3 + 1] - sy) * e;
        positions[i3 + 2] = sz + (target[i3 + 2] - sz) * e + lift;
    }

    const buffer = attribute.data.array as Float32Array;
    for (let s = 0; s < segments.length; s += 2) {
        const a = segments[s] * 3;
        const b = segments[s + 1] * 3;
        const o = s * 3;
        buffer[o] = positions[a];
        buffer[o + 1] = positions[a + 1];
        buffer[o + 2] = positions[a + 2];
        buffer[o + 3] = positions[b];
        buffer[o + 4] = positions[b + 1];
        buffer[o + 5] = positions[b + 2];
    }
    attribute.data.needsUpdate = true;
}

function useInView(el: Element | null) {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
        observer.observe(el);
        return () => observer.disconnect();
    }, [el]);
    return inView;
}

function Portrait({ theme, onReady }: LinerPortrait3DProps) {
    const host = useThree((s) => s.gl.domElement);
    const size = useThree((s) => s.size);
    const invalidate = useThree((s) => s.invalidate);

    const sleeve = host.closest('.sleeve');
    const inView = useInView(sleeve);
    const reducedMotion = useMemo(() => prefersReducedMotion(), []);
    const line = useMemo(() => buildLine(), []);

    const groupRef = useRef<THREE.Group>(null);
    const needleRef = useRef<THREE.Mesh>(null);
    const motion = useRef({
        progress: reducedMotion ? 1 : 0,
        spin: 0,
        pointer: 0,
        hovering: false,
        assembled: false,
        frames: 0,
    });

    const { object, material, positions, attribute } = useMemo(() => {
        const segmentCount = line.segments.length / 2;
        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(new Float32Array(segmentCount * 6));
        const material = new LineMaterial({ linewidth: LINE_WIDTH, worldUnits: false });
        const object = new LineSegments2(geometry, material);
        object.frustumCulled = false;
        const attribute = geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute;
        return {
            object,
            material,
            attribute,
            positions: new Float32Array(line.target.length),
        };
    }, [line]);

    useEffect(
        () => () => {
            object.geometry.dispose();
            material.dispose();
        },
        [object, material]
    );

    useEffect(() => {
        material.resolution.set(size.width, size.height);
        invalidate();
    }, [material, size, invalidate]);

    useEffect(() => {
        const ink = getComputedStyle(host).getPropertyValue('--fg').trim();
        material.color.set(ink || (theme === 'dark' ? '#f2f0eb' : '#0b0b0b'));
        invalidate();
    }, [material, theme, host, invalidate]);

    const needleColor = useMemo(() => getComputedStyle(host).getPropertyValue('--red').trim() || '#e3242b', [host]);

    // Mouse hover assembles the portrait and leaving takes it apart. Touch
    // has no hover, so a tap toggles it; keyboard focus works like hover.
    useEffect(() => {
        if (!sleeve || reducedMotion) return;
        const m = motion.current;
        const set = (assembled: boolean) => {
            m.assembled = assembled;
            invalidate();
        };
        const onEnter = (event: Event) => {
            if ((event as PointerEvent).pointerType === 'mouse') set(true);
        };
        const onLeave = (event: Event) => {
            if ((event as PointerEvent).pointerType !== 'mouse') return;
            m.hovering = false;
            set(false);
        };
        const onMove = (event: Event) => {
            const e = event as PointerEvent;
            if (e.pointerType !== 'mouse') return;
            const rect = sleeve.getBoundingClientRect();
            m.pointer = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
            m.hovering = true;
            invalidate();
        };
        const onDown = (event: Event) => {
            if ((event as PointerEvent).pointerType !== 'mouse') set(!m.assembled);
        };
        const onFocus = () => set(true);
        const onBlur = () => set(false);

        const listeners: [string, (event: Event) => void][] = [
            ['pointerenter', onEnter],
            ['pointerleave', onLeave],
            ['pointermove', onMove],
            ['pointerdown', onDown],
            ['focusin', onFocus],
            ['focusout', onBlur],
        ];
        listeners.forEach(([type, fn]) => sleeve.addEventListener(type, fn));
        return () => listeners.forEach(([type, fn]) => sleeve.removeEventListener(type, fn));
    }, [sleeve, reducedMotion, invalidate]);

    useEffect(() => {
        if (inView) invalidate();
    }, [inView, invalidate]);

    useFrame((state, rawDelta) => {
        const dt = Math.min(rawDelta, 1 / 20);
        const m = motion.current;

        // The needle travels at a steady pace toward the wanted state. With
        // reduced motion the portrait simply stays assembled.
        if (reducedMotion) {
            m.progress = 1;
        } else if (m.assembled) {
            m.progress = Math.min(1, m.progress + dt / ASSEMBLE_TIME);
        } else {
            m.progress = Math.max(0, m.progress - dt / DISASSEMBLE_TIME);
        }
        // The record always spins; it slows down as the portrait takes shape.
        m.spin += dt * SPIN_SPEED * (1 - smoothstep(m.progress));

        const sweep = m.progress * (1 + UNWIND_WINDOW);
        writeFrame(line, positions, attribute, sweep, m.spin);
        const { t } = line;

        // The needle rides the front of the unwinding line.
        const needle = needleRef.current;
        if (needle) {
            const playing = m.progress > 0.01 && m.progress < 0.99;
            needle.visible = playing;
            if (playing) {
                const v = vertexAt(t, THREE.MathUtils.clamp(sweep - UNWIND_WINDOW / 2, 0, 1)) * 3;
                needle.position.set(positions[v], positions[v + 1], positions[v + 2]);
            }
        }

        // Turn toward the pointer; after a tap on touch screens, sway gently so the depth reads.
        if (groupRef.current) {
            const finished = smoothstep(m.progress);
            const sway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.22 * finished;
            const turn = m.hovering ? m.pointer * 0.7 * finished : sway;
            groupRef.current.rotation.y = damp(groupRef.current.rotation.y, turn, 4, dt);
        }

        // Reveal only after a few complete frames.
        if (m.frames >= 0) {
            m.frames += 1;
            if (m.frames > 2) {
                m.frames = -1;
                onReady();
            }
        }

        if ((inView && !reducedMotion) || m.frames >= 0) invalidate();
    });

    return (
        <group ref={groupRef} position-y={-0.02}>
            <primitive object={object} />
            <mesh ref={needleRef} visible={false}>
                <sphereGeometry args={[0.012, 16, 12]} />
                <meshBasicMaterial color={needleColor} />
            </mesh>
        </group>
    );
}

export default function LinerPortrait3D(props: LinerPortrait3DProps) {
    return (
        <div className="sleeve__canvas" aria-hidden="true">
            <Canvas
                flat
                frameloop="demand"
                dpr={[1, 2]}
                // Measure with offset sizes: the parents animate in with transforms,
                // and a transformed measurement leaves the canvas misaligned until
                // the next resize, which then clears it for a frame.
                resize={{ offsetSize: true, scroll: false }}
                camera={{ position: [0, 0, 1.95], fov: 32, near: 0.1, far: 10 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
            >
                <CameraFit />
                <Portrait {...props} />
            </Canvas>
        </div>
    );
}

// Keep the whole drawing in frame on narrow (portrait) covers.
function CameraFit() {
    const get = useThree((s) => s.get);
    const aspect = useThree((s) => s.size.width / s.size.height);
    useLayoutEffect(() => {
        const { camera, invalidate } = get();
        const fitWidth = (ASPECT * 1.25) / aspect;
        (camera as THREE.PerspectiveCamera).zoom = Math.min(1, 1 / Math.max(1, fitWidth));
        camera.updateProjectionMatrix();
        invalidate();
    }, [get, aspect]);
    return null;
}
