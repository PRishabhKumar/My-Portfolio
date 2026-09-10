import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "rishabh-theme";
const systemTheme = () =>
  matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const storedTheme = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
};
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#151914" : "#f5f4ee");
}

export function useTheme() {
  const [theme, setTheme] = useState(
    () =>
      document.documentElement.dataset.theme || storedTheme() || systemTheme(),
  );
  const hasChoice = useRef(Boolean(storedTheme()));
  const timer = useRef(null);
  useEffect(() => {
    applyTheme(theme);
    const frame = requestAnimationFrame(() =>
      window.dispatchEvent(
        new CustomEvent("portfolio-theme-change", { detail: theme }),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [theme]);
  useEffect(() => {
    const preference = matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (!hasChoice.current) setTheme(systemTheme());
    };
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        hasChoice.current = Boolean(event.newValue);
        setTheme(storedTheme() || systemTheme());
      }
    };
    preference.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      preference.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
      clearTimeout(timer.current);
    };
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    hasChoice.current = true;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Private/sandboxed browsing: keep the preference in memory. */
    }
    document.documentElement.classList.add("theme-changing");
    applyTheme(next);
    setTheme(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => document.documentElement.classList.remove("theme-changing"),
      850,
    );
  };
  return { theme, toggleTheme };
}

export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={`theme-toggle ${dark ? "is-dark" : ""}`}
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      data-cursor="theme"
      data-cursor-label={dark ? "LIGHTS ON" : "LIGHTS OUT"}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-track-day">
          <svg viewBox="0 0 20 20">
            <path d="M10 3v3m0 8v3M3 10h3m8 0h3M5 5l2 2m6 6 2 2M5 15l2-2m6-6 2-2" />
          </svg>
        </span>
        <span className="theme-track-night">
          <svg viewBox="0 0 20 20">
            <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2ZM4 12v4m-2-2h4" />
          </svg>
        </span>
        <span className="theme-toggle-thumb">
          <svg
            className="theme-eclipse"
            width="26"
            height="26"
            viewBox="0 0 32 32"
          >
            <defs>
              <mask id="theme-eclipse-mask">
                <rect width="32" height="32" fill="white" />
                <circle
                  className="theme-moon-cutout"
                  cx="20"
                  cy="11"
                  r="6.5"
                  fill="black"
                />
              </mask>
            </defs>
            <g
              className="theme-sun-rays"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.8 6.8l2.1 2.1M23.1 23.1l2.1 2.1M6.8 25.2l2.1-2.1M23.1 8.9l2.1-2.1" />
            </g>
            <circle
              className="theme-sun-core"
              cx="16"
              cy="16"
              r="6.7"
              fill="currentColor"
              mask="url(#theme-eclipse-mask)"
            />
          </svg>
        </span>
      </span>
      <span className="theme-toggle-tooltip" aria-hidden="true">
        {dark ? "BACK TO DAYLIGHT" : "A LITTLE NIGHT SHIFT"}
      </span>
    </button>
  );
}
