import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  Download,
  Github,
  Linkedin,
  Code2,
  Asterisk,
  X,
  Menu,
  Copy,
  Check,
  MapPin,
  Terminal,
  Braces,
  Atom,
  Layers,
  Globe,
  Database,
  Server,
  Cpu,
  Cloud,
  Container,
  GitBranch,
  ScanText,
  Eye,
  Mic,
  Sparkles,
  GraduationCap,
  Award,
  ExternalLink,
  Send,
  ChevronRight,
  Workflow,
  Boxes,
  Command,
} from "lucide-react";
import { profile, projects } from "./projects";
import { toolkitGroups, technologyLogos } from "./toolkit";
import SignatureCursor from "./SignatureCursor";
import { HeroArtifact, StackPlayground } from "./ArtifactScene";
import ThemeToggle, { useTheme } from "./ThemeToggle";
import MotionDesign, { HeadingLine, FilterRail } from "./MotionDesign";
import LocationJourney from "./LocationJourney";
import { warmLocationAssets } from "./location-data";

const navItems = [
  ["work", "Work"],
  ["about", "About"],
  ["toolkit", "Toolkit"],
  ["contact", "Contact"],
];
const filters = [
  ["all", "All projects"],
  ["ai", "AI-powered"],
  ["fullstack", "Full-stack"],
  ["realtime", "Real-time"],
];

function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.07, rootMargin: "0px 0px -25px 0px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function SectionLabel({ number, children, light = false }) {
  return (
    <div className={`section-label ${light ? "on-dark" : ""}`}>
      <span className="section-number">{number}</span>
      <span>{children}</span>
    </div>
  );
}

function External({ href, children, className = "", ...props }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

function Clock() {
  const getTime = () =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  const [time, setTime] = useState(getTime);
  useEffect(() => {
    const timer = setInterval(() => setTime(getTime()), 30000);
    return () => clearInterval(timer);
  }, []);
  return <span>{time} IST</span>;
}

function Header({ active, scrolled, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === "Tab") {
        const links = [
          ...document.querySelectorAll(".nav-actions button, .nav-actions a"),
          ...menuRef.current.querySelectorAll("a"),
        ].filter((element) => element.getClientRects().length > 0);
        const first = links[0];
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth > 850) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);
  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="reading-progress" aria-hidden="true" />
        <div className="container nav-container">
          <a
            className="brand"
            href="#home"
            aria-label="Rishabh, back to home"
            onClick={() => setMenuOpen(false)}
          >
            rishabh
            <span className="brand-star">
              <Asterisk strokeWidth={2.7} />
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={active === id ? "active" : ""}
                aria-current={active === id ? "location" : undefined}
              >
                {label}
                <span />
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <a href="#contact" className="nav-cta">
              Let’s talk <ArrowUpRight size={17} />
            </a>
            <button
              ref={toggleRef}
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <div className="mobile-menu-shell">
          <button
            className="menu-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
            tabIndex={-1}
          />
          <nav
            ref={menuRef}
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            <span className="eyebrow">TAKE A LOOK AROUND</span>
            {navItems.map(([id, label], i) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                <span>
                  <small>0{i + 1}</small>
                  {label}
                </span>
                <ArrowUpRight />
              </a>
            ))}
            <a
              className="mobile-resume"
              href={profile.resume}
              download="Rishabh-Kumar-Resume.pdf"
              onClick={() => setMenuOpen(false)}
            >
              Download resume <Download size={18} />
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

