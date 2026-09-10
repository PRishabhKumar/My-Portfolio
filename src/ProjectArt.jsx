import {
  ArrowUpRight,
  ArrowRight,
  Asterisk,
  FileText,
  Check,
  Sparkles,
  LayoutDashboard,
  Folder,
  Settings,
  ChevronRight,
  GitBranch,
  Code2,
  Github,
  Video,
  Mic,
  MicOff,
  Camera,
  MonitorUp,
  MessageSquare,
  Phone,
  MoreHorizontal,
  Globe,
  Heart,
  Search,
  MapPin,
  ShieldCheck,
  Terminal,
  AudioLines,
  ScanFace,
  CircleCheck,
  Command,
} from "lucide-react";

function Dots() {
  return (
    <span className="window-dots">
      <i />
      <i />
      <i />
    </span>
  );
}
function Brand({ children }) {
  return (
    <div className="art-brand">
      <Asterisk size={20} />
      {children}
    </div>
  );
}
function Career() {
  return (
    <div className="art-canvas career-art">
      <div className="artwork-caption">GOOD WORK. BETTER OPPORTUNITIES.</div>
      <div className="career-browser art-browser">
        <div className="art-browser-bar">
          <Dots />
          <span>careermitra.dev / workspace</span>
          <span>↗</span>
        </div>
        <div className="career-layout">
          <aside className="career-sidebar">
            <Brand>
              career<span>mitra.</span>
            </Brand>
            <div className="career-side-item chosen">
              <LayoutDashboard size={12} />
              Overview
            </div>
            <div className="career-side-item">
              <FileText size={12} />
              My resumes
            </div>
            <div className="career-side-item">
              <Sparkles size={12} />
              AI insights
            </div>
            <div className="career-side-item">
              <Folder size={12} />
              Documents
            </div>
            <div className="career-sidebar-foot">
              <div className="mini-initial">YK</div>
              <div>
                Your workspace<small>Make your next move.</small>
              </div>
            </div>
          </aside>
          <div className="career-main">
            <div className="career-overline">
              YOUR CAREER, ONE STEP FORWARD{" "}
              <span>
                <Sparkles size={10} /> AI-POWERED
              </span>
            </div>
            <h3>Let your experience shine.</h3>
            <p className="career-subline">
              A little clarity makes a big difference.
            </p>
            <div className="career-dashboard">
              <div className="resume-sheet">
                <div className="resume-avatar" />
                <div className="resume-name">YOUR NAME</div>
                <div className="resume-role">Full-stack developer</div>
                <div className="resume-contact">
                  your.email@domain.com · Portfolio · LinkedIn
                </div>
                <div className="resume-section-title">EXPERIENCE</div>
                <div className="resume-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="resume-section-title">PROJECTS</div>
                <div className="resume-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="resume-section-title">EDUCATION & SKILLS</div>
                <div className="resume-lines">
                  <i />
                  <i />
                </div>
                <div className="document-footer">
                  <FileText size={8} /> resume.pdf <Check size={8} />
                </div>
              </div>
              <div className="ats-panel">
                <div className="ats-heading">
                  Your ATS readiness <ArrowUpRight size={12} />
                </div>
                <div className="ats-ring">
                  <svg width="115" height="115" viewBox="0 0 115 115">
                    <circle
                      cx="57.5"
                      cy="57.5"
                      r="44"
                      stroke="#d7e0ca"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="57.5"
                      cy="57.5"
                      r="44"
                      stroke="#648544"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="241 277"
                      strokeLinecap="round"
                      transform="rotate(-90 57.5 57.5)"
                    />
                  </svg>
                  <span>
                    87<small>/ 100</small>
                  </span>
                </div>
                <div className="ats-state">
                  <span />
                  Looking good. Let’s go further.
                </div>
                <div className="ats-check">
                  <Check size={10} /> Structure & readability <span>✓</span>
                </div>
                <div className="ats-check">
                  <Check size={10} /> Relevant keywords <span>✓</span>
                </div>
                <div className="ats-check">
                  <Sparkles size={10} /> Sharper impact statements{" "}
                  <ChevronRight size={10} />
                </div>
                <div className="ats-action">
                  Refine with AI <Sparkles size={10} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="career-float">
        <span className="career-float-icon">
          <Sparkles size={20} />
        </span>
        <div>
          Your next chapter,
          <br />
          <strong>a little closer.</strong>
        </div>
        <ArrowUpRight size={20} />
      </div>
      <span className="career-art-footer">UPLOAD. UNDERSTAND. STAND OUT.</span>
    </div>
  );
}
function PRsonality() {
  return (
    <div className="art-canvas pr-art">
      <div className="artwork-caption">FRESH EYES. BETTER CODE.</div>
      <div className="pr-browser art-browser">
        <div className="pr-top">
          <Brand>
            PRsonality<span className="pr-brand-dot">.</span>
          </Brand>
          <span>
            <Github size={12} /> your-next-big-idea <ChevronRight size={10} />
          </span>
        </div>
        <div className="pr-personas">
          <span>MEET YOUR REVIEWER</span>
          <div className="pr-persona active">
            <i>SE</i>Kind Senior
          </div>
          <div className="pr-persona">
            <i>HR</i>Honest Reviewer
          </div>
          <div className="pr-persona">
            <i>CT</i>Startup CTO
          </div>
        </div>
        <div className="pr-content">
          <div className="pr-editor">
            <div className="pr-editor-top">
              <Code2 size={11} /> src / review.ts <span>TypeScript</span>
            </div>
            <div className="code-rows">
              <div>
                <b>01</b>
                <span>
                  <em>export async function</em> review(repo) {"{"}
                </span>
              </div>
              <div>
                <b>02</b>
                <span>
                  {" "}
                  <em>const</em> context = <i>await</i>
                </span>
              </div>
              <div>
                <b>03</b>
                <span> cloneRepository(repo);</span>
              </div>
              <div>
                <b>04</b>
                <span> </span>
              </div>
              <div className="code-highlight">
                <b>05</b>
                <span>
                  {" "}
                  <em>const</em> files = context.files;
                </span>
              </div>
              <div>
                <b>06</b>
                <span>
                  {" "}
                  <em>const</em> insights = <i>await</i>
                </span>
              </div>
              <div>
                <b>07</b>
                <span> analyze(files, persona);</span>
              </div>
              <div>
                <b>08</b>
                <span> </span>
              </div>
              <div>
                <b>09</b>
                <span>
                  {" "}
                  <em>return</em> insights;
                </span>
              </div>
              <div>
                <b>10</b>
                <span>{"}"}</span>
              </div>
            </div>
            <div className="pr-editor-bottom">
              <GitBranch size={10} /> main{" "}
              <span>MENTAL CLONING / COMPLETE</span>
            </div>
          </div>
          <div className="pr-review">
            <div className="pr-review-heading">
              <span className="review-avatar">SE</span>
              <div>
                Your kind senior<small>Context first. Always.</small>
              </div>
              <Check size={14} />
            </div>
            <div className="review-note">
              <span>ONE THOUGHT ON LINE 05</span>
              <h4>
                A small guard.
                <br />A stronger function.
              </h4>
              <p>
                What happens with an empty repository? Let’s catch that before
                we start the analysis.
              </p>
              <div className="review-code">if (!files?.length) return [];</div>
            </div>
            <div className="review-done">
              <CircleCheck size={12} /> A little better than before.
            </div>
          </div>
        </div>
      </div>
      <div className="pr-floating">
        <span>3</span>
        <div>
          perspectives.
          <br />
          <strong>One better codebase.</strong>
        </div>
        <Asterisk size={27} />
      </div>
    </div>
  );
}
function NexMeet() {
  const people = [
    { name: "Maya Chen", image: "/images/nexmeet-person-1.webp", active: true },
    { name: "Alex Morgan", image: "/images/nexmeet-person-2.webp" },
    { name: "Sam Lee", image: "/images/nexmeet-person-3.webp" },
    { name: "Jordan Davis", image: "/images/nexmeet-person-4.webp" },
  ];
  return (
    <div className="art-canvas nex-art">
      <div className="artwork-caption">
        GOOD IDEAS DON’T NEED THE SAME ROOM.
      </div>
      <div className="nex-browser art-browser">
        <div className="nex-header">
          <div className="nex-wordmark">
            <span>
              <Video size={15} fill="currentColor" strokeWidth={1.2} />
            </span>
            nexmeet<span className="nex-wordmark-dot">.</span>
          </div>
          <div className="nex-meeting-name">
            Design sync <span>TEAM ROOM / 04</span>
          </div>
          <div className="nex-live">
            <i /> LIVE <MoreHorizontal size={14} />
          </div>
        </div>
        <div className="nex-room-meta">
          <span>
            <ShieldCheck size={10} /> Room connected
          </span>
          <span>
            4 people, one conversation{" "}
            <span className="nex-people-stack">
              {["M", "A", "S", "J"].map((n) => (
                <i key={n}>{n}</i>
              ))}
            </span>
          </span>
        </div>
        <div className="nex-workspace">
          <div className="video-grid">
            {people.map((person, index) => (
              <div
                className={`video-tile ${person.active ? "is-speaking" : ""}`}
                key={person.name}
              >
                <img src={person.image} alt="" />
                <div className="participant-name">
                  <span>{person.name}</span>
                  {person.active ? <AudioLines size={11} /> : <Mic size={9} />}
                </div>
                {person.active && (
                  <div className="nex-speaking-indicator">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                )}
              </div>
            ))}
          </div>
          <aside className="nex-chat">
            <div className="nex-chat-heading">
              <MessageSquare size={12} />
              <span>Room chat</span>
              <MoreHorizontal size={12} />
            </div>
            <div className="nex-chat-date">FRIDAY, 10:30 AM</div>
            <div className="nex-message">
              <span className="nex-chat-avatar maya">M</span>
              <div>
                <strong>
                  Maya <time>10:31</time>
                </strong>
                <p>
                  Love this direction.
                  <br />
                  Let’s build on it.
                </p>
              </div>
            </div>
            <div className="nex-message">
              <span className="nex-chat-avatar alex">A</span>
              <div>
                <strong>
                  Alex <time>10:32</time>
                </strong>
                <p>
                  I’ll share my screen
                  <br />
                  so we can take a look.
                </p>
              </div>
            </div>
            <div className="nex-shared-note">
              <MonitorUp size={10} />
              <span>Better, on the same page.</span>
            </div>
            <div className="nex-message">
              <span className="nex-chat-avatar jordan">J</span>
              <div>
                <strong>
                  Jordan <time>10:32</time>
                </strong>
                <p>Sounds like a plan.</p>
              </div>
            </div>
            <div className="nex-chat-compose">
              <span>Message the room…</span>
              <span>
                <ArrowUpRight size={12} />
              </span>
            </div>
          </aside>
        </div>
        <div className="video-toolbar">
          <span className="call-time">
            <span />
            12:48 <i>·</i> In this together
          </span>
          <div className="call-controls">
            <span>
              <Mic size={13} />
            </span>
            <span>
              <Video size={13} />
            </span>
            <span>
              <MonitorUp size={13} />
            </span>
            <span className="chat-active">
              <MessageSquare size={13} />
            </span>
            <span className="end-call">
              <Phone size={13} />
            </span>
          </div>
          <span className="call-security">
            <ShieldCheck size={11} /> PEER TO PEER
          </span>
        </div>
      </div>
      <span className="nex-art-footer">VIDEO · CHAT · SCREEN SHARING</span>
      <div className="nex-floating">
        <span>
          <Globe size={23} />
        </span>
        <div>
          Your people.
          <br />
          <strong>One shared space.</strong>
        </div>
        <ArrowUpRight size={17} />
      </div>
    </div>
  );
}
function Wanderly() {
  return (
    <div className="art-canvas wander-art">
      <div className="artwork-caption">A CHANGE OF SCENERY.</div>
      <div className="wander-browser art-browser">
        <div className="art-browser-bar">
          <Dots />
          <span>wanderly / find your next stay</span>
          <span>↗</span>
        </div>
        <div className="wander-navigation">
          <Brand>
            wanderly<span>.</span>
          </Brand>
          <span>
            Discover <i>Experiences</i>
          </span>
          <div className="wander-user">W</div>
        </div>
        <div className="wander-content">
          <div className="wander-heading">
            <h3>
              A little further.
              <br />
              <em>A little closer to you.</em>
            </h3>
            <div className="wander-search">
              <MapPin size={11} />
              <span>Somewhere special</span>
              <Search size={14} />
            </div>
          </div>
          <div className="wander-property">
            <img src="/images/wanderly-cabin.webp" alt="" />
            <div className="property-badge">
              <span className="property-dot" /> ROOM TO BREATHE
            </div>
            <div className="property-heart">
              <Heart size={13} />
            </div>
            <div className="property-label">
              <h4>The Alpine Hideaway</h4>
              <span>An entire cabin. A whole new perspective.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="booking-card">
        <span className="booking-eyebrow">YOUR NEXT ESCAPE</span>
        <h4>
          Stay somewhere
          <br />
          <em>worth remembering.</em>
        </h4>
        <div className="booking-dates">
          <span>
            CHECK IN<small>A fresh start</small>
          </span>
          <span>
            CHECK OUT<small>No rush</small>
          </span>
        </div>
        <div className="booking-button">
          Find your stay <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
}
function Jarvis() {
  return (
    <div className="art-canvas jarvis-art">
      <div className="jarvis-top">
        <Brand>
          JARVIS<span>/</span>
        </Brand>
        <span>PERSONAL AI. PRACTICAL MAGIC.</span>
        <Command size={17} />
      </div>
      <div className="jarvis-subhead">
        <span className="jarvis-live" /> SYSTEM ONLINE{" "}
        <span>PYTHON / GEMINI / OPENCV</span>
      </div>
      <div className="jarvis-orb">
        <svg viewBox="0 0 300 300">
          <g fill="none" stroke="#b7e288" strokeWidth=".65" opacity=".7">
            <circle cx="150" cy="150" r="113" />
            <circle
              cx="150"
              cy="150"
              r="126"
              strokeDasharray="2 6"
              opacity=".45"
            />
            {[28, 57, 87].map((r) => (
              <ellipse key={r} cx="150" cy="150" rx={r} ry="113" />
            ))}
            <ellipse cx="150" cy="150" rx="113" ry="28" />
            <ellipse cx="150" cy="150" rx="113" ry="57" />
            <ellipse cx="150" cy="150" rx="113" ry="87" />
            <path d="M37 150h226M150 37v226" />
          </g>
          <circle cx="150" cy="150" r="43" fill="#bce38e" />
          <g stroke="#203b2c" strokeWidth="3.3" strokeLinecap="round">
            <path d="M126 146v8M134 137v26M142 129v42M150 138v24M158 133v34M166 141v18M174 147v6" />
          </g>
          <circle cx="45" cy="80" r="3" fill="#c2eb98" />
          <circle cx="238" cy="241" r="3" fill="#c2eb98" />
        </svg>
      </div>
      <div className="jarvis-auth">
        <ScanFace size={23} />
        <div>
          Just say the word.
          <small>
            Face authentication <Check size={9} />
          </small>
        </div>
        <span className="jarvis-connector" />
      </div>
      <div className="jarvis-right">
        <span>VOICE ACTIVATION</span>
        <h4>
          Always ready.
          <br />
          Never in the way.
        </h4>
        <div>
          <i /> Wake word detected
        </div>
      </div>
      <div className="jarvis-command">
        <span className="jarvis-mic">
          <Mic size={19} />
        </span>
        <div>
          <span>YOU SAID</span>
          <p>“Hey Jarvis, open my workspace.”</p>
        </div>
        <span className="jarvis-enter">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="jarvis-bottom">
        <span>NATURAL LANGUAGE → REAL ACTION</span>
        <span>
          YOUR DESKTOP, IN SYNC. <Asterisk size={11} />
        </span>
      </div>
    </div>
  );
}

const artworks = {
  careermitra: Career,
  prsonality: PRsonality,
  nexmeet: NexMeet,
  wanderly: Wanderly,
  jarvis: Jarvis,
};
export default function ProjectArt({ type }) {
  const Art = artworks[type];
  return Art ? <Art /> : <div>Unknown artwork.</div>;
}
