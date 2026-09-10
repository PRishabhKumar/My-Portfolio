import { useEffect, useRef, useState, useImperativeHandle } from "react";
import {
  RotateCcw,
  Rotate3D,
  Expand,
  Minimize2,
  Pause,
  Play,
  ArrowUpRight,
  MoveHorizontal,
} from "lucide-react";
import { createArtifact } from "./artifact-engine";
import { technologyLogos } from "./toolkit";

function useSculpture(variant, group, selected, onSelect, focusRevision = 0) {
  const viewportRef = useRef(null);
  const engineRef = useRef(null);
  const current = useRef({ group, selected, onSelect });
  current.current = { group, selected, onSelect };
  const [status, setStatus] = useState("loading");
  const [unfolded, setUnfolded] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    let disposed = false,
      scheduled = 0,
      inView = false;
    const start = () => {
      scheduled = 0;
      if (disposed || engineRef.current) return;
      try {
        const engine = createArtifact(viewport, {
          variant,
          onReady: () => {
            if (!disposed) setStatus("ready");
          },
          onLost: () => {
            if (!disposed) setStatus("fallback");
          },
          onSelect: (index) => current.current.onSelect?.(index),
          onUnfold: (value) => {
            if (!disposed) setUnfolded(value);
          },
        });
        engineRef.current = engine;
        engine.setActive(inView);
        if (current.current.group) engine.setGroup(current.current.group);
        engine.select(current.current.selected || 0);
      } catch {
        viewport
          .querySelectorAll("canvas")
          .forEach((canvas) => canvas.remove());
        if (!disposed) setStatus("fallback");
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView && scheduled) {
          cancelAnimationFrame(scheduled);
          scheduled = 0;
        }
        if (entry.isIntersecting && !engineRef.current && !scheduled)
          scheduled = requestAnimationFrame(start);
        engineRef.current?.setActive(entry.isIntersecting);
      },
      { rootMargin: "180px 0px" },
    );
    observer.observe(viewport);
    const theme = (event) => engineRef.current?.theme(event.detail === "dark");
    window.addEventListener("portfolio-theme-change", theme);
    return () => {
      disposed = true;
      cancelAnimationFrame(scheduled);
      observer.disconnect();
      window.removeEventListener("portfolio-theme-change", theme);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [variant]);

  useEffect(() => {
    if (group) engineRef.current?.setGroup(group);
    engineRef.current?.select(selected || 0);
  }, [group, selected, focusRevision]);

  const controls = {
    reset: () => engineRef.current?.reset(),
    spin: () => engineRef.current?.spin(),
    unfold: () => engineRef.current?.toggleUnfold(),
    pause: () => {
      engineRef.current?.pause(!paused);
      setPaused(!paused);
    },
  };
  return { viewportRef, status, unfolded, paused, controls };
}

function Controls({ variant, status, unfolded, paused, controls }) {
  const label = variant === "hero" ? "orbit" : "toolkit";
  return (
    <div
      className="artifact-controls"
      aria-label={`${label} sculpture controls`}
    >
      <button
        className="artifact-action"
        onClick={controls.unfold}
        disabled={status !== "ready"}
        aria-pressed={unfolded}
        aria-label={`${unfolded ? "Assemble" : "Unfold"} ${label} sculpture`}
      >
        {unfolded ? <Minimize2 size={13} /> : <Expand size={13} />}
        <span>{unfolded ? "Assemble" : "Unfold"}</span>
      </button>
      <button
        className="artifact-icon-button"
        onClick={controls.spin}
        disabled={status !== "ready"}
        aria-label={`Spin ${label} sculpture`}
      >
        <Rotate3D size={15} />
      </button>
      <button
        className="artifact-icon-button"
        onClick={controls.reset}
        disabled={status !== "ready"}
        aria-label={`Reset ${label} sculpture`}
      >
        <RotateCcw size={13} />
      </button>
      <button
        className="artifact-icon-button artifact-pause"
        onClick={controls.pause}
        disabled={status !== "ready"}
        aria-pressed={paused}
        aria-label={`${paused ? "Resume" : "Pause"} ${label} idle animation`}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </button>
    </div>
  );
}

