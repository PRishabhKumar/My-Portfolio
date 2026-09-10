import { useEffect, useLayoutEffect, useRef } from "react";

export function HeadingLine({ children, index = 0 }) {
  return (
    <span className="heading-line" style={{ "--line-index": index }}>
      <span className="heading-line-content">{children}</span>
    </span>
  );
}

// One event layer instead of a listener / React render on every single button.
export default function MotionDesign() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const root = document.documentElement;
    let active = null;
    let bounds = null;
    let pending = 0;
    const magnetic =
      ".button, .nav-cta, .project-arrow, .contact-big-arrow, .copy-button, .back-top > span, .modal-close";
    const release = () => {
      if (active) {
        active.style.setProperty("--magnet-x", "0px");
        active.style.setProperty("--magnet-y", "0px");
      }
      active = null;
      bounds = null;
    };
    const pointer = (event) => {
      if (reduced.matches || !fine.matches || event.pointerType !== "mouse")
        return;
      const target =
        event.target instanceof Element ? event.target.closest(magnetic) : null;
      if (target !== active) {
        release();
        if (target) {
          active = target;
          bounds = target.getBoundingClientRect();
          target.classList.add("magnetic-control");
        }
      }
      if (active && bounds) {
        const amount = active.matches(".contact-big-arrow") ? 9 : 4;
        const x = Math.max(
          -1,
          Math.min(
            1,
            (event.clientX - bounds.left - bounds.width / 2) /
              (bounds.width / 2),
          ),
        );
        const y = Math.max(
          -1,
          Math.min(
            1,
            (event.clientY - bounds.top - bounds.height / 2) /
              (bounds.height / 2),
          ),
        );
        active.style.setProperty("--magnet-x", `${(x * amount).toFixed(2)}px`);
        active.style.setProperty("--magnet-y", `${(y * amount).toFixed(2)}px`);
      }
    };
    const updateScroll = () => {
      pending = 0;
      if (reduced.matches) return;
      root.style.setProperty(
        "--hero-parallax",
        `${(-Math.min(scrollY, 750) * 0.055).toFixed(2)}px`,
      );
      for (const id of ["about", "contact"]) {
        const section = document.getElementById(id);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)),
        );
        section.style.setProperty("--section-progress", progress.toFixed(4));
      }
    };
    const scroll = () => {
      release();
      if (!pending) pending = requestAnimationFrame(updateScroll);
    };
    const changeMotion = () => {
      release();
      if (reduced.matches) {
        root.style.setProperty("--hero-parallax", "0px");
        document
          .querySelectorAll("[style*='--section-progress']")
          .forEach((el) => el.style.setProperty("--section-progress", "0"));
      } else scroll();
    };
    document.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerleave", release);
    window.addEventListener("blur", release);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll, { passive: true });
    reduced.addEventListener("change", changeMotion);
    updateScroll();
    return () => {
      release();
      cancelAnimationFrame(pending);
      document.removeEventListener("pointermove", pointer);
      document.removeEventListener("pointerleave", release);
      window.removeEventListener("blur", release);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      reduced.removeEventListener("change", changeMotion);
    };
  }, []);
  return null;
}

// Animate the filter's ink plate, rather than popping a separate fill onto each tab.
export function FilterRail({ children, selection, count }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const measure = () => {
      const selected = el.querySelector('[aria-pressed="true"]');
      if (!selected) return;
      el.style.setProperty("--filter-x", `${selected.offsetLeft}px`);
      el.style.setProperty("--filter-y", `${selected.offsetTop}px`);
      el.style.setProperty("--filter-width", `${selected.offsetWidth}px`);
      el.style.setProperty("--filter-height", `${selected.offsetHeight}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selection, count]);
  return (
    <div
      ref={ref}
      className="project-filters filter-rail"
      role="group"
      aria-label="Filter projects by category"
    >
      <span className="filter-ink" aria-hidden="true" />
      {children}
    </div>
  );
}
