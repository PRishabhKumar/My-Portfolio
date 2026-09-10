import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// EMBRACE — one ball echoes the hovered shape, with room to breathe.
// Geometry is measured from the real DOM, not a collection of guessed sizes.
const SIZE = 14;
const HOVER_GAP = 6;
const targets =
  'a, button, input, textarea, select, summary, [role="tab"], [role="button"], [data-cursor-target]';
const roundedPath = (w, h, radii) => {
  const p = 0.85,
    right = Math.max(p, w - p),
    bottom = Math.max(p, h - p);
  const [tl, tr, br, bl] = radii.map(([x, y]) => [
    Math.max(0, x - p),
    Math.max(0, y - p),
  ]);
  return `M${p + tl[0]},${p}H${right - tr[0]}A${tr[0]},${tr[1]} 0 0 1 ${right},${p + tr[1]}V${bottom - br[1]}A${br[0]},${br[1]} 0 0 1 ${right - br[0]},${bottom}H${p + bl[0]}A${bl[0]},${bl[1]} 0 0 1 ${p},${bottom - bl[1]}V${p + tl[1]}A${tl[0]},${tl[1]} 0 0 1 ${p + tl[0]},${p}Z`;
};

export default function SignatureCursor() {
  const layerRef = useRef(null),
    positionRef = useRef(null),
    contourRef = useRef(null),
    auraRef = useRef(null),
    fillRef = useRef(null);
  useEffect(() => {
    const layer = layerRef.current,
      position = positionRef.current,
      contour = contourRef.current,
      aura = auraRef.current,
      fill = fillRef.current;
    const root = document.documentElement;
    const fine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const supportsPopover = typeof layer.showPopover === "function";
    let target = null,
      visible = false,
      disposed = false,
      frame = 0,
      promotionFrame = 0,
      time = 0,
      lastBloom = 0;
    let x = -100,
      y = -100,
      down = false;
    let current = {
      x: -100,
      y: -100,
      w: SIZE,
      h: SIZE,
      fill: 1,
      radii: Array.from({ length: 4 }, () => [SIZE / 2, SIZE / 2]),
    };
    let bloomAnimation = null;
    const observed = new ResizeObserver(() => wake());

    function promote() {
      if (!fine.matches || disposed) return;
      if (supportsPopover) {
        try {
          if (layer.matches(":popover-open")) layer.hidePopover();
          layer.showPopover();
        } catch {
          /* Document teardown. */
        }
      } else {
        const parent = document.querySelector("dialog[open]") || document.body;
        if (layer.parentElement !== parent) parent.appendChild(layer);
      }
    }
    function enable() {
      if (fine.matches) {
        promote();
        root.classList.add("cursor-enabled");
      } else {
        root.classList.remove("cursor-enabled");
        hide();
        if (supportsPopover && layer.matches(":popover-open"))
          layer.hidePopover();
      }
    }
    function bloom() {
      if (reduced.matches || performance.now() - lastBloom < 170) return;
      lastBloom = performance.now();
      bloomAnimation?.cancel();
      bloomAnimation = aura.animate(
        [
          { opacity: 0, strokeWidth: 2, filter: "blur(1px)" },
          { opacity: 1, strokeWidth: 10, filter: "blur(3px)", offset: 0.18 },
          { opacity: 0.8, strokeWidth: 20, filter: "blur(8px)", offset: 0.42 },
          {
            opacity: 0.35,
            strokeWidth: 30,
            filter: "blur(14px)",
            offset: 0.72,
          },
          { opacity: 0, strokeWidth: 40, filter: "blur(22px)" },
        ],
        { duration: 950, easing: "ease-out" },
      );
      contour.animate([{ strokeDashoffset: 14 }, { strokeDashoffset: 0 }], {
        duration: 800,
        easing: "ease-out",
      });
      layer.dataset.bloom = String(Math.round(lastBloom));
    }
    function context(element) {
      let next = element instanceof Element ? element.closest(targets) : null;
      if (
        next?.matches(".menu-backdrop, :disabled, [data-cursor-free]") ||
        (element instanceof Element &&
          element.closest("[data-cursor-free]") &&
          !next?.closest(".artifact-controls"))
      )
        next = null;
      if (
        next &&
        (next.getBoundingClientRect().width > innerWidth ||
          next.getBoundingClientRect().height > innerHeight * 0.94)
      )
        next = null;
      if (next !== target) {
        if (target) observed.unobserve(target);
        target = next;
        if (target) {
          observed.observe(target);
          bloom();
        } else layer.dataset.mode = "ball";
      }
    }
    function radius(value, width, height, sx, sy) {
      const parts = value.split(" "),
        px = parts[0],
        py = parts[1] || px;
      return [
        Math.min(
          width / 2,
          px.endsWith("%")
            ? (parseFloat(px) * width) / 100
            : parseFloat(px) * sx,
        ),
        Math.min(
          height / 2,
          py.endsWith("%")
            ? (parseFloat(py) * height) / 100
            : parseFloat(py) * sy,
        ),
      ];
    }
    function measure() {
      if (!target?.isConnected) {
        target = null;
        layer.dataset.mode = "ball";
      }
      if (!target)
        return {
          x: x - SIZE / 2,
          y: y - SIZE / 2,
          w: SIZE,
          h: SIZE,
          fill: 1,
          radii: Array.from({ length: 4 }, () => [SIZE / 2, SIZE / 2]),
        };
      const rect = target.getBoundingClientRect(),
        style = getComputedStyle(target);
      const sx = rect.width / (target.offsetWidth || rect.width),
        sy = rect.height / (target.offsetHeight || rect.height);
      const radii = [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ].map((v) => radius(v, rect.width, rect.height, sx, sy));
      const circular =
        Math.abs(rect.width - rect.height) < 1.5 &&
        radii.every(
          ([rx, ry]) => rx >= rect.width / 2 - 1 && ry >= rect.height / 2 - 1,
        );
      layer.dataset.mode = circular ? "circle" : "frame";
      layer.dataset.target =
        target.getAttribute("aria-label") ||
        target.classList[0] ||
        target.tagName;
      return {
        x: rect.left - HOVER_GAP,
        y: rect.top - HOVER_GAP,
        w: rect.width + HOVER_GAP * 2,
        h: rect.height + HOVER_GAP * 2,
        fill: 0,
        // Offsetting the radii too keeps circles, pills, and corners concentric.
        radii: radii.map(([rx, ry]) => [rx + HOVER_GAP, ry + HOVER_GAP]),
      };
    }
    function draw(now) {
      frame = 0;
      if (!visible || disposed) return;
      const dt = Math.min((now - (time || now - 16.7)) / 1000, 0.05);
      time = now;
      const goal = measure(),
        speed = reduced.matches ? 1 : 1 - Math.exp(-18 * dt);
      let distance = 0;
      for (const key of ["x", "y", "w", "h"]) {
        const difference = goal[key] - current[key];
        distance += Math.abs(difference);
        current[key] =
          Math.abs(difference) < 0.07
            ? goal[key]
            : current[key] + difference * speed;
      }
      // A free ball tracks without a lagging second follower.
      if (!target && current.w < SIZE + 0.3 && current.h < SIZE + 0.3) {
        current.x = goal.x;
        current.y = goal.y;
      }
      current.fill +=
        (goal.fill - current.fill) *
        (reduced.matches ? 1 : 1 - Math.exp(-28 * dt));
      current.radii.forEach((r, i) =>
        r.forEach((value, j) => {
          const d = goal.radii[i][j] - value;
          current.radii[i][j] =
            Math.abs(d) < 0.05 ? goal.radii[i][j] : value + d * speed;
        }),
      );
      const { w, h } = current;
      position.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      position.style.width = `${w}px`;
      position.style.height = `${h}px`;
      const path = roundedPath(w, h, current.radii);
      contour.setAttribute("d", path);
      aura.setAttribute("d", path);
      fill.setAttribute("d", path);
      contour.setAttribute(
        "stroke-dasharray",
        layer.dataset.mode === "circle" ? "0.1 6" : "none",
      );
      aura.setAttribute(
        "stroke-dasharray",
        layer.dataset.mode === "circle" ? "0.1 6" : "none",
      );
      fill.style.opacity = String(!target && w > 32 ? 0 : current.fill);
      position.style.setProperty("--press", down ? "0.7" : "1");
      if (
        target ||
        distance > 0.03 ||
        Math.abs(goal.fill - current.fill) > 0.01
      )
        frame = requestAnimationFrame(draw);
    }
    function wake() {
      if (!frame && visible && !disposed) frame = requestAnimationFrame(draw);
    }
    function move(event) {
      if (event.pointerType === "touch") {
        hide();
        return;
      }
      if (!fine.matches) return;
      x = event.clientX;
      y = event.clientY;
      down = event.buttons !== 0;
      if (!visible) {
        current = {
          x: x - SIZE / 2,
          y: y - SIZE / 2,
          w: SIZE,
          h: SIZE,
          fill: 1,
          radii: Array.from({ length: 4 }, () => [SIZE / 2, SIZE / 2]),
        };
        time = 0;
      }
      visible = true;
      layer.dataset.visible = "true";
      context(event.target);
      wake();
    }
    function hide() {
      visible = false;
      down = false;
      layer.dataset.visible = "false";
      cancelAnimationFrame(frame);
      frame = 0;
      time = 0;
    }
    function onDown(event) {
      if (event.pointerType === "touch") {
        hide();
        return;
      }
      move(event);
      down = true;
      if (target) bloom();
      wake();
    }
    function onUp() {
      down = false;
      if (visible) context(document.elementFromPoint(x, y));
      wake();
    }
    function out(event) {
      if (!event.relatedTarget) hide();
    }
    function scroll() {
      if (visible) {
        context(document.elementFromPoint(x, y));
        wake();
      }
    }
    function key(event) {
      if (event.key === "Tab") hide();
    }
    function visibility() {
      if (document.hidden) hide();
    }
    function drag(event) {
      if (fine.matches) event.preventDefault();
    }
    const observer = new MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            record.target instanceof HTMLDialogElement ||
            [...record.addedNodes, ...record.removedNodes].some(
              (node) => node instanceof HTMLDialogElement,
            ),
        )
      ) {
        cancelAnimationFrame(promotionFrame);
        promotionFrame = requestAnimationFrame(() => {
          promote();
          scroll();
        });
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    enable();
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    document.addEventListener("pointercancel", hide, { passive: true });
    document.addEventListener("scroll", scroll, {
      passive: true,
      capture: true,
    });
    document.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("dragstart", drag);
    window.addEventListener("resize", scroll);
    window.addEventListener("blur", hide);
    fine.addEventListener("change", enable);
    return () => {
      disposed = true;
      hide();
      cancelAnimationFrame(promotionFrame);
      bloomAnimation?.cancel();
      observed.disconnect();
      observer.disconnect();
      root.classList.remove("cursor-enabled");
      if (supportsPopover && layer.matches(":popover-open"))
        layer.hidePopover();
      if (!supportsPopover && layer.parentElement !== document.body)
        document.body.appendChild(layer);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("scroll", scroll, true);
      document.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("dragstart", drag);
      window.removeEventListener("resize", scroll);
      window.removeEventListener("blur", hide);
      fine.removeEventListener("change", enable);
    };
  }, []);
  return createPortal(
    <div
      ref={layerRef}
      className="signature-cursor-layer"
      popover="manual"
      aria-hidden="true"
      data-visible="false"
      data-mode="ball"
    >
      <div ref={positionRef} className="signature-cursor-position">
        <svg
          className="signature-cursor-art"
          width="100%"
          height="100%"
          overflow="visible"
        >
          <defs>
            <radialGradient id="cursor-pearl" cx="30%" cy="25%" r="85%">
              <stop offset="0" stopColor="#f5f4dc" />
              <stop offset=".38" stopColor="#bfce99" />
              <stop offset="1" stopColor="#617c43" />
            </radialGradient>
            <linearGradient id="cursor-spectrum" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a9c580" />
              <stop offset=".35" stopColor="#d3dfa7" />
              <stop offset=".7" stopColor="#d7af76" />
              <stop offset="1" stopColor="#c5917c" />
            </linearGradient>
          </defs>
          <path
            ref={auraRef}
            className="cursor-aura"
            fill="none"
            stroke="url(#cursor-spectrum)"
            strokeLinecap="round"
          />
          <path
            ref={fillRef}
            className="cursor-ball-fill"
            fill="url(#cursor-pearl)"
          />
          <path
            ref={contourRef}
            className="cursor-contour"
            fill="none"
            stroke="url(#cursor-spectrum)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>,
    document.body,
  );
}