function Hero() {
  const artifactRef = useRef(null);
  return (
    <section
      className="hero container"
      id="home"
      aria-labelledby="hero-heading"
    >
      <div className="hero-main">
        <div className="hero-copy">
          <div className="hero-intro hero-enter">
            <span className="intro-line" />
            HELLO WORLD, I’M RISHABH <span className="hello-spark">✳</span>
          </div>
          <h1 id="hero-heading" className="hero-enter delay-1">
            <HeadingLine>Built with logic.</HeadingLine>
            <HeadingLine index={1}>
              <em>Made to matter.</em>
              <span className="title-dot" aria-hidden="true">
                ✳
              </span>
            </HeadingLine>
          </h1>
          <p className="hero-description hero-enter delay-2">
            A full-stack developer with a curious mind. I turn complex problems
            into thoughtful web experiences—with a little help from AI.
          </p>
          <div className="hero-actions hero-enter delay-3">
            <a className="button button-dark" href="#work">
              Explore my work{" "}
              <span className="button-icon">
                <ArrowDown size={18} />
              </span>
            </a>
            <a
              className="resume-link"
              href={profile.resume}
              download="Rishabh-Kumar-Resume.pdf"
            >
              Download résumé <Download size={17} />
            </a>
          </div>
          <div className="hero-socials hero-enter delay-4">
            <External href={profile.github} aria-label="Rishabh on GitHub">
              <Github size={17} />
              <span>GitHub</span>
              <ArrowUpRight size={12} />
            </External>
            <span className="social-divider" />
            <External href={profile.linkedin} aria-label="Rishabh on LinkedIn">
              <Linkedin size={17} />
              <span>LinkedIn</span>
              <ArrowUpRight size={12} />
            </External>
            <span className="social-divider" />
            <External href={profile.leetcode} aria-label="Rishabh on LeetCode">
              <Code2 size={18} />
              <span>LeetCode</span>
              <ArrowUpRight size={12} />
            </External>
          </div>
        </div>
        <div className="hero-art hero-enter delay-2 hero-art-live">
          <div className="art-topnote">
            <span className="status-dot" />
            CURIOUS BY DEFAULT
          </div>
          <HeroArtifact ref={artifactRef} />
          <span className="art-cross cross-one" aria-hidden="true">
            +
          </span>
          <span className="art-cross cross-two" aria-hidden="true">
            +
          </span>
          <button
            type="button"
            className="orbit-stamp"
            aria-label="Unfold or assemble the orbit sculpture"
            onClick={() => artifactRef.current?.unfold()}
          >
            <svg viewBox="0 0 100 100" className="stamp-type">
              <defs>
                <path
                  id="stamp-circle"
                  d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
                />
              </defs>
              <text>
                <textPath href="#stamp-circle" textLength="219">
                  ALWAYS LEARNING · ALWAYS BUILDING ·{" "}
                </textPath>
              </text>
            </svg>
            <Asterisk size={36} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="hero-baseline hero-enter delay-4">
        <a href="#work" className="scroll-hint">
          <span className="scroll-icon">
            <ArrowDown size={14} />
          </span>
          SCROLL TO EXPLORE
        </a>
        <div className="hero-disciplines">
          <span>FULL-STACK DEVELOPMENT</span>
          <Asterisk size={13} />
          <span>AI & AUTOMATION</span>
        </div>
        <div className="location">
          <MapPin size={13} />
          <span>VELLORE, IN</span>
          <span className="location-time">
            <span className="tiny-divider" />
            <Clock />
          </span>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, wide, onOpen, index }) {
  return (
    <article
      className={`project-card ${wide ? "project-wide" : ""}`}
      style={{ "--card-index": index }}
    >
      <button
        className={`project-media media-${project.id}`}
        onClick={() => onOpen(project)}
        aria-label={`Explore ${project.name}, ${project.category}`}
      >
        <img
          src={project.image}
          alt={project.alt}
          loading="lazy"
          width="1200"
          height="780"
        />
        <span className="media-index" aria-hidden="true">
          /{project.number}
        </span>
        <span className="media-open" aria-hidden="true">
          <ArrowUpRight size={22} />
        </span>
      </button>
      <div className="project-info">
        <div className="project-category">{project.category}</div>
        <div className="project-title-row">
          <h3>
            <button onClick={() => onOpen(project)}>{project.name}</button>
          </h3>
          <button
            className="project-arrow"
            aria-label={`Read about ${project.name}`}
            onClick={() => onOpen(project)}
          >
            <ArrowUpRight size={24} />
          </button>
        </div>
        <p>{project.description}</p>
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {wide && (
          <button
            className="text-link wide-explore"
            onClick={() => onOpen(project)}
          >
            Inside the project <ArrowUpRight size={17} />
          </button>
        )}
      </div>
    </article>
  );
}

