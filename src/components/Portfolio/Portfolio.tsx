import React, { useState, useEffect } from 'react';
import {
    Github,
    Linkedin,
    Mail,
    Moon,
    Sun,
    ArrowRight,
    ExternalLink,
    Dumbbell,
    Menu,
    X,
    ChevronDown,
    Book,
    DollarSign
} from 'lucide-react';
import profileImage from '../../assets/juan-4x4.jpg';
import resume from '../../assets/juan-cv.jpeg';

const Portfolio = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    // Toggle Dark Mode
    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    // Scroll Spy for Active Section
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'about', 'projects', 'experience', 'skills', 'contact'];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Smooth Scroll
    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>

            {/* --- Header / Navigation --- */}
            <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div
                        className="text-xl font-bold tracking-tight cursor-pointer flex items-center gap-2 group"
                        onClick={() => scrollTo('home')}
                    >
                        <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold group-hover:scale-105 transition-transform">JS</span>
                        <span className="hidden sm:block">Juan Sebastián Saracco</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        {['About', 'Projects', 'Experience', 'Skills', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollTo(item.toLowerCase())}
                                className={`hover:text-blue-500 transition-colors ${activeSection === item.toLowerCase() ? 'text-blue-500' : (darkMode ? 'text-zinc-400' : 'text-zinc-600')}`}
                            >
                                {item}
                            </button>
                        ))}
                        <div className="w-px h-4 bg-zinc-700 mx-2"></div>
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleTheme} className={darkMode ? 'text-zinc-400' : 'text-zinc-600'}>
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={darkMode ? 'text-zinc-100' : 'text-zinc-900'}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                {isMenuOpen && (
                    <div className={`md:hidden absolute w-full border-b ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                        <div className="flex flex-col p-6 gap-4">
                            {['About', 'Projects', 'Experience', 'Skills', 'Contact'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => scrollTo(item.toLowerCase())}
                                    className="text-left py-2 text-lg font-medium hover:text-blue-500"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* --- Hero Section --- */}
            <section id="home" className="pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-6 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Available for new opportunities
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 animate-fade-in-up delay-100">
                        <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                            Juan Sebastian
                        </span> <br />
                        Front-End Developer
                    </h1>

                    <p className={`text-xl md:text-2xl max-w-2xl leading-relaxed mb-10 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'} animate-fade-in-up delay-200`}>
                        Engineering scalable, high-performance web applications. I combine clean code with modern design principles to deliver seamless user experiences. Currently crafting solutions at GlobalLogic for Claro LATAM.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                        <button
                            onClick={() => scrollTo('projects')}
                            className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            View Projects <ArrowRight size={18} />
                        </button>
                        <a
                            href={resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-8 py-4 rounded-full border font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 ${darkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'}`}
                        >
                            View Resume <ExternalLink size={18} />
                        </a>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* --- About Section --- */}
            <section id="about" className={`py-24 px-6 ${darkMode ? 'bg-zinc-900/30' : 'bg-zinc-100/50'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-blue-500">01.</span> About Me
                    </h2>

                    <div className="grid md:grid-cols-5 gap-12 items-start">
                        <div className="md:col-span-2">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-800 relative group">
                                {/* Placeholder for Profile Image */}
                                <div className="absolute inset-0 opacity-20 group-hover:opacity-10 transition-opacity"></div>
                                <div className="w-full flex items-center justify-center">
                                    <img src={profileImage} alt="Profile" className="w-full object-cover" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-6 text-lg leading-relaxed">
                            <p className={darkMode ? 'text-zinc-300' : 'text-zinc-600'}>
                                I started programming in 2022 out of curiosity and a lifelong interest in computers. I began learning on my own by reading books like You Don’t Know JS, Clean Code, The Pragmatic Programmer, and Java by Deitel, which gave me a strong foundation in core concepts and good development practices from day one.
                            </p>
                            <p className={darkMode ? 'text-zinc-300' : 'text-zinc-600'}>
                                After that, I enrolled in several courses on HTML, CSS, and JavaScript, and that’s when I realized I wanted to take this seriously. I then joined a full-stack bootcamp, where I worked with Java for the backend, MySQL for databases, and React for the frontend.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 space-y-6 text-lg leading-relaxed">
                        <p className={darkMode ? 'text-zinc-300' : 'text-zinc-600'}>
                            Later, I decided to deepen my technical path and started studying to become a Systems Analyst.
                        </p>
                        <p className={darkMode ? 'text-zinc-300' : 'text-zinc-600'}>
                            That journey led me to my first job as an Email Developer at VML for Microsoft. There, I strengthened my skills in HTML, CSS, and JavaScript, and learned a lot about teamwork, production workflows, quality standards, and tools like AEM, Marketo, and Salesforce Marketing Cloud. I also led an internal project —a .NET application— that significantly improved key metrics for Microsoft’s email development processes.
                        </p>
                        <p className={darkMode ? 'text-zinc-300' : 'text-zinc-600'}>
                            That growth opened the door to my current role as a Front-End Developer at GlobalLogic, where I work with React, TypeScript, and modern web technologies —including microfrontends— to build scalable, high-quality user interfaces.
                        </p>
                    </div>
                </div>
            </section>

            {/* --- Projects Section --- */}
            <section id="projects" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-blue-500">02.</span> Featured Projects
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Project 1 */}
                        <ProjectCard
                            title="Buenas Lecturas"
                            description="A Java desktop application designed with MVC, DAO, and service-layer patterns. It includes user login, session management, persistent storage with MySQL, and a Swing-based UI for browsing, adding, and managing books. Developed as part of my academic journey to strengthen architecture, clean code, and software design principles."
                            tags={['JAVA', 'Spring Boot', 'MySQL', 'HTML', 'CSS', 'Maven', 'API Rest']}
                            darkMode={darkMode}
                            icon={<Book size={40} className="text-orange-500" />}
                            gitHubLink="https://github.com/saracco-juan/BuenasLecturas"
                            externalLink="https://github.com/saracco-juan/BuenasLecturas"
                            partnerLink=""
                            partnerName=""
                        />

                        {/* Project 2 */}
                        <ProjectCard
                            title="One Up Gym"
                            description="A Laravel-based class scheduling system. It implements recurrent weekly classes, dynamic time-slot generation, database-driven persistence, user roles, and strict validation for overlapping bookings. Built with Blade templates, service-layer logic, and clean architecture principles."
                            tags={['Laravel', 'Blade', 'MySQL', 'Team Project', 'API Rest']}
                            darkMode={darkMode}
                            icon={<Dumbbell size={40} className="text-blue-500" />}
                            gitHubLink="https://github.com/marianogiardina/OneUpGym"
                            externalLink="https://github.com/marianogiardina/OneUpGym"
                            partnerLink="https://github.com/marianogiardina"
                            partnerName="Mariano Giardina"
                        />

                        {/* Project 3 */}
                        <ProjectCard
                            title="Yenny Library"
                            description="A full-featured library management platform built with Python, Flask, Jinja, and SQLite. It includes book inventory management, authors, categories, user authentication, and loan/return workflows. Designed with a clean MVC-like structure using Blueprints, service logic, and database models to ensure scalability and maintainability. Features secure session handling, form validation, and a modular template system powered by Jinja."
                            tags={['Python', 'Flask', 'Jinja', 'SQLite', 'Team Project']}
                            darkMode={darkMode}
                            icon={<Book size={40} className="text-emerald-500" />}
                            gitHubLink="https://github.com/marianogiardina/yenny-ayms"
                            externalLink="https://trello.com/b/DatryRwM/yenny-parcial-ayms"
                            partnerLink="https://github.com/marianogiardina"
                            partnerName="Mariano Giardina"
                        />

                        {/* Project 4 */}
                        <ProjectCard
                            title="Dolar App"
                            description="A currency-tracking web app that consumes public APIs to display official, blue, MEP, and other dollar exchange rates in Argentina. Built with a component-based architecture, clean state management, reusable UI patterns, error handling, and loading states. Focused on improving API integration, formatting utilities, asynchronous flows, and responsive UI behaviors."
                            tags={['HTML', 'CSS', 'JavaScript', 'API Rest']}
                            darkMode={darkMode}
                            icon={<DollarSign size={40} className="text-green-500" />}
                            gitHubLink="https://github.com/juan-saracco/Dolar-APP"
                            externalLink="https://dolar-app.netlify.app/"
                            partnerLink=""
                            partnerName=""
                        />
                    </div>

                    <div className="mt-8 p-8 rounded-2xl border transition-colors hover:border-blue-500/50 group relative overflow-hidden"
                        style={{
                            backgroundColor: darkMode ? 'rgba(24, 24, 27, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                            borderColor: darkMode ? '#27272a' : '#e4e4e7'
                        }}>
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Enterprise Email Campaigns</h3>
                                <p className={`max-w-2xl ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    Developed 50+ high-fidelity, responsive HTML emails for Microsoft campaigns using AEM and SFMC.
                                    Ensured compatibility across 30+ email clients including Outlook Desktop and Gmail.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-md text-sm font-medium ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>HTML/CSS</span>
                                <span className={`px-3 py-1 rounded-md text-sm font-medium ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>MJML</span>
                                <span className={`px-3 py-1 rounded-md text-sm font-medium ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>Litmus</span>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </section>

            {/* --- Experience Section --- */}
            <section id="experience" className={`py-24 px-6 ${darkMode ? 'bg-zinc-900/30' : 'bg-zinc-100/50'}`}>
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-blue-500">03.</span> Experience
                    </h2>

                    <div className="space-y-12 relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 md:ml-6 pl-8 md:pl-12">

                        <ExperienceItem
                            role="Front-End / Email Developer"
                            company="VML (Microsoft Client)"
                            period="2022 - Present"
                            description={[
                                "Developing responsive UI components for Microsoft web properties.",
                                "Managing end-to-end email production cycles using SFMC and Marketo.",
                                "Collaborating with design teams to ensure technical feasibility of layouts.",
                                "Mentoring junior developers on HTML best practices."
                            ]}
                            current={true}
                            darkMode={darkMode}
                        />

                        <ExperienceItem
                            role="Freelance Web Developer"
                            company="Self-Employed"
                            period="2020 - 2022"
                            description={[
                                "Built custom React websites for small businesses (e.g. Óptica Saracco).",
                                "Implemented SEO optimizations improving client visibility.",
                                "Translated Figma designs into functional code."
                            ]}
                            darkMode={darkMode}
                            current={false}
                        />

                        <ExperienceItem
                            role="Systems Analyst Student"
                            company="Academic Projects"
                            period="2019 - 2022"
                            description={[
                                "Specialized in Object Oriented Programming (Java) and Database Design.",
                                "Led team projects for final year capstone."
                            ]}
                            darkMode={darkMode}
                            current={false}
                        />
                    </div>
                </div>
            </section>

            {/* --- Skills Section --- */}
            <section id="skills" className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-blue-500">04.</span> Technical Skills
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <SkillCard
                            title="Front-End Core"
                            skills={['React JS', 'JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3/SASS', 'Tailwind CSS']}
                            darkMode={darkMode}
                        />
                        <SkillCard
                            title="Email Engineering"
                            skills={['Salesforce MC', 'Adobe Experience Manager', 'Marketo', 'Litmus', 'MJML', 'Responsive HTML']}
                            darkMode={darkMode}
                        />
                        <SkillCard
                            title="Backend & Tools"
                            skills={['Node.js', 'Express', 'Java', 'Spring Boot', 'Git / GitHub', 'Figma']}
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </section>

            {/* --- Contact Section --- */}
            <section id="contact" className="py-32 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-blue-500 font-medium mb-4">05. What's Next?</h2>
                    <h3 className="text-4xl md:text-5xl font-bold mb-6">Let's Work Together</h3>
                    <p className={`text-lg mb-10 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        I am currently looking for new opportunities to leverage my React and UI skills in a challenging environment. Whether you have a question or just want to say hi, my inbox is always open.
                    </p>

                    <a
                        href="mailto:hello@juansaracco.com"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-colors text-lg font-medium"
                    >
                        <Mail size={20} /> Say Hello
                    </a>

                    <div className="mt-16 flex justify-center gap-8">
                        <SocialLink href="#" icon={<Github size={24} />} label="GitHub" darkMode={darkMode} />
                        <SocialLink href="#" icon={<Linkedin size={24} />} label="LinkedIn" darkMode={darkMode} />
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className={`py-8 text-center text-sm ${darkMode ? 'text-zinc-600 bg-zinc-950' : 'text-zinc-400 bg-zinc-50'}`}>
                <p>Designed & Built by Juan Sebastián Saracco</p>
                <p className="mt-2 text-xs opacity-70">React · Tailwind CSS · Lucide Icons</p>
            </footer>

        </div>
    );
};

/* --- Sub-Components --- */

const ProjectCard = ({ title, description, tags, darkMode, icon, gitHubLink, externalLink, partnerLink, partnerName }) => (
    <div
        className={`flex flex-col group relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${darkMode
            ? 'bg-zinc-900 border-zinc-800 hover:border-blue-500/50 hover:shadow-blue-900/10'
            : 'bg-white border-zinc-200 hover:border-blue-400 hover:shadow-blue-200/20'
            }`}
    >
        <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                {icon}
            </div>
            <div className="flex gap-4">
                <a href={gitHubLink} target="_blank" className={`transition-colors ${darkMode ? 'text-zinc-400 hover:text-blue-400' : 'text-zinc-500 hover:text-blue-600'}`}>
                    <Github size={20} />
                </a>
                <a href={externalLink} target="_blank" className={`transition-colors ${darkMode ? 'text-zinc-400 hover:text-blue-400' : 'text-zinc-500 hover:text-blue-600'}`}>
                    <ExternalLink size={20} />
                </a>
            </div>
        </div>

        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors">{title}</h3>
        <p className={`mb-6 text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {description} <br /> {partnerLink && <span className="text-blue-500">(This project was developed together with <a href={partnerLink} target="_blank">{partnerName}</a>)</span>}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
            {tags.map((tag, i) => (
                <span
                    key={i}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                        }`}
                >
                    {tag}
                </span>
            ))}
        </div>
    </div>
);

const ExperienceItem = ({ role, company, period, description, current, darkMode }) => (
    <div className="relative">
        <span className={`absolute -left-[41px] md:-left-[57px] top-1 h-5 w-5 rounded-full border-4 ${current
            ? 'bg-blue-500 border-blue-900'
            : (darkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-zinc-300')
            }`}></span>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
            <h3 className="text-xl font-bold">{role}</h3>
            <span className={`text-sm font-mono ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{period}</span>
        </div>

        <h4 className="text-blue-500 font-medium mb-4">{company}</h4>

        <ul className={`space-y-2 list-disc list-inside ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {description.map((item, index) => (
                <li key={index} className="text-sm md:text-base">{item}</li>
            ))}
        </ul>
    </div>
);

const SkillCard = ({ title, skills, darkMode }) => (
    <div className={`p-6 rounded-2xl ${darkMode ? 'bg-zinc-900/50' : 'bg-white border border-zinc-100'}`}>
        <h3 className="text-lg font-bold mb-4 text-blue-500">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
                <span
                    key={skill}
                    className={`px-3 py-2 text-sm rounded-md transition-all hover:scale-105 cursor-default ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        }`}
                >
                    {skill}
                </span>
            ))}
        </div>
    </div>
);

const SocialLink = ({ href, icon, label, darkMode }) => (
    <a
        href={href}
        className={`group flex flex-col items-center gap-2 transition-colors ${darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}
    >
        <div className="p-3 rounded-full transition-all group-hover:-translate-y-1 group-hover:shadow-lg bg-transparent group-hover:bg-blue-500 group-hover:text-white">
            {icon}
        </div>
        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
    </a>
);

export default Portfolio;