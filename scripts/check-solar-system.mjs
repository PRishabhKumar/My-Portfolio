import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  colorScheme: "dark",
});
const page = await context.newPage();
const result = { errors: [], planets: [], layouts: [], audits: [], checks: [] };
page.on("pageerror", (e) => result.errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") result.errors.push(m.text());
});
page.on("response", (r) => {
  if (r.status() >= 400) result.errors.push(`${r.status()} ${r.url()}`);
});
await page.goto("http://127.0.0.1:5173/?intro=skip", {
  waitUntil: "networkidle",
});
await page.locator(".education-card").scrollIntoViewIfNeeded();
await page.waitForSelector(".location-invite.is-visible");
assert.equal(
  await page.locator(".education-details").getAttribute("aria-hidden"),
  "true",
);
assert.equal(
  await page.locator(".education-details").evaluate((e) => e.inert),
  true,
);
assert.ok(
  await page
    .locator(".education-details")
    .evaluate(
      (e) => parseFloat(getComputedStyle(e).filter.match(/[\d.]+/)[0]) >= 12,
    ),
);
assert.ok(
  await page
    .locator(".location-invite strong")
    .evaluate((e) => parseFloat(getComputedStyle(e).fontSize) >= 23),
);
assert.equal(
  await page
    .locator(".education-card")
    .getByRole("heading", { name: "VIT Vellore", exact: true })
    .count(),
  0,
);
const darkAudit = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
result.audits.push({
  name: "Concealed college card",
  violations: darkAudit.violations,
});
await page.screenshot({ path: "qa/v11-concealed-card.png" });
await page
  .getByRole("button", {
    name: "Discover where I study — open the location journey",
    exact: true,
  })
  .click();
await page.waitForSelector('.location-dialog[data-state="ready"]', {
  timeout: 60000,
});
assert.equal(
  await page
    .locator(".journey-canvas canvas")
    .evaluate((c) => !!c.getContext("webgl2")),
  true,
);
const states = () =>
  page
    .locator(".journey-canvas")
    .evaluate((e) => JSON.parse(e.dataset.planets));
const first = await states();
const names = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];
assert.deepEqual(Object.keys(first), names);
assert.equal(await page.locator(".journey-planet-label").count(), 9);
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.waitForTimeout(600);
const moving = await states();
for (const name of names) {
  assert.notEqual(
    moving[name].orbit,
    first[name].orbit,
    name + " did not revolve",
  );
  assert.notEqual(
    moving[name].spin,
    first[name].spin,
    name + " did not rotate",
  );
  assert.notDeepEqual(
    moving[name].position,
    first[name].position,
    name + " did not move",
  );
  result.planets.push({ name, rotates: true, revolves: true });
}
await page
  .getByRole("button", { name: "Pause orbital motion", exact: true })
  .click();
const stopped = await states();
await page.waitForTimeout(250);
assert.deepEqual(await states(), stopped);
await page.emulateMedia({ reducedMotion: "reduce" });
result.checks.push(
  "All eight planets have individual axial rotation and orbital movement; pause freezes all of them.",
);
for (const [width, height] of [
  [320, 568],
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 1000],
  [1920, 1080],
  [844, 390],
]) {
  await page.setViewportSize({ width, height });
  await page.waitForFunction(() => {
    const element = document.querySelector(
      '.journey-planet-label[data-planet="sun"]',
    );
    if (!element) return false;
    const bounds = element.getBoundingClientRect();
    return Math.abs(bounds.x + bounds.width / 2 - innerWidth / 2) < 2;
  });
  const bounds = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    hud: document.querySelector(".journey-hud").getBoundingClientRect().y,
    labels: [
      ...document.querySelectorAll(".journey-planet-label, .solar-key-label"),
    ].map((e) => {
      const r = e.getBoundingClientRect();
      return {
        name: e.dataset.planet,
        x: r.x,
        y: r.y,
        right: r.right,
        bottom: r.bottom,
      };
    }),
  }));
  assert.equal(bounds.width, width);
  for (const label of bounds.labels) {
    if (label.right === label.x) continue;
    assert.ok(
      label.x >= 0 &&
        label.right <= width &&
        label.y >= 50 &&
        label.bottom < bounds.hud + 1,
      JSON.stringify({ width, height, label, hud: bounds.hud }),
    );
  }
  result.layouts.push({ width, height, allPlanetLabelsVisible: true });
  if (width === 390) await page.screenshot({ path: "qa/v11-solar-mobile.png" });
  if (width === 320) await page.screenshot({ path: "qa/v11-solar-small.png" });
  if (width === 1440)
    await page.screenshot({ path: "qa/v11-solar-desktop.png" });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.keyboard.press("Escape");
await page.waitForSelector(".location-dialog", { state: "detached" });
await page.waitForSelector(".location-invite.is-visible");
assert.equal(await page.locator(".education-card.is-concealed").count(), 1);
await page
  .getByRole("button", {
    name: "Discover where I study — open the location journey",
    exact: true,
  })
  .click();
await page.waitForSelector('.location-dialog[data-state="ready"]', {
  timeout: 60000,
});
await page
  .locator(".journey-scroll")
  .evaluate((e) => (e.scrollTop = e.scrollHeight));
await page.waitForSelector(".location-dialog", {
  state: "detached",
  timeout: 10000,
});
assert.equal(await page.locator(".education-card.is-concealed").count(), 0);
assert.equal(
  await page.locator(".education-details").evaluate((e) => e.inert),
  false,
);
assert.equal(
  await page
    .locator(".education-details")
    .evaluate((e) => getComputedStyle(e).filter),
  "blur(0px)",
);
assert.equal(
  await page
    .locator(".education-card")
    .getByRole("heading", { name: "VIT Vellore", exact: true })
    .count(),
  1,
);
result.checks.push(
  "Cancelling retains the blurred details and invitation; completing the journey reveals VIT, CGPA and the college details.",
);
assert.equal(result.errors.length, 0);
assert.equal(
  result.audits.reduce((n, a) => n + a.violations.length, 0),
  0,
);
await writeFile(
  "qa/solar-system-results.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