function Work({ onOpen }) {
  const [filter, setFilter] = useState("all");
  const visible = projects.filter(
    (project) => filter === "all" || project.filters.includes(filter),
  );
  return (
    <section
      className="work-section section-space container"
      id="work"
      aria-labelledby="work-heading"
    >
      <Reveal>
        <SectionLabel number="01">SELECTED WORK</SectionLabel>
      </Reveal>
      <div className="section-heading-row">
        <Reveal>
          <h2 id="work-heading">
            <HeadingLine>Less talk.</HeadingLine>
            <HeadingLine index={1}>
              <em>More making.</em>
            </HeadingLine>
          </h2>
        </Reveal>
        <Reveal className="section-intro" delay={100}>
          <span className="mini-asterisk">
            <Asterisk size={24} />
          </span>
          <p>
            Real problems. A blank editor.
            <br />A few things I’ve built along the way.
          </p>
          <span className="eyebrow work-years">2024 — 2026</span>
        </Reveal>
      </div>
      <Reveal className="filter-row">
        <FilterRail selection={filter} count={visible.length}>
          {filters.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={filter === id ? "selected" : ""}
              aria-pressed={filter === id}
            >
              {label}
              {filter === id && (
                <span>{visible.length.toString().padStart(2, "0")}</span>
              )}
            </button>
          ))}
        </FilterRail>
        <span className="project-count" aria-live="polite">
          {visible.length.toString().padStart(2, "0")} PROJECT
          {visible.length !== 1 ? "S" : ""} / SELECTED
        </span>
      </Reveal>
      <div className="project-grid" key={filter}>
        {visible.map((project, index) => (
          <Reveal
            key={project.id}
            delay={Math.min((index % 2) * 90, 90)}
            className={
              project.id === "jarvis" && filter === "all" ? "wide-cell" : ""
            }
          >
            <ProjectCard
              project={project}
              index={index}
              wide={project.id === "jarvis" && filter === "all"}
              onOpen={onOpen}
            />
          </Reveal>
        ))}
      </div>
      <Reveal className="work-bottom">
        <span>Custom interface illustrations, inspired by each project.</span>
        <External className="text-link" href={profile.github}>
          More on GitHub <ArrowUpRight size={17} />
        </External>
      </Reveal>
    </section>
  );
}

const values = [
  {
    title: "Think in systems.",
    text: "Break down the complexity. Find the edge cases. Build a foundation that holds up beyond the happy path.",
  },
  {
    title: "Stay a beginner.",
    text: "New frameworks, unfamiliar problems, better ways of doing things. There’s always something worth learning.",
  },
  {
    title: "Care about the details.",
    text: "From a database query to a button interaction, the small decisions are what make the whole experience work.",
  },
];

