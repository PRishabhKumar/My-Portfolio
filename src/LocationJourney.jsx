import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowDown,
  ArrowUpRight,
  Navigation,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  MoveDown,
} from "lucide-react";
import { createLocationScene } from "./location-engine";
import {
  STOPS,
  REGIONS,
  DESTINATION,
  ARRIVAL_HOLD,
  clamp,
  smooth,
  routeAt,
  stopAt,
  coordinate,
} from "./location-data";

export default function LocationJourney({ onClose }) {
  const dialogRef = useRef(null),
    scrollRef = useRef(null),
    viewportRef = useRef(null),
    engineRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const target = useRef(0),
    actual = useRef(0),
    closing = useRef(false),
    hold = useRef(0),
    keepRef = useRef(false),
    pausedRef = useRef(false),
    gateReady = useRef(false);
  const [ready, setReady] = useState(false),
    [fallback, setFallback] = useState(false),
    [leaving, setLeaving] = useState(false),
    [keep, setKeep] = useState(false),
    [paused, setPaused] = useState(false);
  const [view, setView] = useState({
    progress: 0,
    lat: null,
    lon: null,
    alt: null,
    pin: null,
    hold: 0,
  });
  const [travel, setTravel] = useState(5000);
  const timerRef = useRef(0),
    statusRef = useRef("loading");
  const stage = stopAt(view.progress),
    stop = STOPS[stage],
    photoOpacity = smooth(0.895, 0.97, view.progress);
  const close = useCallback((arrived = false) => {
    if (closing.current) return;
    closing.current = true;
    setLeaving(true);
    const delay = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 380;
    timerRef.current = setTimeout(() => onCloseRef.current({ arrived }), delay);
  }, []);
  const jump = useCallback((progress) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: (el.scrollHeight - el.clientHeight) * progress,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current,
      scroller = scrollRef.current;
    let disposed = false,
      frame = 0,
      creationFrame = 0,
      last = performance.now(),
      time = 0,
      lastUI = 0;
    const beforeOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    scroller.focus({ preventScroll: true });
    const resize = () =>
      setTravel(Math.max(3100, scroller.clientHeight * 5.75));
    const measure = () => {
      target.current = clamp(
        scroller.scrollTop /
          Math.max(1, scroller.scrollHeight - scroller.clientHeight),
      );
    };
    resize();
    scroller.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fail = () => {
      if (disposed) return;
      engineRef.current?.dispose();
      engineRef.current = null;
      statusRef.current = "fallback";
      setFallback(true);
      setReady(true);
    };
    creationFrame = requestAnimationFrame(() => {
      if (disposed) return;
      try {
        engineRef.current = createLocationScene(viewportRef.current, {
          onError: fail,
        });
      } catch {
        viewportRef.current
          ?.querySelectorAll("canvas")
          .forEach((c) => c.remove());
        fail();
      }
    });
    const tick = (now) => {
      if (disposed) return;
      const elapsed = document.hidden ? 0 : Math.max(0, (now - last) / 1000);
      const dt = Math.min(elapsed, 0.05);
      last = now;
      if (!pausedRef.current && !motion.matches) time += dt;
      const rate = motion.matches ? 1 : 1 - Math.exp(-9 * dt);
      const delta = target.current - actual.current;
      actual.current =
        Math.abs(delta) < 0.00008
          ? target.current
          : actual.current + delta * rate;
      const p = actual.current;
      let telemetry = { lat: null, lon: null, alt: null, pin: null };
      if (engineRef.current?.ready) {
        telemetry = engineRef.current.render(
          p,
          time,
          Math.abs(delta) > 0.00008,
        );
        if (statusRef.current === "loading") {
          statusRef.current = "ready";
          setReady(true);
        }
      } else if (statusRef.current === "fallback") {
        const route = routeAt(p);
        telemetry = {
          lat: p > 0.015 ? route.lat : null,
          lon: p > 0.015 ? route.lon : null,
          alt: p > 0.015 ? route.alt : null,
          pin: null,
        };
      }
      if (
        p > 0.985 &&
        target.current > 0.985 &&
        gateReady.current &&
        !keepRef.current &&
        !closing.current
      ) {
        hold.current += elapsed * 1000;
        if (hold.current >= ARRIVAL_HOLD) close(true);
      } else if (p < 0.975 || target.current < 0.975) hold.current = 0;
      if (now - lastUI > 32 || motion.matches) {
        lastUI = now;
        setView({
          progress: p,
          ...telemetry,
          hold: clamp(hold.current / ARRIVAL_HOLD),
        });
      }
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      last = performance.now();
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(actual.current > 0.9);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    dialog.addEventListener("keydown", escape);
    frame = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(creationFrame);
      clearTimeout(timerRef.current);
      scroller.removeEventListener("scroll", measure);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      dialog.removeEventListener("keydown", escape);
      engineRef.current?.dispose();
      engineRef.current = null;
      if (dialog.open) dialog.close();
      document.body.style.overflow = beforeOverflow;
    };
  }, [close]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el)
      el.scrollTop =
        target.current * Math.max(0, el.scrollHeight - el.clientHeight);
  }, [travel]);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };
  const holdArrival = () => {
    if (keepRef.current) {
      close(true);
      return;
    }
    keepRef.current = true;
    setKeep(true);
  };
  const fallbackRegion =
    view.progress < 0.4
      ? null
      : view.progress < 0.6
        ? REGIONS[0]
        : view.progress < 0.75
          ? REGIONS[1]
          : view.progress < 0.865
            ? REGIONS[2]
            : REGIONS[3];
  return createPortal(
    <dialog
      ref={dialogRef}
      className={`location-dialog ${leaving ? "is-leaving" : ""}`}
      aria-labelledby="location-journey-title"
      aria-describedby="location-journey-description"
      onCancel={(event) => {
        event.preventDefault();
        close(view.progress > 0.9);
      }}
      data-stage={stop.id}
      data-progress={view.progress.toFixed(4)}
      data-state={ready ? (fallback ? "fallback" : "ready") : "loading"}
    >
      <p id="location-journey-description" className="sr-only">
        An animated, scroll-controlled journey through all eight planets, then
        Earth, India, Tamil Nadu, Vellore, and the VIT main gate. Scroll within
        this window, use Page Down or the chapter buttons, or press Escape to
        return. Coordinates describe the virtual camera view, not your device
        location.
      </p>
      <div
        className="journey-scroll"
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Scroll to find Rishabh at VIT Vellore"
        data-ready={ready}
        style={{ "--journey-travel": `${travel}px` }}
      >
        <div className="journey-sticky">
          <div
            className="journey-canvas"
            ref={viewportRef}
            aria-hidden="true"
          />
          {fallback && (
            <div
              className="journey-fallback"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${fallbackRegion?.image || "/images/location/space-fallback.webp"})`,
                backgroundSize: fallbackRegion ? "cover" : "contain",
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
          <div className="journey-vignette" aria-hidden="true" />
          {view.solarLabels && view.progress < 0.14 && (
            <div
              className="journey-solar-labels"
              data-layout={view.solarCompact ? "compact" : "regular"}
              aria-hidden="true"
              style={{ opacity: 1 - smooth(0.025, 0.14, view.progress) }}
            >
              {view.solarLabels.map((planet) => (
                <span
                  key={planet.id}
                  data-planet={planet.id}
                  className={`journey-planet-label ${planet.id === "earth" ? "is-destination" : ""}`}
                  style={{
                    left: planet.x,
                    top: planet.y + planet.radius + 10,
                    "--planet-x": `${planet.x}px`,
                    "--planet-y": `${planet.y}px`,
                    "--planet-radius": `${planet.radius}px`,
                  }}
                >
                  {planet.id === "earth" && <i />}
                  {planet.name}
                </span>
              ))}
              <div className="journey-solar-key">
                {view.solarLabels
                  .filter((planet) => planet.id !== "sun")
                  .map((planet) => (
                    <span
                      key={planet.id}
                      className="solar-key-label"
                      data-legend-planet={planet.id}
                    >
                      <i />
                      {planet.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <header className="journey-header">
            <div className="journey-header-copy">
              <span className="journey-kicker">
                <Navigation size={12} /> A DIFFERENT PERSPECTIVE
              </span>
              <h2 id="location-journey-title">Follow the coordinates.</h2>
            </div>
            <div className="journey-actions">
              <button
                className="journey-quiet-control"
                onClick={() => jump(0)}
                aria-label="Restart location journey"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="journey-quiet-control"
                onClick={togglePause}
                aria-label={
                  paused ? "Resume orbital motion" : "Pause orbital motion"
                }
                aria-pressed={paused}
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}
              </button>
              <button
                className="journey-close"
                onClick={() => close(view.progress > 0.9)}
                aria-label="Close location journey"
              >
                <X size={21} />
              </button>
            </div>
          </header>
          <div
            className={`journey-chapter ${photoOpacity > 0.45 ? "is-dimmed" : ""}`}
            key={stop.id}
          >
            <span className="journey-chapter-index">
              {stop.number} / 06 <i /> {stop.label.toUpperCase()}
            </span>
            <h3>{stop.title}</h3>
            <p>{stop.subtitle}</p>
          </div>
          {!ready && (
            <div className="journey-loading">
              <span />
              <p>Preparing the view.</p>
              <small>Earth, sunlight, and a way home.</small>
            </div>
          )}
          {ready && view.progress < 0.025 && (
            <div className="journey-scroll-invite">
              <span className="journey-scroll-icon">
                <MoveDown size={19} />
              </span>
              <strong>Scroll to find me</strong>
              <span>A journey from orbit to campus.</span>
            </div>
          )}
          {fallback && view.progress < 0.1 && (
            <p className="journey-fallback-note">
              3D isn’t available in this browser. The satellite journey still
              works.
            </p>
          )}
          {view.pin && (
            <div
              className="journey-map-pin"
              aria-hidden="true"
              style={{ left: view.pin.x, top: view.pin.y }}
            >
              <span />
              <div>
                <MapPin size={12} />
                <b>VIT VELLORE</b>
              </div>
            </div>
          )}
          <figure
            className={`journey-arrival ${photoOpacity > 0.01 ? "is-visible" : ""}`}
            style={{
              opacity: photoOpacity,
              "--arrival-progress": 1 - view.hold,
            }}
            aria-hidden={photoOpacity < 0.5}
          >
            <div className="journey-gate-photo">
              <img
                src="/images/location/vit-main-gate.webp"
                alt="The main gate of VIT Vellore, with its stone towers and Vellore Institute of Technology sign"
                onLoad={() => {
                  gateReady.current = true;
                }}
                width="638"
                height="400"
              />
              <span>
                <MapPin size={12} /> YOU'VE ARRIVED
              </span>
            </div>
            <figcaption>
              <div>
                <span className="journey-arrival-eyebrow">
                  WHERE I LEARN. WHERE I BUILD.
                </span>
                <h3>
                  Vellore Institute of Technology, <em>Vellore.</em>
                </h3>
                <p>
                  {keep
                    ? "Take your time. This is the place."
                    : "You found me. Returning to my college card…"}
                </p>
              </div>
              <button
                onClick={holdArrival}
                tabIndex={photoOpacity > 0.8 ? 0 : -1}
              >
                {keep ? "Return to portfolio" : "Keep this view"}
                <ArrowUpRight size={14} />
              </button>
            </figcaption>
            {!keep && (
              <div className="journey-return-timer">
                <span />
              </div>
            )}
          </figure>
          <footer className="journey-hud">
            <div className="journey-metrics" aria-live="off">
              <div>
                <span>LATITUDE</span>
                <strong data-coordinate="latitude">
                  {coordinate(view.lat, "lat")}
                </strong>
              </div>
              <div>
                <span>LONGITUDE</span>
                <strong data-coordinate="longitude">
                  {coordinate(view.lon, "lon")}
                </strong>
              </div>
              <div className="journey-altitude">
                <span>VIEW ALTITUDE</span>
                <strong>
                  {view.alt == null
                    ? "—"
                    : `${view.alt >= 100 ? Math.round(view.alt).toLocaleString("en-IN") : view.alt.toFixed(1)} km`}
                </strong>
              </div>
              <span className="journey-readout-note">
                {view.progress < 0.1
                  ? "Illustrative scale"
                  : "Virtual camera view"}
              </span>
            </div>
            <nav
              className="journey-chapters"
              aria-label="Location journey chapters"
            >
              <span className="journey-track">
                <i style={{ transform: `scaleX(${view.progress})` }} />
              </span>
              {STOPS.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => jump(item.at)}
                  disabled={!ready}
                  className={stage === i ? "is-current" : ""}
                  aria-current={stage === i ? "step" : undefined}
                  aria-label={`Go to ${item.label}`}
                >
                  <i />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="journey-attribution">
              {view.progress > 0.95 ? (
                <span>
                  Campus photo supplied by Rishabh · Entrance coordinates are
                  approximate.
                </span>
              ) : view.progress > 0.53 ? (
                <span>
                  <a href="https://s2maps.eu" target="_blank" rel="noreferrer">
                    Sentinel-2 cloudless
                  </a>{" "}
                  by{" "}
                  <a href="https://eox.at" target="_blank" rel="noreferrer">
                    EOX IT Services GmbH
                  </a>{" "}
                  · modified Copernicus Sentinel data 2016 &amp; 2017 ·{" "}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CC BY 4.0
                  </a>
                </span>
              ) : (
                <span>
                  Planet textures:{" "}
                  <a
                    href="https://www.solarsystemscope.com/textures/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Solar System Scope
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CC BY 4.0
                  </a>{" "}
                  · Boundaries: Natural Earth · Not to astronomical scale.
                </span>
              )}
            </div>
          </footer>
          <span className="sr-only" role="status" aria-live="polite">
            {stop.label}
            {view.progress > 0.985
              ? ". You have arrived at VIT Vellore. Returning shortly; choose Keep this view to stay."
              : ""}
          </span>
        </div>
        <div className="journey-distance" aria-hidden="true" />
      </div>
    </dialog>,
    document.body,
  );
}
