import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Asterisk,
  ArrowRight,
  ArrowUpRight,
  ChevronUp,
  ChevronRight,
  Search,
  Folder,
  Settings,
  FileText,
  Calculator,
  Image as ImageIcon,
  Power,
  Wifi,
  Volume2,
  Monitor,
  Trash2,
  Minus,
  Square,
  X,
} from "lucide-react";
import App from "./App";
import {
  BOOT,
  SEARCH_COMMAND,
  CD_COMMAND,
  NPM_COMMAND,
  typed,
  bootPhase,
  shouldPlayIntro,
} from "./boot-sequence";

function WindowsMark({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1 1h10v10H1zm12 0h10v10H13zM1 13h10v10H1zm12 0h10v10H13z" />
    </svg>
  );
}
function CmdIcon({ small = false }) {
  return (
    <span
      className={`boot-cmd-icon ${small ? "boot-cmd-icon-small" : ""}`}
      aria-hidden="true"
    >
      <span>C:\_</span>
    </span>
  );
}
function Caret() {
  return <span className="boot-text-caret" aria-hidden="true" />;
}

const pinnedApps = [
  ["Command Prompt", "cmd"],
  ["File Explorer", "folder"],
  ["Settings", "settings"],
  ["Notepad", "notes"],
  ["Calculator", "calculator"],
  ["Photos", "photos"],
  ["Git", "git"],
  ["Python", "python"],
];
function AppIcon({ type }) {
  if (type === "cmd") return <CmdIcon />;
  if (type === "git" || type === "python")
    return (
      <img
        src={type === "git" ? "/logos/git.svg" : "/logos/python.svg"}
        alt=""
        width="31"
        height="31"
      />
    );
  const icons = {
    folder: Folder,
    settings: Settings,
    notes: FileText,
    calculator: Calculator,
    photos: ImageIcon,
  };
  const Icon = icons[type];
  return (
    <span className={`boot-app-icon boot-app-${type}`}>
      <Icon size={29} strokeWidth={1.65} />
    </span>
  );
}