function About() {
  const [openValue, setOpenValue] = useState(0);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [locationHint, setLocationHint] = useState(false);
  const [locationArrived, setLocationArrived] = useState(false);
  const locationTrigger = useRef(null);
  const locationName = useRef(null);
  const locationVisited = useRef(false);
  useEffect(() => {
    const element = locationTrigger.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!locationVisited.current) setLocationHint(true);
          warmLocationAssets();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const openLocation = () => {
    locationVisited.current = true;
    setLocationHint(false);
    setJourneyOpen(true);
  };
  const closeLocation = ({ arrived }) => {
    setJourneyOpen(false);
    if (arrived) setLocationArrived(true);
    setLocationHint(!arrived && !locationArrived);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        locationTrigger.current?.focus({ preventScroll: true });
        if (arrived)
          locationName.current?.scrollIntoView({
            block: "center",
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
          });
      }),
    );
  };
  return (
    <section
      className="about-section section-space"
      id="about"
      aria-labelledby="about-heading"
    >
      <div className="container">
        <Reveal>
          <SectionLabel number="02">A LITTLE ABOUT ME</SectionLabel>
        </Reveal>
        <div className="about-grid">
          <div className="about-copy">
            <Reveal>
              <h2 id="about-heading">
                <HeadingLine>Not just the how.</HeadingLine>
                <HeadingLine index={1}>
                  Always the <em>why.</em>
                </HeadingLine>
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <p className="about-lead">
                Hey, I’m Rishabh. Developer, problem-solver,
                <br className="desktop-break" /> and a work in progress.
              </p>
              <p>
                I’m pursuing Computer Science at VIT Vellore, building at the
                intersection of full-stack development and AI. I like taking an
                idea apart, understanding what makes it useful, and bringing it
                to life.
              </p>
              <p>
                From peer-to-peer video calls to AI code reviews, my projects
                are how I learn best: getting my hands dirty, asking better
                questions, and making the next iteration better.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="values-list">
                {values.map((value, i) => (
                  <div
                    className={`value-item ${openValue === i ? "expanded" : ""}`}
                    key={value.title}
                  >
                    <button
                      onClick={() => setOpenValue(openValue === i ? null : i)}
                      aria-expanded={openValue === i}
                      aria-controls={`value-panel-${i}`}
                    >
                      <span className="value-index">0{i + 1}</span>
                      <span>{value.title}</span>
                      <span className="value-plus" aria-hidden="true">
                        +
                      </span>
                    </button>
                    <div
                      className="value-content"
                      id={`value-panel-${i}`}
                      inert={openValue !== i ? true : undefined}
                    >
                      <div>
                        <p>{value.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <div className="about-facts">
            <Reveal
              delay={120}
              className={`education-card location-card ${locationArrived ? "location-returned" : "is-concealed"}`}
            >
              <button
                className="education-journey-trigger"
                ref={locationTrigger}
                onClick={openLocation}
                onPointerEnter={warmLocationAssets}
                aria-haspopup="dialog"
                aria-label="Discover where I study — open the location journey"
              >
                <span className="sr-only">Scroll from space to my campus.</span>
              </button>
              <div className="education-concealment" aria-hidden="true" />
              <div
                className={`location-invite ${locationHint && !locationArrived ? "is-visible" : ""}`}
                aria-hidden="true"
              >
                <span className="location-invite-kicker">
                  <MapPin size={15} /> FOLLOW THE COORDINATES
                </span>
                <strong>
                  Please click here
                  <br />
                  <em>to know where I am.</em>
                </strong>
                <p>
                  A journey from our solar system
                  <br />
                  to my corner of the world.
                </p>
                <span className="location-invite-action">
                  Start the journey <ArrowUpRight size={18} />
                </span>
              </div>
              <div
                className="education-details"
                aria-hidden={!locationArrived ? true : undefined}
                inert={!locationArrived ? true : undefined}
              >
                <div className="education-topline">
                  <span className="eyebrow">THE FOUNDATION</span>
                  <GraduationCap size={23} strokeWidth={1.4} />
                </div>
                <div className="education-graphic" aria-hidden="true">
                  <div className="graphic-grid" />
                  <div className="graphic-orbit orbit-one" />
                  <div className="graphic-orbit orbit-two" />
                  <div className="graphic-center">
                    <Asterisk size={90} strokeWidth={1.05} />
                  </div>
                  <span className="graphic-coordinate">
                    12.9682° N / 79.1559° E
                  </span>
                  <span className="graphic-caption">BUILD. LEARN. REPEAT.</span>
                </div>
                <div className="education-name">
                  <span className="eyebrow">B.TECH · COMPUTER SCIENCE</span>
                  <h3>VIT Vellore</h3>
                  <p id="education-location-name" ref={locationName}>
                    Vellore Institute of Technology, Vellore
                  </p>
                </div>
                <div className="education-stats">
                  <div>
                    <span className="stat-number">
                      9.28<span>/10</span>
                    </span>
                    <span className="eyebrow">CGPA</span>
                  </div>
                  <span className="stat-rule" />
                  <div>
                    <span className="stat-number">2027</span>
                    <span className="eyebrow">EXPECTED GRADUATION</span>
                  </div>
                </div>
                <div className="coursework">
                  <span>Grounded in the fundamentals</span>
                  <p>
                    DSA · DBMS · OS · Computer Networks
                    <br />
                    Software Engineering · AI · System Design
                  </p>
                </div>
                <div className="location-entry-note" aria-hidden="true">
                  <span>
                    {locationArrived
                      ? "YOU FOUND ME · EXPLORE AGAIN"
                      : "A PLACE ON THE MAP. A WORLD OF IDEAS."}
                  </span>
                  <ArrowUpRight size={15} />
                </div>
              </div>
            </Reveal>
            <Reveal delay={170} className="certification-card">
              <div className="certification-icon">
                <Award size={27} strokeWidth={1.5} />
              </div>
              <div>
                <span className="eyebrow">ORACLE CERTIFIED</span>
                <h4>Generative AI Professional</h4>
                <p>+ Generative AI Foundation</p>
              </div>
              <span className="certificate-seal" aria-hidden="true">
                <Check size={15} />
              </span>
            </Reveal>
          </div>
        </div>
      </div>
      {journeyOpen && <LocationJourney onClose={closeLocation} />}
    </section>
  );
}

function Toolkit() {
  const [selected, setSelected] = useState(0);
  const [focusedTool, setFocusedTool] = useState(0);
  const [focusRevision, setFocusRevision] = useState(0);
  const focusTool = (index) => {
    setFocusedTool(index);
    setFocusRevision((value) => value + 1);
  };
  useEffect(() => {
    setFocusedTool(0);
  }, [selected]);
  const tabRefs = useRef([]);
  const group = toolkitGroups[selected];
  const handleKeys = (event, i) => {
    let next;
    if (event.key === "ArrowRight") next = (i + 1) % toolkitGroups.length;
    if (event.key === "ArrowLeft")
      next = (i - 1 + toolkitGroups.length) % toolkitGroups.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = toolkitGroups.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setSelected(next);
      tabRefs.current[next]?.focus();
    }
  };
  return (
    <section
      className="toolkit-section section-space"
      id="toolkit"
      aria-labelledby="toolkit-heading"
    >
      <div className="container">
        <Reveal className="toolkit-topline">
          <SectionLabel number="03" light>
            THE TOOLKIT
          </SectionLabel>
          <span className="eyebrow">
            <span className="status-dot" />
            ALWAYS EVOLVING
          </span>
        </Reveal>
        <div className="section-heading-row">
          <Reveal>
            <h2 id="toolkit-heading">
              <HeadingLine>Good fundamentals.</HeadingLine>
              <HeadingLine index={1}>
                <em>Endless possibilities.</em>
              </HeadingLine>
            </h2>
          </Reveal>
          <Reveal delay={80} className="toolkit-intro">
            <p>
              Tools change. Curiosity stays.
              <br />
              Here’s what I reach for to turn
              <br className="desktop-break" /> “what if” into “it works.”
            </p>
          </Reveal>
        </div>
        <Reveal>
          <div
            className="toolkit-tabs"
            role="tablist"
            aria-label="Explore technical skills"
          >
            {toolkitGroups.map((item, i) => (
              <button
                key={item.id}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={selected === i}
                aria-controls={`panel-${item.id}`}
                tabIndex={selected === i ? 0 : -1}
                className={selected === i ? "active" : ""}
                onClick={() => setSelected(i)}
                onKeyDown={(event) => handleKeys(event, i)}
              >
                <span>{item.number}</span>
                {item.label}
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </Reveal>
        <div
          role="tabpanel"
          id={`panel-${group.id}`}
          aria-labelledby={`tab-${group.id}`}
          className="tool-panel"
          tabIndex={0}
        >
          <div className="tool-panel-heading">
            <p>{group.description}</p>
            <span className="eyebrow">{group.number} / 05</span>
          </div>
          <StackPlayground
            group={group}
            selected={focusedTool}
            onSelect={focusTool}
            focusRevision={focusRevision}
          />
          <div className="tools-grid" key={group.id}>
            {group.tools.map(([name, subtitle, logos], i) => (
              <button
                type="button"
                className={`tool-card ${focusedTool === i ? "tool-in-focus" : ""}`}
                style={{ "--tool-index": i }}
                key={name}
                aria-label={`Explore ${name} in 3D`}
                aria-pressed={focusedTool === i}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") focusTool(i);
                }}
                onClick={() => focusTool(i)}
              >
                <div
                  className={`tool-symbol symbol-${name.replace(/[^a-z]/gi, "").toLowerCase()}`}
                >
                  <div
                    className={`technology-logo-plate ${logos.length > 1 ? "paired-logos" : ""}`}
                  >
                    {logos.map((id) => (
                      <img
                        key={id}
                        className={`technology-logo logo-${id}`}
                        src={technologyLogos[id].src}
                        alt={`${technologyLogos[id].label} logo`}
                        width="32"
                        height="32"
                        loading="eager"
                      />
                    ))}
                  </div>
                </div>
                <h3>{name}</h3>
                <p>{subtitle}</p>
                <ArrowUpRight className="tool-card-arrow" size={14} />
              </button>
            ))}
          </div>
        </div>
        <Reveal className="toolkit-bottom">
          <span>
            <span className="tiny-spark">✳</span> Built on OOP, system design,
            and a lot of asking “why?”
          </span>
          <span className="code-comment">/* never stop learning */</span>
        </Reveal>
      </div>
    </section>
  );
}

function Contact({ onCopy }) {
  return (
    <section
      className="contact-section container section-space"
      id="contact"
      aria-labelledby="contact-heading"
    >
      <Reveal className="contact-card">
        <div className="contact-topline">
          <SectionLabel number="04">LET’S MAKE SOMETHING</SectionLabel>
          <span className="eyebrow contact-note">
            GOOD CONVERSATIONS → GOOD THINGS
          </span>
        </div>
        <div className="contact-main">
          <h2 id="contact-heading">
            <HeadingLine>Have a good idea?</HeadingLine>
            <HeadingLine index={1}>
              <em>Let’s build on it.</em>
            </HeadingLine>
          </h2>
          <a
            href={`mailto:${profile.email}`}
            className="contact-big-arrow"
            aria-label="Start a conversation by email"
          >
            <ArrowUpRight strokeWidth={1.1} />
          </a>
        </div>
        <div className="contact-middle">
          <p>
            A project, an opportunity, or a wonderfully
            <br className="desktop-break" /> ambitious “what if.” I’d love to
            hear it.
          </p>
          <a
            className="button button-dark"
            href={`mailto:${profile.email}?subject=Let%E2%80%99s%20build%20something`}
          >
            Say hello{" "}
            <span className="button-icon">
              <ArrowUpRight size={18} />
            </span>
          </a>
        </div>
        <div className="contact-bottom">
          <div className="contact-email">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button
              onClick={onCopy}
              className="copy-button"
              aria-label="Copy email address"
            >
              <Copy size={16} />
            </button>
          </div>
          <div className="contact-socials">
            <External href={profile.github}>
              GitHub <ArrowUpRight size={15} />
            </External>
            <External href={profile.linkedin}>
              LinkedIn <ArrowUpRight size={15} />
            </External>
            <External href={profile.leetcode}>
              LeetCode <ArrowUpRight size={15} />
            </External>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-left">
        <a className="brand" href="#home" aria-label="Rishabh, back to home">
          rishabh
          <span className="brand-star">
            <Asterisk strokeWidth={2.7} />
          </span>
        </a>
        <span>© {new Date().getFullYear()} P Rishabh Kumar</span>
      </div>
      <span className="footer-note">A little code. A lot of care.</span>
      <a href="#home" className="back-top">
        Back to top{" "}
        <span>
          <ArrowUp size={17} />
        </span>
      </a>
    </footer>
  );
}

function ProjectModal({ project, onClose, onChange }) {
  const ref = useRef(null);
  const closingTimer = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const requestClose = () => {
    if (leaving) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setLeaving(true);
    closingTimer.current = setTimeout(onClose, 230);
  };
  const contentRef = useRef(null);
  const index = projects.findIndex((item) => item.id === project.id);
  useEffect(() => {
    ref.current.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
      clearTimeout(closingTimer.current);
    };
  }, []);
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [project.id]);
  const cancel = (event) => {
    event.preventDefault();
    requestClose();
  };
  return (
    <dialog
      ref={ref}
      className={`project-modal ${leaving ? "modal-leaving" : ""}`}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onCancel={cancel}
      onClick={(event) => {
        if (event.target === ref.current) requestClose();
      }}
    >
      <div className="modal-bar">
        <span className="eyebrow">PROJECT NOTES / {project.number}</span>
        <button
          className="modal-close"
          onClick={requestClose}
          aria-label="Close project details"
          autoFocus
        >
          <X size={22} />
        </button>
      </div>
      <div className="modal-scroll" ref={contentRef}>
        <img
          className={`modal-cover cover-${project.id}`}
          src={project.image}
          alt={project.alt}
          width="1200"
          height="780"
        />
        <div className="modal-body" key={project.id}>
          <div className="modal-kicker">
            <span className="eyebrow">{project.category}</span>
            <span>{project.date}</span>
          </div>
          <h2 id="modal-title">{project.name}</h2>
          <h3>{project.tagline}</h3>
          <p id="modal-description" className="modal-intro">
            {project.intro}
          </p>
          <div className="modal-highlights">
            {project.highlights.map((point, i) => (
              <div key={point.title}>
                <span className="highlight-index">0{i + 1}</span>
                <div>
                  <h4>{point.title}</h4>
                  <p>{point.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="modal-stack">
            <span className="eyebrow">BUILT WITH</span>
            <div className="project-tags">
              {project.stack.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            {project.live && (
              <External href={project.live} className="button button-dark">
                Visit live site{" "}
                <span className="button-icon">
                  <ArrowUpRight size={18} />
                </span>
              </External>
            )}
            <External href={project.github} className="button button-outline">
              <Github size={17} />
              View source code
              <ArrowUpRight size={15} />
            </External>
          </div>
          <p className="modal-disclaimer">
            The image is a custom interface illustration, not a live screenshot.
            {(project.id === "nexmeet" || project.id === "wanderly") &&
              " The hosted demo may take a moment to wake up."}
            {project.id === "jarvis" &&
              " JARVIS runs locally; setup details are available in the repository."}
          </p>
          <div className="modal-pagination">
            <button
              onClick={() =>
                onChange(
                  projects[(index - 1 + projects.length) % projects.length],
                )
              }
            >
              <ArrowLeft size={17} />
              <span>Previous project</span>
            </button>
            <span className="eyebrow">
              {index + 1} / {projects.length}
            </span>
            <button
              onClick={() => onChange(projects[(index + 1) % projects.length])}
            >
              <span>Next project</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [project, setProject] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const opener = useRef(null);
  useEffect(() => {
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.setProperty(
          "--scroll-progress",
          max > 0 ? window.scrollY / max : 0,
        );
        setScrolled(window.scrollY > 20);
        if (window.scrollY < 200) setActive("");
        pending = false;
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    navItems.forEach(([id]) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(toastTimer.current);
    };
  }, []);
  const openProject = (item) => {
    opener.current = document.activeElement;
    setProject(item);
  };
  const closeProject = () => {
    setProject(null);
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  };
  const copyEmail = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(profile.email);
      copied = true;
    } catch {
      const input = document.createElement("textarea");
      input.value = profile.email;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      input.remove();
    }
    setToast(
      copied
        ? "Email copied. Good things start with hello."
        : `You can email me at ${profile.email}`,
    );
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  };
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header
        active={active}
        scrolled={scrolled}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main id="main-content">
        <Hero />
        <Work onOpen={openProject} />
        <About />
        <Toolkit />
        <Contact onCopy={copyEmail} />
      </main>
      <Footer />
      <SignatureCursor />
      <MotionDesign />
      {project && (
        <ProjectModal
          project={project}
          onClose={closeProject}
          onChange={setProject}
        />
      )}
      <div
        className={`toast ${toast ? "toast-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <Check size={18} />
            <span>{toast}</span>
            <button
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </>
  );
}