export function HeroArtifact({ ref }) {
  const sculpture = useSculpture("hero");
  useImperativeHandle(ref, () => ({ unfold: sculpture.controls.unfold }));
  return (
    <div
      className="hero-artifact artifact-shell"
      data-status={sculpture.status}
    >
      <div
        className="hero-artifact-fallback"
        aria-hidden={sculpture.status === "ready"}
      >
        <img
          className="artifact-fallback-day"
          src="/images/hero-sculpture.webp"
          alt="A chrome orbital sculpture with a sage sphere."
          width="1264"
          height="848"
        />
        <img
          className="artifact-fallback-night"
          src="/images/hero-sculpture-dark.webp"
          alt=""
          width="1264"
          height="848"
        />
      </div>
      <div
        ref={sculpture.viewportRef}
        className="artifact-viewport hero-viewport"
        data-artifact="hero"
        data-cursor-free="true"
        tabIndex={0}
        role="group"
        aria-label="Interactive orbit sculpture"
        aria-describedby="orbit-instructions"
      />
      <div className="hero-artifact-caption">
        <span className="artifact-edition">ORBIT / 01</span>
        <span className="artifact-gesture">
          <MoveHorizontal size={12} />
          {sculpture.status === "fallback"
            ? "SCULPTURE / STILL VIEW"
            : "DRAG TO TURN · CLICK TO UNFOLD"}
        </span>
      </div>
      <Controls variant="hero" {...sculpture} />
      <p className="sr-only" id="orbit-instructions">
        Drag the sculpture to rotate it. Click it to unfold or assemble it. With
        keyboard focus, use arrow keys to rotate, Enter to unfold, and Home to
        reset. Use the controls to spin or pause it.
      </p>
    </div>
  );
}

export function StackPlayground({ group, selected, onSelect, focusRevision }) {
  const sculpture = useSculpture(
    "toolkit",
    group,
    selected,
    onSelect,
    focusRevision,
  );
  const [name, subtitle, ids] = group.tools[selected];
  return (
    <div
      className="stack-playground artifact-shell"
      data-status={sculpture.status}
    >
      <div className="stack-stage">
        <div className="stack-stage-top">
          <span>STACK / 02</span>
          <span className="stack-live">
            <i />
            {sculpture.status === "ready"
              ? "LIVE 3D"
              : sculpture.status === "fallback"
                ? "TOOLKIT"
                : "ASSEMBLING"}
          </span>
        </div>
        <div className="stack-blueprint" aria-hidden="true" />
        <div
          ref={sculpture.viewportRef}
          className="artifact-viewport stack-viewport"
          data-artifact="toolkit"
          data-cursor-free="true"
          tabIndex={0}
          role="group"
          aria-label="Interactive technology sculpture"
          aria-describedby="stack-instructions"
        />
        {sculpture.status !== "ready" && (
          <div className="stack-fallback" aria-hidden="true">
            <div className="stack-fallback-hex">
              <Rotate3D size={40} strokeWidth={0.8} />
            </div>
            <span>
              {sculpture.status === "fallback"
                ? "Explore the skill cards below"
                : "Putting the pieces together…"}
            </span>
          </div>
        )}
        <span className="stack-drag-hint">
          <MoveHorizontal size={13} /> DRAG TO ROTATE · CLICK A MODULE
        </span>
      </div>
      <div className="stack-inspector">
        <div className="stack-inspector-top">
          <span className="eyebrow">A HANDS-ON TOOLKIT</span>
          <span className="stack-module-number">
            0{selected + 1}
            <span> / 06</span>
          </span>
        </div>
        <div className="stack-selected-logos" aria-hidden="true">
          {ids.map((id) => (
            <img
              key={id}
              src={technologyLogos[id].src}
              alt=""
              width="35"
              height="35"
            />
          ))}
        </div>
        <div
          className="stack-focus-copy"
          key={name}
          aria-live="polite"
          aria-atomic="true"
        >
          <h3>{name}</h3>
          <p>{subtitle}</p>
        </div>
        <p className="stack-invitation">
          Good things are built in layers.
          <br />
          Go ahead. Take this one apart.
        </p>
        <Controls variant="toolkit" {...sculpture} />
        <div className="stack-inspector-foot">
          <span>PICK A MODULE BELOW</span>
          <ArrowUpRight size={13} />
        </div>
      </div>
      <p className="sr-only" id="stack-instructions">
        Drag to rotate the 3D stack. Click a technology module or a skill card
        to bring it to the front. Arrow keys rotate the sculpture, Enter unfolds
        it, and Home resets the view. All technology information is also
        available in the skill cards below.
      </p>
    </div>
  );
}