function DesktopIntro({ onPrepare, onComplete }) {
  const [time, setTime] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const startRef = useRef(null),
    terminalRef = useRef(null),
    localRef = useRef(null);
  const pointerRef = useRef(null),
    skipRef = useRef(null);
  const clockRef = useRef(0),
    closingRef = useRef(false),
    completedRef = useRef(false);
  const userPointerUntil = useRef(0),
    pointerGoal = useRef({ x: 0, y: 0 });
  const latest = useRef({ onPrepare, onComplete, keyboard });
  latest.current = { onPrepare, onComplete, keyboard };
  const phase = bootPhase(time);
  const cue =
    time < 480
      ? "rest"
      : time < BOOT.terminal
        ? "start"
        : time < BOOT.point
          ? "aside"
          : "link";
  const cueRef = useRef(cue);
  cueRef.current = cue;
  const now = useRef(new Date()).current;
  const searchText = typed(SEARCH_COMMAND, time, BOOT.search, BOOT.searchEnd);
  const enterKey =
    (time >= BOOT.searchEnter && time < BOOT.terminal) ||
    (time >= BOOT.cdEnter - 170 && time < BOOT.cdEnter + 280) ||
    (time >= BOOT.npmEnter - 170 && time < BOOT.npmEnter + 280);
  const controlKey = time >= BOOT.control;
  const step =
    time < BOOT.terminal
      ? 0
      : time < BOOT.npmEnter
        ? 1
        : time < BOOT.point
          ? 2
          : 3;
  const stepLabels = [
    "A familiar place to begin.",
    "Make yourself at home.",
    "Turning ideas into something real.",
    "And… we're live.",
  ];
  const announcements = {
    desktop: "Opening a simulated Windows desktop.",
    start: "The Windows Start menu opens.",
    search: "Searching for Command Prompt.",
    directory: "Changing to Rishabh's Portfolio directory.",
    command: "Typing npm run dev.",
    server: "The simulated development server is ready.",
    link: "Control-clicking localhost to open the portfolio.",
    opening: "Welcome to Rishabh's portfolio.",
  };

  const finish = useCallback((keyboardInput = false) => {
    if (completedRef.current) return;
    completedRef.current = true;
    latest.current.onComplete(keyboardInput || latest.current.keyboard);
  }, []);
  const launch = useCallback((event) => {
    // The localhost URL is a prop in the scene, not a network destination.
    event?.preventDefault();
    if (closingRef.current || completedRef.current) return;
    closingRef.current = true;
    clockRef.current = 0;
    setLaunching(true);
    latest.current.onPrepare();
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    root.dataset.bootActive = "true";
    delete root.dataset.bootPending;
    document.body.style.overflow = "hidden";
    return () => {
      delete root.dataset.bootActive;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let frame = 0,
      elapsed = 0,
      last = performance.now(),
      warmed = false;
    completedRef.current = false;
    const tick = (stamp) => {
      const delta = document.hidden ? 0 : Math.max(0, stamp - last);
      last = stamp;
      elapsed += delta;
      setTime(elapsed);
      if (!warmed && elapsed >= BOOT.npmEnter) {
        warmed = true;
        latest.current.onPrepare();
      }
      if (closingRef.current) {
        clockRef.current += delta;
        if (clockRef.current >= BOOT.exit) {
          finish();
          return;
        }
      } else if (elapsed >= BOOT.click) {
        if (localRef.current) {
          localRef.current.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              ctrlKey: true,
            }),
          );
        } else launch();
      }
      if (pointerRef.current && stamp > userPointerUntil.current) {
        pointerRef.current.style.setProperty("--pointer-time", "700ms");
        const { x, y } = pointerGoal.current;
        pointerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (!completedRef.current) frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      last = performance.now();
    };
    const key = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(true);
      }
      if (event.key === "Tab") {
        event.preventDefault();
        setKeyboard(true);
        skipRef.current?.focus();
      }
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = (event) => {
      if (event.matches) finish();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("keydown", key);
    reduced.addEventListener("change", preference);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("keydown", key);
      reduced.removeEventListener("change", preference);
    };
  }, [finish, launch]);

  useLayoutEffect(() => {
    const measure = () => {
      const currentCue = cueRef.current;
      let x = innerWidth * 0.72,
        y = innerHeight * 0.65;
      if (currentCue === "start" && startRef.current) {
        const rect = startRef.current.getBoundingClientRect();
        x = rect.left + rect.width * 0.55;
        y = rect.top + rect.height * 0.5;
      } else if (currentCue === "aside" && terminalRef.current) {
        const rect = terminalRef.current.getBoundingClientRect();
        x = Math.min(innerWidth - 38, rect.right + 26);
        y = Math.min(innerHeight - 120, rect.bottom - 36);
      } else if (currentCue === "link" && localRef.current) {
        const rect = localRef.current.getBoundingClientRect();
        x = rect.left + rect.width * 0.57;
        y = rect.top + rect.height * 0.64;
      }
      pointerGoal.current = { x, y };
    };
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [cue]);

  const pointerMove = (event) => {
    if (event.pointerType === "touch" || !pointerRef.current) return;
    setKeyboard(false);
    userPointerUntil.current = performance.now() + 1500;
    pointerRef.current.style.setProperty("--pointer-time", "0ms");
    pointerRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  };

  return (
    <section
      className={`boot-intro ${launching ? "boot-intro-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="boot-title"
      aria-describedby="boot-description"
      data-phase={phase}
      data-time={Math.floor(time)}
      onPointerMove={pointerMove}
    >
      <h1 id="boot-title" className="sr-only">
        Welcome to Rishabh's workspace
      </h1>
      <p id="boot-description" className="sr-only">
        An automatic, simulated Windows desktop sequence opens the portfolio
        through Command Prompt. No input is needed. Skip the intro at any time
        or press Escape.
      </p>
      <div className="sr-only" role="status" aria-live="polite">
        {announcements[phase]}
      </div>
      <div className="boot-desktop" aria-hidden="true">
        <img
          className="boot-wallpaper"
          src="/images/desktop-wallpaper.webp"
          alt=""
          fetchPriority="high"
        />
        <div className="boot-wallpaper-shade" />
        <div className="boot-desktop-icons">
          <div className="boot-desktop-icon">
            <span className="boot-pc-icon">
              <Monitor size={31} strokeWidth={1.45} />
            </span>
            <span>This PC</span>
          </div>
          <div className="boot-desktop-icon">
            <span className="boot-trash-icon">
              <Trash2 size={30} strokeWidth={1.3} />
            </span>
            <span>Recycle Bin</span>
          </div>
          <div className="boot-desktop-icon">
            <AppIcon type="folder" />
            <span>
              Rishabh's
              <br />
              Portfolio
            </span>
          </div>
        </div>
        <div className="boot-wallpaper-signature">
          <Asterisk size={23} strokeWidth={1.2} />
          <span>
            PERSONAL WORKSPACE
            <br />
            <b>GOOD THINGS START HERE.</b>
          </span>
        </div>

        {time >= BOOT.start && time < BOOT.terminal && (
          <div
            className={`boot-start-menu ${searchText ? "boot-searching" : ""} ${time >= BOOT.searchEnter ? "boot-start-closing" : ""}`}
          >
            <div className="boot-search-field">
              <Search size={18} />
              <span>
                {searchText || "Type here to search"}
                {time >= BOOT.search && <span className="boot-search-caret" />}
              </span>
            </div>
            {!searchText ? (
              <>
                <div className="boot-pinned-title">
                  <strong>Pinned</strong>
                  <span>
                    All apps <ChevronRight size={11} />
                  </span>
                </div>
                <div className="boot-pinned-grid">
                  {pinnedApps.map(([name, type]) => (
                    <div className="boot-pinned-app" key={name}>
                      <AppIcon type={type} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
                <div className="boot-recommended-title">Recommended</div>
                <div className="boot-recommended">
                  <AppIcon type="folder" />
                  <span>
                    <strong>Rishabh's Portfolio</strong>
                    <small>Recently added</small>
                  </span>
                  <FileText size={27} />
                  <span>
                    <strong>README.md</strong>
                    <small>Let's build something.</small>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="boot-search-filters">
                  <span className="is-current">All</span>
                  <span>Apps</span>
                  <span>Documents</span>
                  <span>Settings</span>
                </div>
                <div className="boot-search-results">
                  <div className="boot-best-match">
                    <strong>Best match</strong>
                    <div
                      className={`boot-command-result ${time >= BOOT.searchEnter ? "is-pressed" : ""}`}
                    >
                      <CmdIcon />
                      <span>
                        <b>Command Prompt</b>
                        <small>System</small>
                      </span>
                      <ChevronRight size={13} />
                    </div>
                    <div className="boot-web-result">
                      <Search size={14} />
                      <span>{searchText}</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                  <div className="boot-command-preview">
                    <CmdIcon />
                    <strong>Command Prompt</strong>
                    <small>System</small>
                    <div>
                      <ArrowUpRight size={16} />
                      <span>Open</span>
                    </div>
                    <p>
                      Run as administrator
                      <br />
                      Open file location
                      <br />
                      Pin to Start
                    </p>
                  </div>
                </div>
              </>
            )}
            <div className="boot-start-footer">
              <span className="boot-avatar">RK</span>
              <span>Rishabh</span>
              <Power size={17} />
            </div>
          </div>
        )}

        {time >= BOOT.terminal && (
          <div
            className={`boot-terminal ${launching ? "boot-terminal-launched" : ""}`}
            ref={terminalRef}
          >
            <div className="boot-terminal-titlebar">
              <CmdIcon small />
              <span>Command Prompt</span>
              <div>
                <Minus size={15} />
                <Square size={12} />
                <X size={16} />
              </div>
            </div>
            <div className="boot-terminal-body">
              <div className="boot-command-banner">
                Microsoft Windows [Version 10.0.26100]
                <br />
                (c) Microsoft Corporation. All rights reserved.
              </div>
              <div className="boot-command-line" data-command="directory">
                <span className="boot-prompt">Rishabh&gt;</span>
                {typed(CD_COMMAND, time, BOOT.cd, BOOT.cdEnd)}
                {time < BOOT.cdEnter && <Caret />}
              </div>
              {time >= BOOT.cdEnter && (
                <div className="boot-command-line" data-command="start-server">
                  <span className="boot-prompt">Rishabh's Portfolio&gt;</span>
                  {typed(NPM_COMMAND, time, BOOT.npm, BOOT.npmEnd)}
                  {time < BOOT.npmEnter && <Caret />}
                </div>
              )}
              {time >= BOOT.output && (
                <div className="boot-npm-output">
                  &gt; rishabh-portfolio@1.0.0 dev
                  <br />
                  &gt; vite --host 0.0.0.0
                </div>
              )}
              {time >= BOOT.ready && (
                <div className="boot-vite-ready">
                  <b>VITE</b> <span>v7.3.6</span>
                  <span className="boot-ready-time">
                    ready in <strong>245</strong> ms
                  </span>
                </div>
              )}
              {time >= BOOT.local && (
                <div className="boot-server-addresses">
                  <div>
                    <span className="boot-output-arrow">➜</span>
                    <strong>Local:</strong>
                    <a
                      href="#home"
                      ref={localRef}
                      tabIndex={-1}
                      onClick={launch}
                      className={
                        time >= BOOT.point
                          ? "boot-local-link is-pointed"
                          : "boot-local-link"
                      }
                    >
                      http://localhost:5173/
                    </a>
                  </div>
                  <div className="boot-network-line">
                    <span className="boot-output-arrow">➜</span>
                    <strong>Network:</strong>
                    <span>http://192.168.1.7:5173/</span>
                  </div>
                </div>
              )}
              {time >= BOOT.help && (
                <div className="boot-terminal-help">
                  <span>➜</span> press <b>h + enter</b> to show help
                </div>
              )}
            </div>
            <div className="boot-terminal-status">
              <span>
                <i />
                {time >= BOOT.ready
                  ? "Development server ready"
                  : "Rishabh's workspace"}
              </span>
              <span>
                UTF-8 <i className="boot-status-divider" /> cmd.exe
              </span>
            </div>
          </div>
        )}

        <div className="boot-taskbar">
          <div className="boot-taskbar-widgets">
            <span className="boot-widget-orb" />
            <span>
              Make something
              <br />
              <b>that matters.</b>
            </span>
          </div>
          <div className="boot-taskbar-apps">
            <span
              ref={startRef}
              className={`boot-taskbar-start ${time >= BOOT.start && time < BOOT.terminal ? "is-active" : ""}`}
            >
              <WindowsMark />
            </span>
            <span className="boot-taskbar-search">
              <Search size={18} />
              <span>Search</span>
            </span>
            <span className="boot-taskbar-folder">
              <AppIcon type="folder" />
            </span>
            <span
              className={`boot-taskbar-cmd ${time >= BOOT.terminal ? "is-active" : ""}`}
            >
              <CmdIcon small />
            </span>
          </div>
          <div className="boot-system-tray">
            <ChevronUp size={13} />
            <Wifi size={17} />
            <Volume2 size={17} />
            <span>
              {now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              <br />
              {now.toLocaleDateString("en-GB")}
            </span>
            <span className="boot-show-desktop" />
          </div>
        </div>
      </div>

      <div className="boot-topline">
        <div className="boot-workspace-label">
          <Asterisk size={20} />
          <span>
            RISHABH'S WORKSPACE<small>A DESKTOP INTRO</small>
          </span>
        </div>
        <button
          ref={skipRef}
          className="boot-skip"
          onClick={(event) => finish(event.detail === 0)}
        >
          Skip intro <ArrowUpRight size={14} />
          <kbd>Esc</kbd>
        </button>
      </div>
      <div className="boot-caption" aria-hidden="true">
        <div>
          <span className="boot-step-number">
            0{step + 1}
            <span> / 04</span>
          </span>
          <span>{stepLabels[step]}</span>
        </div>
        <div className="boot-progress">
          <i
            style={{ transform: `scaleX(${Math.min(1, time / BOOT.click)})` }}
          />
        </div>
      </div>
      <div
        className={`boot-key-cue ${enterKey || controlKey || (time >= BOOT.start - 100 && time < BOOT.search) ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        {controlKey ? (
          <>
            <kbd>Ctrl</kbd>
            <span>+</span>
            <span className="boot-click-label">click</span>
          </>
        ) : enterKey ? (
          <>
            <kbd>↵</kbd>
            <span>Enter</span>
          </>
        ) : (
          <>
            <WindowsMark size={15} />
            <span>Start</span>
          </>
        )}
      </div>
      <div
        className={`boot-pointer ${time >= BOOT.click ? "boot-pointer-click" : ""} ${keyboard ? "is-keyboard" : ""}`}
        ref={pointerRef}
        aria-hidden="true"
      >
        <svg width="24" height="30" viewBox="0 0 24 30">
          <path
            d="M2 2v22l5.9-5.6 4.4 9.3 4.1-2-4.5-9.1H21Z"
            fill="#fff"
            stroke="#1e281b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <i />
      </div>
    </section>
  );
}

export default function PortfolioExperience() {
  const [playing, setPlaying] = useState(shouldPlayIntro);
  const prefetched = useRef([]);
  const prepare = useCallback(() => {
    if (prefetched.current.length) return;
    // Warm the page's critical assets without creating a hidden GPU surface.
    const image = new window.Image();
    image.src =
      document.documentElement.dataset.theme === "dark"
        ? "/images/hero-sculpture-dark.webp"
        : "/images/hero-sculpture.webp";
    prefetched.current.push(image);
    document.fonts?.load("700 60px Manrope").catch(() => {});
  }, []);
  const finish = useCallback((keyboardInput = false) => {
    setPlaying(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const hash = location.hash.slice(1);
        let destination = null;
        try {
          destination = hash
            ? document.getElementById(decodeURIComponent(hash))
            : null;
        } catch {
          /* A malformed fragment must never block entry. */
        }
        if (destination) destination.scrollIntoView({ behavior: "instant" });
        if (keyboardInput) {
          const heading =
            destination?.querySelector("h1, h2") ||
            document.querySelector("#main-content h1");
          if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
            heading.addEventListener(
              "blur",
              () => heading.removeAttribute("tabindex"),
              { once: true },
            );
          }
        }
        window.dispatchEvent(new Event("scroll"));
      }),
    );
  }, []);
  return playing ? (
    <DesktopIntro onPrepare={prepare} onComplete={finish} />
  ) : (
    <App />
  );
}
