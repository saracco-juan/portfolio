import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { CSSProperties, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import {
    ArrowUpRight,
    Download,
    Github,
    Linkedin,
    Mail,
    Menu,
    Moon,
    Pause,
    Play,
    Sun,
    X,
} from 'lucide-react';
import profileImage from '../../assets/juan-drawing.jpg';
import resume from '../../assets/juan-saracco-cv.pdf';
import './portfolio.css';

/* ------------------------------------------------------------------
   Content
------------------------------------------------------------------- */

type Section = { id: string; label: string };

const SECTIONS: Section[] = [
    { id: 'notes', label: 'Liner notes' },
    { id: 'side-a', label: 'Side A' },
    { id: 'side-b', label: 'Side B' },
    { id: 'gear', label: 'Gear' },
    { id: 'contact', label: 'Contact' },
];

type Job = {
    no: string;
    role: string;
    company: string;
    period: string;
    bullets: string[];
    stack: string[];
};

const JOBS: Job[] = [
    {
        no: 'A1',
        role: 'Software Engineer',
        company: 'Hitachi Digital, client Claro',
        period: 'Jun 2025 – now',
        bullets: [
            'Led the frontend of a new critical module in the re-engineering of a corporate ERP, with full ownership of the UI.',
            'Migrated legacy interfaces to a scalable microfrontends architecture.',
            'Mocked backend contracts so the team could develop locally without waiting on external services.',
            "Added Storybook and unit testing to the team's workflow, and used AI tools to speed up development.",
        ],
        stack: ['React', 'TypeScript', 'Microfrontends', 'Storybook', 'Jenkins'],
    },
    {
        no: 'A2',
        role: 'Frontend Developer (Email Engineering)',
        company: 'VML, Microsoft account',
        period: '2023 – 2025',
        bullets: [
            'Built pixel-perfect HTML/CSS interfaces from designs, shipping 15+ deliveries per week for global campaigns reaching millions of users.',
            'Solved cross-client and cross-device compatibility issues, cutting the production bug rate by 20%.',
            "Led an internal .NET tool to track the team's productivity and delivery metrics.",
            'Managed end-to-end production cycles with SFMC and Marketo, and mentored junior developers.',
            'Documented internal processes, cutting onboarding for new developers from 3 to 2 months.',
        ],
        stack: ['HTML5', 'CSS3', 'SFMC', 'Marketo', '.NET'],
    },
    {
        no: 'A3',
        role: 'Freelance Web Developer',
        company: 'Self-employed',
        period: '2022 – 2023',
        bullets: [
            'Built custom React websites for small businesses, like Óptica Saracco.',
            'Translated Figma designs into working code and improved client visibility with SEO.',
        ],
        stack: ['React', 'Figma', 'SEO'],
    },
];

type Project = {
    no: string;
    title: string;
    summary: string;
    details: string[];
    stack: string[];
    code?: string;
    live?: string;
    partner?: { name: string; url: string };
    bonus?: boolean;
};

const PROJECTS: Project[] = [
    {
        no: 'B1',
        title: 'TD Autos',
        summary: 'Helps people buy a used car without getting burned.',
        details: [
            'My thesis project. Buyers get a short diagnosis, profile-based recommendations and inspection and transfer checklists. Dealerships manage inventory under a monthly subscription, and admins onboard dealerships and supervise payments.',
            'A monorepo with a Laravel REST API, a React web app and a React Native app that share pure TypeScript domain logic. GitHub Actions CI, a SonarCloud quality gate, Docker and automatic deploys on Vercel.',
        ],
        stack: ['React 19', 'TypeScript', 'React Native', 'Laravel 12', 'PostgreSQL', 'Docker', 'GitHub Actions'],
        code: 'https://github.com/saracco-juan/td-autos',
        live: 'https://td-autos.vercel.app',
        partner: { name: 'Mariano Giardina', url: 'https://github.com/marianogiardina' },
    },
    {
        no: 'B2',
        title: 'J-gym',
        summary: 'A mobile-first PWA to train around progressive overload.',
        details: [
            'Built with architecture discipline: pure domain logic in src/core, the repository pattern in src/infrastructure, and a UI that never talks to Supabase directly.',
        ],
        stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind', 'Supabase', 'Zustand', 'Jest'],
        code: 'https://github.com/saracco-juan/J-gym',
        live: 'https://juangym.vercel.app',
    },
    {
        no: 'B3',
        title: 'Buenas Lecturas',
        summary: 'A virtual library to track your reading and write reviews.',
        details: ['Book search through the Open Library API, user accounts with hashed passwords and a REST backend.'],
        stack: ['Java', 'Spring Boot', 'BCrypt', 'REST API'],
        code: 'https://github.com/saracco-juan/BuenasLecturas',
    },
    {
        no: 'B4',
        title: 'One Up Gym',
        summary: 'Class scheduling for a gym, with recurring weekly classes.',
        details: [
            'Dynamic time-slot generation, user roles and strict validation against overlapping bookings, built with Blade templates and a service layer.',
        ],
        stack: ['Laravel', 'Blade', 'MySQL'],
        code: 'https://github.com/marianogiardina/OneUpGym',
        partner: { name: 'Mariano Giardina', url: 'https://github.com/marianogiardina' },
    },
    {
        no: 'B5',
        title: 'Dolar App',
        summary: "Every Argentine dollar rate in one place: official, blue, MEP and more.",
        details: [
            'Consumes public APIs with loading and error states, formatting utilities and a responsive, component-based UI.',
        ],
        stack: ['JavaScript', 'HTML', 'CSS', 'REST API'],
        code: 'https://github.com/juan-saracco/Dolar-APP',
        live: 'https://dolar-app.netlify.app/',
    },
    {
        no: 'Bonus',
        title: 'Internal tooling at VML',
        summary: "A .NET tool to track the email team's productivity and delivery.",
        details: [
            'Led its development and used it to improve QA, version control and documentation processes across the team.',
        ],
        stack: ['C#', '.NET'],
        bonus: true,
    },
];

const GEAR: { title: string; items: string[] }[] = [
    {
        title: 'Frontend',
        items: ['React', 'TypeScript', 'Next.js', 'React Native', 'Microfrontends', 'Module Federation', 'Storybook', 'Tailwind CSS'],
    },
    {
        title: 'Backend',
        items: ['Node.js', 'Express', 'Java', 'Spring Boot', 'PHP', 'Laravel', 'PostgreSQL', 'Supabase', '.NET'],
    },
    {
        title: 'Tools and quality',
        items: ['Git and GitHub', 'GitHub Actions', 'Jenkins', 'Docker', 'Jest', 'SonarCloud', 'Figma', 'AI agents, spec first'],
    },
];

const NAME_WORDS = ['Juan', 'Sebastián', 'Saracco'];

/* ------------------------------------------------------------------
   Music — every track has its own record
------------------------------------------------------------------- */

type Song = { videoId: string; start: number };

const DEFAULT_SONG: Song = { videoId: 'jcz0YxYl6Ac', start: 0 };
const DEFAULT_TITLE = 'Pink Floyd - Breathe (In The Air)';

// Track number → song and the second it starts at.
const SONGS: Record<string, Song> = {
    A1: { videoId: 'haBeRluizqI', start: 0 },
    A2: { videoId: 'bEoaZc7pY4M', start: 0 },
    A3: { videoId: 'j5AW9nEKYiY', start: 0 },
    B1: { videoId: '5BIElTtN6Fs', start: 0 },
    B2: { videoId: 'ENjrJ_zyeUc', start: 0 },
    B3: { videoId: 'txksGGB60FM', start: 0 },
    B4: { videoId: 'siO6dkqidc4', start: 0 },
    B5: { videoId: 'C96VTjWNM38', start: 0 },
    Bonus: { videoId: 'jcz0YxYl6Ac', start: 0 },
};

const EMAIL = 'juansaracco1212@gmail.com';
// Opens a ready-to-send email in Gmail; works even without a desktop mail app.
const COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent('Hi Juan')}`;

const labelColor = (no: string | null) => (no === null ? 'red' : no.startsWith('A') ? 'red' : no.startsWith('B') ? 'blue' : 'paper');

/* ------------------------------------------------------------------
   Hooks
------------------------------------------------------------------- */

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useReveal(root: RefObject<HTMLDivElement | null>) {
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const targets = el.querySelectorAll('[data-reveal]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute('data-in', '');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        targets.forEach((t) => observer.observe(t));
        return () => observer.disconnect();
    }, [root]);
}

function useActiveSection() {
    const [active, setActive] = useState('home');
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY + window.innerHeight * 0.35;
            let current = 'home';
            SECTIONS.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (el && el.offsetTop <= y) current = id;
            });
            setActive(current);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return active;
}

function useInView(ref: RefObject<HTMLElement | null>) {
    const [inView, setInView] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return inView;
}

type YTPlayer = {
    playVideo(): void;
    pauseVideo(): void;
    loadVideoById(o: { videoId: string; startSeconds: number }): void;
    cueVideoById(o: { videoId: string; startSeconds: number }): void;
    getVideoData(): { title?: string };
};

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        YT?: any;
        onYouTubeIframeAPIReady?: () => void;
    }
}

// A single YouTube player shared by every record.
function useYouTubePlayer(setPlaying: (p: boolean) => void, setTitle: (t: string) => void) {
    const playerRef = useRef<YTPlayer | null>(null);
    const readyRef = useRef(false);
    const pendingRef = useRef<{ action: 'play' } | { action: 'load'; song: Song } | null>(null);

    useEffect(() => {
        const create = () => {
            if (playerRef.current) return;
            playerRef.current = new window.YT.Player('yt-player', {
                width: '200',
                height: '200',
                videoId: DEFAULT_SONG.videoId,
                playerVars: { start: DEFAULT_SONG.start, controls: 0, playsinline: 1, rel: 0 },
                events: {
                    onReady: () => {
                        readyRef.current = true;
                        const pending = pendingRef.current;
                        pendingRef.current = null;
                        if (pending?.action === 'play') playerRef.current?.playVideo();
                        if (pending?.action === 'load')
                            playerRef.current?.loadVideoById({
                                videoId: pending.song.videoId,
                                startSeconds: pending.song.start,
                            });
                    },
                    onStateChange: (e: { data: number }) => {
                        if (e.data === 1) {
                            setPlaying(true);
                            const title = playerRef.current?.getVideoData()?.title;
                            if (title) setTitle(title);
                        }
                        if (e.data === 2 || e.data === 0) setPlaying(false);
                    },
                },
            });
        };

        if (window.YT?.Player) {
            create();
            return;
        }
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            create();
        };
        if (!document.getElementById('yt-api')) {
            const script = document.createElement('script');
            script.id = 'yt-api';
            script.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(script);
        }
    }, [setPlaying, setTitle]);

    return {
        play: () => {
            if (readyRef.current) playerRef.current?.playVideo();
            else pendingRef.current = { action: 'play' };
        },
        pause: () => {
            if (readyRef.current) playerRef.current?.pauseVideo();
            else pendingRef.current = null;
        },
        cue: (song: Song) => {
            if (readyRef.current) playerRef.current?.cueVideoById({ videoId: song.videoId, startSeconds: song.start });
            else pendingRef.current = null;
        },
        load: (song: Song) => {
            if (readyRef.current) playerRef.current?.loadVideoById({ videoId: song.videoId, startSeconds: song.start });
            else pendingRef.current = { action: 'load', song };
        },
    };
}

// Animates a copy of a record from one element to another.
function flyRecord(host: HTMLElement | null, from: Element | null, to: Element | null, label: string, color: string) {
    if (!host || !from || !to || prefersReducedMotion()) return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    if (!a.width || !b.width) return;

    const disc = document.createElement('div');
    disc.className = `flying-disc flying-disc--${color}`;
    disc.innerHTML = `<span>${label}</span>`;
    Object.assign(disc.style, {
        left: `${a.left}px`,
        top: `${a.top}px`,
        width: `${a.width}px`,
        height: `${a.height}px`,
    });
    host.appendChild(disc);

    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const scale = b.width / a.width;

    disc.animate(
        [
            { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
            {
                transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(${(1 + scale) / 2}) rotate(220deg)`,
                offset: 0.5,
            },
            { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(420deg)` },
        ],
        { duration: 850, easing: 'cubic-bezier(0.5, 0, 0.2, 1)' }
    ).onfinish = () => disc.remove();
}

/* ------------------------------------------------------------------
   Page
------------------------------------------------------------------- */

const Portfolio = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLElement>(null);
    const heroRecordRef = useRef<HTMLSpanElement>(null);
    const miniRecordRef = useRef<HTMLSpanElement>(null);

    const [theme, setTheme] = useState<'dark' | 'light'>('light');
    const [menuOpen, setMenuOpen] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [touched, setTouched] = useState(false);
    const [current, setCurrent] = useState<string | null>(null);
    const [title, setTitle] = useState(DEFAULT_TITLE);

    const active = useActiveSection();
    const heroInView = useInView(heroRef);
    const player = useYouTubePlayer(setPlaying, setTitle);

    useReveal(rootRef);

    const deckTarget = () => (heroInView ? heroRecordRef.current : miniRecordRef.current);
    const slot = (no: string) => document.querySelector(`[data-disc="${no}"]`);

    const [toast, setToast] = useState<string | null>(null);
    const [videoOpen, setVideoOpen] = useState(false);
    const videoRef = useRef<HTMLDivElement>(null);
    const videoOriginRef = useRef<DOMRect | null>(null);

    // Transform that shrinks the video back into the box it came from.
    const originTransform = () => {
        const el = videoRef.current;
        const origin = videoOriginRef.current;
        if (!el || !origin) return null;
        const end = el.getBoundingClientRect();
        const dx = origin.left + origin.width / 2 - (end.left + end.width / 2);
        const dy = origin.top + origin.height / 2 - (end.top + end.height / 2);
        const scale = Math.max(origin.width / end.width, 0.08);
        return `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
    };

    // The video grows out of the box that was clicked, already playing.
    const openVideo = (e: ReactMouseEvent<HTMLElement>) => {
        videoOriginRef.current = e.currentTarget.getBoundingClientRect();
        setVideoOpen(true);
        setTouched(true);
        if (!playing) {
            player.play();
            setPlaying(true);
        }
    };

    const closeVideo = () => {
        const el = videoRef.current;
        const from = originTransform();
        if (!el || !from || prefersReducedMotion()) {
            setVideoOpen(false);
            return;
        }
        el.animate(
            [
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: from, opacity: 0 },
            ],
            { duration: 450, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' }
        ).onfinish = () => setVideoOpen(false);
    };

    useLayoutEffect(() => {
        if (!videoOpen || prefersReducedMotion()) return;
        const el = videoRef.current;
        const from = originTransform();
        if (!el || !from) return;
        el.animate(
            [
                { transform: from, opacity: 0.3 },
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            ],
            { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
    }, [videoOpen]);

    useEffect(() => {
        if (!videoOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeVideo();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [videoOpen]);
    const [themeSpin, setThemeSpin] = useState(0);

    // Show what's playing in the browser tab.
    useEffect(() => {
        document.title = playing ? `▶ ${title} · Juan Saracco` : 'Juan Sebastián Saracco · Software Engineer';
    }, [playing, title]);

    useEffect(() => {
        if (!toast) return;
        const t = window.setTimeout(() => setToast(null), 2600);
        return () => window.clearTimeout(t);
    }, [toast]);

    const onEmail = () => {
        navigator.clipboard?.writeText(EMAIL).catch(() => {});
        setToast('Email copied. Opening Gmail…');
    };

    // Flip the record: the new side spreads from the button like a spinning disc,
    // while the old one drops back like a record being lifted off the platter.
    const toggleTheme = (e: ReactMouseEvent<HTMLButtonElement>) => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setThemeSpin((n) => n + 1);
        const doc = document as Document & {
            startViewTransition?: (cb: () => void) => { ready: Promise<void> };
        };
        if (!doc.startViewTransition || prefersReducedMotion()) {
            setTheme(next);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const transition = doc.startViewTransition(() => {
            flushSync(() => setTheme(next));
        });
        transition.ready.then(() => {
            const easing = 'cubic-bezier(0.7, 0, 0.2, 1)';
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${r * 0.18}px at ${x}px ${y}px)`,
                        `circle(${r}px at ${x}px ${y}px)`,
                    ],
                    transform: ['rotate(-25deg)', 'rotate(-12deg)', 'rotate(0deg)'],
                    transformOrigin: [`${x}px ${y}px`, `${x}px ${y}px`, `${x}px ${y}px`],
                },
                { duration: 1100, easing, pseudoElement: '::view-transition-new(root)' }
            );
            document.documentElement.animate(
                {
                    transform: ['scale(1)', 'scale(0.92)'],
                    borderRadius: ['0px', '28px'],
                    opacity: [1, 0.55],
                },
                { duration: 1100, easing, pseudoElement: '::view-transition-old(root)' }
            );
        });
    };

    const togglePlay = () => {
        setTouched(true);
        if (playing) {
            player.pause();
            setPlaying(false);
        } else {
            player.play();
            setPlaying(true);
        }
    };

    // Takes a track's record out, puts it on the deck and returns the previous one.
    const selectTrack = (no: string) => {
        setTouched(true);

        if (current === no) {
            flyRecord(rootRef.current, deckTarget(), slot(no), no, labelColor(no));
            setCurrent(null);
            setTitle(DEFAULT_TITLE);
            player.cue(DEFAULT_SONG);
            setPlaying(false);
            return;
        }

        if (current) flyRecord(rootRef.current, deckTarget(), slot(current), current, labelColor(current));
        flyRecord(rootRef.current, slot(no), deckTarget(), no, labelColor(no));
        setCurrent(no);
        setTitle('Loading…');
        player.load(SONGS[no] ?? DEFAULT_SONG);
        setPlaying(true);
    };

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        setMenuOpen(false);
    };

    let charIndex = 0;

    const renderDisc = (no: string) => (
        <span
            className={`track__disc track__disc--${labelColor(no)}${current === no ? ' is-out' : ''}`}
            data-disc={no}
            aria-hidden="true"
        >
            <span className="track__disc-label">{no === 'Bonus' ? '★' : no}</span>
        </span>
    );

    return (
        <div
            ref={rootRef}
            className={`site has-js${playing ? ' is-playing' : ''}`}
            data-theme={theme}
        >
            {/* --- Nav --- */}
            <header className="nav">
                <div className="wrap nav__inner">
                    <button className="nav__brand" onClick={() => scrollTo('home')} aria-label="Back to top">
                        <span className="nav__disc" aria-hidden="true" />
                        <span>Juan Saracco</span>
                    </button>

                    <div className="now-playing" aria-live="polite">
                        <span className="eq" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <span />
                        </span>
                        <span>{playing ? 'Now playing:' : 'On the deck:'}</span>
                        <button
                            key={title}
                            className="now-playing__title is-changing"
                            onClick={openVideo}
                            title="Watch the video"
                        >
                            {title}
                        </button>
                    </div>

                    <nav className="nav__links" aria-label="Sections">
                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                className="nav__link"
                                aria-current={active === s.id ? 'true' : undefined}
                                onClick={() => scrollTo(s.id)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        className="icon-btn theme-btn"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Flip to the light side' : 'Flip to the dark side'}
                        title="Flip the record"
                    >
                        <span key={themeSpin} className={`theme-btn__icon${themeSpin ? ' is-flipping' : ''}`}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </span>
                    </button>

                    <button
                        className="icon-btn nav__menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-label="Menu"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {menuOpen && (
                    <nav className="mobile-menu" aria-label="Sections">
                        {SECTIONS.map((s) => (
                            <button key={s.id} className="nav__link" onClick={() => scrollTo(s.id)}>
                                {s.label}
                            </button>
                        ))}
                    </nav>
                )}
            </header>

            <main>
                {/* --- Hero --- */}
                <section id="home" className="hero" ref={heroRef}>
                    <div className="wrap hero__grid">
                        <div>
                            <h1 className="hero__name" aria-label="Juan Sebastián Saracco">
                                {NAME_WORDS.map((word) => (
                                    <span className="hero__word" key={word} aria-hidden="true">
                                        {word.split('').map((ch, i) => (
                                            <span
                                                key={i}
                                                className="hero__char"
                                                style={{ '--i': charIndex++ } as CSSProperties}
                                            >
                                                {ch}
                                            </span>
                                        ))}
                                    </span>
                                ))}
                            </h1>

                            <p className="hero__role">
                                <strong>Software Engineer at Hitachi Digital.</strong> React and TypeScript, from pixel to
                                production.
                            </p>

                            <div className="hero__actions">
                                <button className="btn btn--primary" onClick={() => scrollTo('side-b')}>
                                    Listen to Side B
                                </button>
                                <a className="btn" href={resume} target="_blank" rel="noopener noreferrer">
                                    <Download size={18} /> Download CV
                                </a>
                            </div>
                        </div>

                        <Turntable
                            playing={playing}
                            hint={!touched}
                            current={current}
                            recordRef={heroRecordRef}
                            onToggle={togglePlay}
                        />
                    </div>
                </section>

                {/* --- Liner notes --- */}
                <section id="notes" className="section">
                    <div className="wrap notes">
                        <div className="sleeve" data-reveal tabIndex={0} aria-label="Photo of Juan">
                            <div className="sleeve__record" aria-hidden="true" />
                            <div className="sleeve__cover">
                                <img src={profileImage} alt="Line drawing of Juan Sebastián Saracco" />
                            </div>
                        </div>

                        <div className="notes__text">
                            <h2 className="section__title" data-reveal style={{ marginBottom: 32 }}>
                                Liner notes
                            </h2>
                            <p data-reveal style={{ '--d': 1 } as CSSProperties}>
                                I'm a Software Engineer at Hitachi Digital, where I own the frontend of a critical module in
                                Claro's ERP re-engineering.
                            </p>
                            <p data-reveal style={{ '--d': 2 } as CSSProperties}>
                                Before that, at VML, I built pixel-perfect interfaces for Microsoft campaigns reaching
                                millions of users, and led an internal .NET tool that improved the team's delivery metrics.
                                Outside work I ship full products end to end, with CI, quality gates and automatic deploys.
                            </p>
                            <p className="notes__meta" data-reveal style={{ '--d': 3 } as CSSProperties}>
                                Systems Analysis at Escuela Da Vinci, 2024 to 2026. Based in Buenos Aires, Argentine and
                                Italian citizen.
                            </p>
                        </div>
                    </div>
                </section>


                {/* --- Side A: work --- */}
                <section id="side-a" className="section">
                    <div className="wrap">
                        <div className="section__head" data-reveal>
                            <h2 className="section__title">
                                Side A<span className="section__sub">Work</span>
                            </h2>
                            <p className="section__aside">Pick a record to hear it and read the track.</p>
                        </div>

                        <ol className="tracklist">
                            {JOBS.map((job, i) => {
                                const open = current === job.no;
                                return (
                                    <li
                                        key={job.no}
                                        className={`track${open ? ' is-open' : ''}`}
                                        data-reveal
                                        style={{ '--d': i } as CSSProperties}
                                    >
                                        <button
                                            className="track__row"
                                            aria-expanded={open}
                                            aria-controls={`panel-${job.no}`}
                                            onClick={() => selectTrack(job.no)}
                                        >
                                            <span className="track__no">{job.no}</span>
                                            <span className="track__title">
                                                {job.role}
                                                <span className="track__meta">
                                                    {job.company}
                                                    <span className="track__period-inline">, {job.period}</span>
                                                </span>
                                            </span>
                                            <span className="track__period">{job.period}</span>
                                            <span className="track__sleeve">{renderDisc(job.no)}</span>
                                        </button>
                                        <div className="track__panel" id={`panel-${job.no}`}>
                                            <div className="track__panel-inner">
                                                <div className="track__body">
                                                    <ul>
                                                        {job.bullets.map((b) => (
                                                            <li key={b}>{b}</li>
                                                        ))}
                                                    </ul>
                                                    <ul className="stack" aria-label="Stack">
                                                        {job.stack.map((s) => (
                                                            <li key={s}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* --- Side B: projects --- */}
                <section id="side-b" className="section">
                    <div className="wrap">
                        <div className="section__head" data-reveal>
                            <h2 className="section__title">
                                Side B<span className="section__sub">Projects</span>
                            </h2>
                            <p className="section__aside">Things I built outside work. Each one has its own song.</p>
                        </div>

                        <ol className="tracklist">
                            {PROJECTS.map((p, i) => {
                                const open = current === p.no;
                                return (
                                    <li
                                        key={p.no}
                                        className={`track${open ? ' is-open' : ''}${p.bonus ? ' track--bonus' : ''}`}
                                        data-reveal
                                        style={{ '--d': i } as CSSProperties}
                                    >
                                        <button
                                            className="track__row"
                                            aria-expanded={open}
                                            aria-controls={`panel-${p.no}`}
                                            onClick={() => selectTrack(p.no)}
                                        >
                                            <span className="track__no">{p.no}</span>
                                            <span className="track__title">
                                                {p.title}
                                                <span className="track__meta">{p.summary}</span>
                                            </span>
                                            <span className="track__period">{p.bonus ? 'Hidden track' : ''}</span>
                                            <span className="track__sleeve">{renderDisc(p.no)}</span>
                                        </button>
                                        <div className="track__panel" id={`panel-${p.no}`}>
                                            <div className="track__panel-inner">
                                                <div className="track__body">
                                                    {p.details.map((d) => (
                                                        <p key={d}>{d}</p>
                                                    ))}
                                                    {p.partner && (
                                                        <p>
                                                            Built with{' '}
                                                            <a
                                                                className="text-link"
                                                                href={p.partner.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {p.partner.name}
                                                            </a>
                                                            .
                                                        </p>
                                                    )}
                                                    <ul className="stack" aria-label="Stack">
                                                        {p.stack.map((s) => (
                                                            <li key={s}>{s}</li>
                                                        ))}
                                                    </ul>
                                                    {(p.code || p.live) && (
                                                        <div className="track__links">
                                                            {p.live && (
                                                                <a
                                                                    className="text-link"
                                                                    href={p.live}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Open the live app <ArrowUpRight size={16} />
                                                                </a>
                                                            )}
                                                            {p.code && (
                                                                <a
                                                                    className="text-link"
                                                                    href={p.code}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Github size={16} /> See the code
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* --- Gear --- */}
                <section id="gear" className="section">
                    <div className="wrap">
                        <div className="section__head" data-reveal>
                            <h2 className="section__title">Gear</h2>
                            <p className="section__aside">What I record with, day to day.</p>
                        </div>
                        <div className="credits">
                            {GEAR.map((g, i) => (
                                <div key={g.title} data-reveal style={{ '--d': i } as CSSProperties}>
                                    <h3>{g.title}</h3>
                                    <ul>
                                        {g.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Contact --- */}
                <section id="contact" className="contact">
                    <div className="wrap">
                        <h2 className="section__title" data-reveal style={{ marginBottom: 20 }}>
                            Let's talk
                        </h2>
                        <p className="contact__lead" data-reveal style={{ '--d': 1 } as CSSProperties}>
                            Got a role, a project or a question? Write to me and I'll get back to you.
                        </p>
                        <a
                            className="contact__mail"
                            href={COMPOSE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onEmail}
                            data-reveal
                            style={{ '--d': 2 } as CSSProperties}
                        >
                            {EMAIL}
                        </a>
                        <div className="contact__links" data-reveal style={{ '--d': 3 } as CSSProperties}>
                            <a
                                className="icon-btn"
                                href={COMPOSE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={onEmail}
                                aria-label="Send me an email"
                            >
                                <Mail size={18} />
                            </a>
                            <a
                                className="icon-btn"
                                href="https://github.com/saracco-juan"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                className="icon-btn"
                                href="https://www.linkedin.com/in/juan-saracco/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- Mini deck: follows you once the big turntable is out of view --- */}
            <aside className={`mini-deck${heroInView ? '' : ' is-visible'}`} aria-label="Player">
                <button
                    className="mini-deck__record"
                    onClick={() => (current ? scrollTo(current.startsWith('A') ? 'side-a' : 'side-b') : scrollTo('home'))}
                    aria-label="Go to the track on the deck"
                >
                    <span className="mini-deck__disc" ref={miniRecordRef}>
                        <span className={`mini-deck__label label--${labelColor(current)}`}>
                            {current === 'Bonus' ? '★' : current ?? 'JS'}
                        </span>
                    </span>
                </button>
                <button className="mini-deck__text" onClick={openVideo} title="Watch the video">
                    <span className="mini-deck__state">{playing ? 'Now playing · tap to watch' : 'On the deck · tap to watch'}</span>
                    <span className="mini-deck__title">{title}</span>
                </button>
                <button
                    className="deck__play mini-deck__play"
                    onClick={togglePlay}
                    aria-label={playing ? 'Pause' : 'Play'}
                    aria-pressed={playing}
                >
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
            </aside>

            <div className={`toast${toast ? ' is-visible' : ''}`} role="status">
                {toast}
            </div>

            {/* The YouTube player: tucked away, or opened as a video when the song title is clicked */}
            <div
                className={`video-backdrop${videoOpen ? ' is-open' : ''}`}
                onClick={closeVideo}
                aria-hidden="true"
            />
            <div
                ref={videoRef}
                className={`yt-frame${videoOpen ? ' is-open' : ''}`}
                role={videoOpen ? 'dialog' : undefined}
                aria-label={videoOpen ? title : undefined}
                aria-hidden={!videoOpen}
            >
                <div className="yt-frame__screen">
                    <div id="yt-player" />
                </div>
                {videoOpen && (
                    <div className="yt-frame__bar">
                        <span className="yt-frame__title">{title}</span>
                        <button className="icon-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                            {playing ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button className="icon-btn" onClick={closeVideo} aria-label="Close the video">
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            <footer className="footer">
                <div className="wrap">Designed and built by Juan Sebastián Saracco with React and TypeScript.</div>
            </footer>
        </div>
    );
};

/* ------------------------------------------------------------------
   Turntable
------------------------------------------------------------------- */

type TurntableProps = {
    playing: boolean;
    hint: boolean;
    current: string | null;
    recordRef: RefObject<HTMLSpanElement | null>;
    onToggle: () => void;
};

const Turntable = ({ playing, hint, current, recordRef, onToggle }: TurntableProps) => (
    <div className="deck">
        <div className="platter">
            <button
                className="record"
                onClick={onToggle}
                aria-label={playing ? 'Stop the record' : 'Play the record'}
                aria-pressed={playing}
            >
                <span className="record__disc" aria-hidden="true" ref={recordRef}>
                    <span className={`record__label label--${labelColor(current)}`}>
                        <span className="record__label-text">
                            <span className="record__label-mono">{current === 'Bonus' ? '★' : current ?? 'JS'}</span>
                            <span className="record__label-small">
                                {current ? (current.startsWith('A') ? 'Side A' : 'Side B') : 'Juan Saracco'}
                            </span>
                        </span>
                    </span>
                    <span className="record__hole" />
                </span>
                <span className="record__sheen" aria-hidden="true" />
            </button>
        </div>

        <div className="tonearm" aria-hidden="true">
            <span className="tonearm__pivot" />
            <span className="tonearm__arm" />
            <span className="tonearm__head" />
        </div>

        <div className="deck__controls">
            <span className="deck__led" aria-hidden="true" />
            <button
                className={`deck__play${hint ? ' is-hint' : ''}`}
                onClick={onToggle}
                aria-label={playing ? 'Pause' : 'Play'}
                aria-pressed={playing}
            >
                {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
        </div>
    </div>
);

export default Portfolio;
