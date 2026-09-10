// A visual startup story, not a shell. No command here is ever executed.
export const BOOT = Object.freeze({
  // Give the desktop, then the opened Start menu, a moment to settle.
  start: 1800,
  search: 3400,
  searchEnd: 5000,
  searchEnter: 5800,
  terminal: 6700,
  // Read the prompt before typing; hold each finished command before Enter.
  cd: 8500,
  cdEnd: 11000,
  cdEnter: 11900,
  npm: 13300,
  npmEnd: 14700,
  npmEnter: 15600,
  output: 16350,
  ready: 17050,
  local: 17450,
  help: 17800,
  // Leave the startup output visible before moving to and opening the link.
  point: 20000,
  control: 20850,
  click: 21700,
  exit: 850,
});
export const SEARCH_COMMAND = "command prompt";
export const CD_COMMAND = ` cd "Rishabh's Portfolio"`;
export const NPM_COMMAND = " npm run dev";

export function typed(text, time, start, end) {
  const progress = Math.max(0, Math.min(1, (time - start) / (end - start)));
  return text.slice(0, Math.floor(progress * text.length));
}

export function bootPhase(time) {
  if (time < BOOT.start) return "desktop";
  if (time < BOOT.search) return "start";
  if (time < BOOT.terminal) return "search";
  if (time < BOOT.cdEnter) return "directory";
  if (time < BOOT.output) return "command";
  if (time < BOOT.point) return "server";
  if (time < BOOT.click) return "link";
  return "opening";
}

export function shouldPlayIntro() {
  // A direct entry point for reduced-motion visitors, deep links, and testing.
  return (
    new URLSearchParams(location.search).get("intro") !== "skip" &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
