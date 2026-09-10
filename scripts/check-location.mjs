import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { DESTINATION, routeAt } from "../src/location-data.js";

const URL = "http://127.0.0.1:5173/?intro=skip";
const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  colorScheme: "dark",
});
const page = await context.newPage();
const result = {
  errors: [],
  checks: [],
  coordinates: [],
  layouts: [],
  audits: [],
};
page.on("pageerror", (e) => result.errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") result.errors.push(m.text());
});
page.on("response", (r) => {
  if (r.status() >= 400) result.errors.push(`${r.status()} ${r.url()}`);
});
const trigger = () =>
  page.getByRole("button", {
    name: "Discover where I study — open the location journey",
    exact: true,
  });
async function open() {
  await trigger().click();
  await page.waitForSelector('.location-dialog[data-state="ready"]', {
    timeout: 60000,
  });
}
async function go(progress) {
  await page
    .locator(".journey-scroll")
    .evaluate(
      (el, value) =>
        (el.scrollTop = (el.scrollHeight - el.clientHeight) * value),
      progress,
    );
  await page.waitForFunction(
    (v) =>
      Math.abs(
        Number(document.querySelector(".location-dialog")?.dataset.progress) -
          v,
      ) < 0.004,
    progress,
  );
}
async function audit(name) {
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  result.audits.push({
    name,
    violations: report.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await writeFile(
    "qa/location-audits.json",
    JSON.stringify(result.audits, null, 2),
  );
}
await page.goto(URL, { waitUntil: "networkidle" });
assert.equal(await page.locator(".location-invite.is-visible").count(), 0);
await page.locator(".education-card").scrollIntoViewIfNeeded();
await page.waitForSelector(".location-invite.is-visible");
assert.match(
  await page.locator(".location-invite").innerText(),
  /Please click here[\s\S]*to know/,
);
assert.equal(
  await page
    .locator(".education-journey-trigger")
    .evaluate(
      (e) =>
        Math.abs(
          e.getBoundingClientRect().height -
            e.parentElement.getBoundingClientRect().height,
        ) < 3,
    ),
  true,
);
await audit("Education card with location invitation");
await open();
const bodyY = await page.evaluate(() => scrollY);
assert.equal(
  await page.locator(".location-dialog").evaluate((d) => d.open),
  true,
);
assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
assert.equal(
  await page
    .locator(".journey-canvas canvas")
    .evaluate((c) => !!c.getContext("webgl2")),
  true,
);
assert.equal(
  await page.locator('[data-coordinate="latitude"]').innerText(),
  "—",
);
assert.equal(
  await page.locator('[data-coordinate="longitude"]').innerText(),
  "—",
);
await page.emulateMedia({ reducedMotion: "no-preference" });
const beforeOrbit = await page
  .locator(".journey-canvas")
  .getAttribute("data-orbit");
const beforeRotation = await page
  .locator(".journey-canvas")
  .getAttribute("data-rotation");
await page.waitForFunction(
  (v) => document.querySelector(".journey-canvas").dataset.orbit !== v,
  beforeOrbit,
);
await page.waitForFunction(
  (v) => document.querySelector(".journey-canvas").dataset.rotation !== v,
  beforeRotation,
);
await page
  .getByRole("button", { name: "Pause orbital motion", exact: true })
  .click();
const frozen = await page.locator(".journey-canvas").getAttribute("data-orbit");
await page.waitForTimeout(250);
assert.equal(
  await page.locator(".journey-canvas").getAttribute("data-orbit"),
  frozen,
);
await page.emulateMedia({ reducedMotion: "reduce" });
await audit("Glass location dialog, space stage");
const close = page.getByRole("button", {
  name: "Close location journey",
  exact: true,
});
await close.hover();
await page.evaluate(
  () =>
    new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
);
assert.equal(
  await page
    .locator(".signature-cursor-layer")
    .evaluate((e) => e.matches(":popover-open")),
  true,
);
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-mode"),
  "circle",
);
assert.ok(
  Math.abs(
    (await page.locator(".signature-cursor-position").boundingBox()).width -
      (await close.boundingBox()).width -
      12,
  ) < 0.2,
);
assert.equal(
  await page
    .locator(".location-dialog")
    .evaluate((e) => getComputedStyle(e, "::backdrop").cursor),
  "none",
);
result.checks.push(
  "Whole-card trigger, scroll-revealed hint, native dialog, independent scroll lock, real WebGL2 rotation/revolution, pause and dialog-safe custom cursor passed.",
);
await page.mouse.move(800, 520);
await page.mouse.wheel(0, 1300);
await page.waitForFunction(
  () => document.querySelector(".journey-scroll").scrollTop > 1000,
);
assert.equal(await page.evaluate(() => scrollY), bodyY);
await page.waitForFunction(
  () =>
    document.querySelector('[data-coordinate="latitude"]').textContent !== "—",
);
for (const [name, progress] of [
  ["India", 0.48],
  ["Tamil Nadu", 0.66],
  ["Vellore", 0.8],
  ["VIT main gate", 0.91],
]) {
  await go(progress);
  const position = await page.locator(".journey-canvas").evaluate((e) => ({
    lat: Number(e.dataset.lat),
    lon: Number(e.dataset.lon),
  }));
  const expected = routeAt(progress);
  assert.ok(
    Math.abs(position.lat - expected.lat) < 0.015 &&
      Math.abs(position.lon - expected.lon) < 0.015,
    JSON.stringify(position),
  );
  result.coordinates.push({ name, ...position });
  assert.equal(await page.evaluate(() => scrollY), bodyY);
  if (name === "India") await audit("India satellite approach");
}
await go(1);
await page.getByRole("button", { name: "Keep this view", exact: true }).click();
assert.equal(
  await page
    .locator(".journey-arrival img")
    .evaluate((e) => e.complete && e.naturalWidth === 638),
  true,
);
assert.match(
  await page.locator(".journey-arrival h3").innerText(),
  /Vellore Institute of Technology/,
);
assert.equal(
  await page.locator('[data-coordinate="latitude"]').innerText(),
  `${DESTINATION.lat.toFixed(4)}° N`,
);
await audit("VIT main-gate arrival");
for (const [width, height] of [
  [320, 568],
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
  [850, 768],
  [1024, 768],
  [1280, 800],
  [1440, 1000],
  [1920, 1080],
  [844, 390],
]) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(70);
  const boxes = await page.evaluate(() => {
    const r = (e) => {
      const b = e.getBoundingClientRect();
      return { x: b.x, y: b.y, right: b.right, bottom: b.bottom };
    };
    return {
      doc: document.documentElement.scrollWidth,
      photo: r(document.querySelector(".journey-arrival")),
      hud: r(document.querySelector(".journey-hud")),
      header: r(document.querySelector(".journey-header")),
      close: r(document.querySelector(".journey-close")),
      progress: Number(
        document.querySelector(".location-dialog").dataset.progress,
      ),
    };
  });
  assert.equal(boxes.doc, width);
  assert.ok(
    boxes.photo.x >= 0 &&
      boxes.photo.right <= width &&
      boxes.close.bottom < height,
  );
  assert.ok(
    boxes.photo.bottom <= boxes.hud.y + 2,
    JSON.stringify({ width, height, ...boxes }),
  );
  assert.ok(
    boxes.photo.y >= boxes.header.bottom - 3,
    JSON.stringify({ width, height, ...boxes }),
  );
  assert.ok(boxes.progress > 0.985, "Resize lost the scroll position.");
  result.layouts.push({ width, height, photoFits: true });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page
  .getByRole("button", { name: "Return to portfolio", exact: true })
  .click();
await page.waitForSelector(".location-dialog", { state: "detached" });
assert.equal(await page.evaluate(() => document.body.style.overflow), "");
assert.equal(
  await page.locator(".education-card.location-returned").count(),
  1,
);
await page.waitForFunction(() => {
  const r = document
    .querySelector("#education-location-name")
    .getBoundingClientRect();
  return r.top > 80 && r.bottom < innerHeight;
});
result.checks.push(
  "Real wheel scrolling leaves the page still; camera coordinates track the actual globe view through India, Tamil Nadu, Vellore and the campus. The supplied gate photo and full college name are shown; Keep this view and return work.",
);
// The normal path closes itself only after the gate is visible for the arrival hold.
await open();
await go(1);
await page.waitForSelector(".location-dialog", {
  state: "detached",
  timeout: 10000,
});
assert.equal(await page.evaluate(() => document.body.style.overflow), "");
result.checks.push(
  "Arrival auto-close and college-name focus/scroll return passed.",
);
await open();
await page.keyboard.press("Escape");
await page.waitForSelector(".location-dialog", { state: "detached" });
await page.waitForFunction(() =>
  document.activeElement?.matches(".education-journey-trigger"),
);
assert.equal(
  await trigger().evaluate((e) => document.activeElement === e),
  true,
);
result.checks.push("Escape and keyboard focus restoration passed.");
await context.close();

const mobileContext = await browser.newContext({
  ...devices["iPhone 13"],
  reducedMotion: "reduce",
});
const phone = await mobileContext.newPage();
phone.on("pageerror", (e) => result.errors.push(e.message));
await phone.goto(URL, { waitUntil: "networkidle" });
await phone.locator(".education-card").scrollIntoViewIfNeeded();
await phone
  .getByRole("button", {
    name: "Discover where I study — open the location journey",
    exact: true,
  })
  .tap();
await phone.waitForSelector('.location-dialog[data-state="ready"]', {
  timeout: 60000,
});
const y = await phone.evaluate(() => scrollY);
const session = await mobileContext.newCDPSession(phone);
await session.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: 195, y: 510 }],
});
await session.send("Input.dispatchTouchEvent", {
  type: "touchMove",
  touchPoints: [{ x: 195, y: 230 }],
});
await session.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
await phone.waitForFunction(
  () => document.querySelector(".journey-scroll").scrollTop > 30,
);
assert.equal(await phone.evaluate(() => scrollY), y);
await phone
  .getByRole("button", { name: "Close location journey", exact: true })
  .tap();
