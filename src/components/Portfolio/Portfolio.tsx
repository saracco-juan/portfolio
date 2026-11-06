import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
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
    Plus,
    Sun,
    X,
} from 'lucide-react';
import profileImage from '../../assets/juan-4x4.jpg';
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

type Song = { videoId: string; start: number; title: string; artist: string };

// The record that plays by default. Each track will get its own song later.
const DEFAULT_SONG: Song = { videoId: 'jcz0YxYl6Ac', start: 0, title: 'Breathe (In the Air)', artist: 'Pink Floyd' };

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
                        entry.target.classList.add('is-in');
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

type YTPlayer = { playVideo(): void; pauseVideo(): void };

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        YT?: any;
        onYouTubeIframeAPIReady?: () => void;
    }
}

// Loads a YouTube player for the song and keeps `playing` in sync with it.
function useYouTubePlayer(song: Song, setPlaying: (p: boolean) => void) {
    const playerRef = useRef<YTPlayer | null>(null);
    const readyRef = useRef(false);
    const wantsPlayRef = useRef(false);

    useEffect(() => {
        const create = () => {
            if (playerRef.current) return;
            playerRef.current = new window.YT.Player('yt-player', {
                width: '200',
                height: '200',
                videoId: song.videoId,
                playerVars: { start: song.start, controls: 0, playsinline: 1, rel: 0 },
                events: {
                    onReady: () => {
                        readyRef.current = true;
                        if (wantsPlayRef.current) playerRef.current?.playVideo();
                    },
                    onStateChange: (e: { data: number }) => {
                        if (e.data === 1) setPlaying(true);
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
    }, [song, setPlaying]);

    return {
        play: () => {
            wantsPlayRef.current = true;
            if (readyRef.current) playerRef.current?.playVideo();
        },
        pause: () => {
            wantsPlayRef.current = false;
            if (readyRef.current) playerRef.current?.pauseVideo();
        },
    };
}

/* ------------------------------------------------------------------
   Page
------------------------------------------------------------------- */

const Portfolio = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>(() =>
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    );
    const [playing, setPlaying] = useState(false);
    const [touched, setTouched] = useState(false);
    const song = DEFAULT_SONG;
    const player = useYouTubePlayer(song, setPlaying);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openJob, setOpenJob] = useState<string | null>('A1');
    const [openProject, setOpenProject] = useState<string | null>('B1');
    const active = useActiveSection();

    useReveal(rootRef);

    // Browsers block autoplay with sound, so the record starts on the first click.
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

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        setMenuOpen(false);
    };

    const songLabel = `${song.title}, ${song.artist}`;

    let charIndex = 0;

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
                        <span key={songLabel} className="now-playing__title is-changing">
                            {songLabel}
                        </span>
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
                        className="icon-btn"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
                <section id="home" className="hero">
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

                        <Turntable playing={playing} hint={!touched} onToggle={togglePlay} />
                    </div>
                </section>

                {/* --- Liner notes --- */}
                <section id="notes" className="section">
                    <div className="wrap notes">
                        <div className="sleeve" data-reveal tabIndex={0} aria-label="Photo of Juan">
                            <div className="sleeve__record" aria-hidden="true" />
                            <div className="sleeve__cover">
                                <img src={profileImage} alt="Juan Sebastián Saracco" />
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
                            <p className="section__aside">Three jobs, from email campaigns to an enterprise ERP.</p>
                        </div>

                        <ol className="tracklist">
                            {JOBS.map((job, i) => {
                                const open = openJob === job.no;
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
                                            onClick={() => setOpenJob(open ? null : job.no)}
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
                                            <span className="track__toggle" aria-hidden="true">
                                                <Plus size={16} />
                                            </span>
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
                            <p className="section__aside">Things I built outside work. Open a track to see the details.</p>
                        </div>

                        <ol className="tracklist">
                            {PROJECTS.map((p, i) => {
                                const open = openProject === p.no;
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
                                            onClick={() => setOpenProject(open ? null : p.no)}
                                        >
                                            <span className="track__no">{p.no}</span>
                                            <span className="track__title">
                                                {p.title}
                                                <span className="track__meta">{p.summary}</span>
                                            </span>
                                            <span className="track__period">{p.bonus ? 'Hidden track' : ''}</span>
                                            <span className="track__toggle" aria-hidden="true">
                                                <Plus size={16} />
                                            </span>
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
                            href="mailto:juansaracco1212@gmail.com"
                            data-reveal
                            style={{ '--d': 2 } as CSSProperties}
                        >
                            juansaracco1212@gmail.com
                        </a>
                        <div className="contact__links" data-reveal style={{ '--d': 3 } as CSSProperties}>
                            <a className="icon-btn" href="mailto:juansaracco1212@gmail.com" aria-label="Email">
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

            <div className="yt-frame" aria-hidden="true">
                <div id="yt-player" />
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

const Turntable = ({ playing, hint, onToggle }: { playing: boolean; hint: boolean; onToggle: () => void }) => (
    <div className="deck">
        <div className="platter">
            <button
                className="record"
                onClick={onToggle}
                aria-label={playing ? 'Stop the record' : 'Play the record'}
                aria-pressed={playing}
            >
                <span className="record__disc" aria-hidden="true">
                    <span className="record__label">
                        <span className="record__label-text">
                            <span className="record__label-mono">JS</span>
                            <span className="record__label-small">Side A</span>
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