await phone.waitForSelector(".location-dialog", { state: "detached" });
await mobileContext.close();
await browser.close();
result.checks.push(
  "Touch scrolling is contained in the journey, without moving the underlying page.",
);

const fallbackBrowser = await chromium.launch({
  args: ["--no-sandbox", "--disable-webgl"],
});
const fallback = await fallbackBrowser.newPage({ reducedMotion: "reduce" });
await fallback.goto(URL, { waitUntil: "networkidle" });
await fallback
  .locator(".education-card")
  .evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
await fallback
  .getByRole("button", {
    name: "Discover where I study — open the location journey",
    exact: true,
  })
  .click();
await fallback.waitForSelector('.location-dialog[data-state="fallback"]');
assert.equal(await fallback.locator(".journey-fallback").count(), 1);
await fallback
  .getByRole("button", { name: "Go to Vellore", exact: true })
  .click();
await fallback.waitForFunction(
  () =>
    Number(document.querySelector(".location-dialog").dataset.progress) > 0.75,
);
await fallback
  .getByRole("button", { name: "Close location journey", exact: true })
  .click();
await fallback.waitForSelector(".location-dialog", { state: "detached" });
await fallbackBrowser.close();
result.checks.push("No-WebGL fallback remains navigable and closable.");
const preserved = JSON.parse(
  await readFile("qa/pre-location-preserved.json", "utf8"),
);
for (const [path, hash] of Object.entries(preserved))
  assert.equal(
    createHash("sha256")
      .update(await readFile(path))
      .digest("hex"),
    hash,
    path,
  );
result.checks.push(
  "All five approved project images and the original cursor/3D portfolio assets are unchanged.",
);
await writeFile("qa/location-results.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
assert.equal(result.errors.length, 0);
assert.equal(
  result.audits.reduce((n, a) => n + a.violations.length, 0),
  0,
);
