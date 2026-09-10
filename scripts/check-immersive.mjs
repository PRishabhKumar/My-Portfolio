import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { toolkitGroups } from "../src/toolkit.js";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [],
  audits = [],
  contours = [],
  viewports = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const tick = () =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
async function audit(name) {
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  audits.push({
    name,
    violations: report.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
async function contour(locator, mode, name) {
  await locator.hover();
  await page.waitForFunction(() => {
    const layer = document.querySelector(".signature-cursor-layer");
    if (!["circle", "frame"].includes(layer.dataset.mode)) return false;
    const cursor = document
      .querySelector(".signature-cursor-position")
      .getBoundingClientRect();
    return cursor.width > 10;
  });
  await tick();
  const target = await locator.boundingBox();
  const pointer = await page
    .locator(".signature-cursor-position")
    .boundingBox();
  assert.equal(
    await page.locator(".signature-cursor-layer").getAttribute("data-mode"),
    mode,
    name,
  );
  const expected = {
    x: target.x - 6,
    y: target.y - 6,
    width: target.width + 12,
    height: target.height + 12,
  };
  const differences = ["x", "y", "width", "height"].map((key) =>
    Math.abs(expected[key] - pointer[key]),
  );
  assert.ok(
    Math.max(...differences) < 0.2,
    `${name} missed its 6px offset: ${JSON.stringify({ target, pointer })}`,
  );
  if (mode === "circle") {
    assert.equal(
      await page.locator(".cursor-contour").getAttribute("stroke-dasharray"),
      "0.1 6",
    );
    const actualDiameter = await locator.evaluate(
      (e) => e.offsetWidth * (Number(getComputedStyle(e).scale) || 1),
    );
    assert.ok(
      Math.abs(actualDiameter + 12 - pointer.width) < 0.3,
      "Circle outline did not retain its 6px breathing space",
    );
  }
  contours.push({ name, mode, maxError: Math.max(...differences) });
}
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await page.waitForSelector('.hero-artifact[data-status="ready"]', {
  timeout: 45000,
});
await page.evaluate(() => document.fonts.ready);
assert.equal(await page.locator(".hero-viewport canvas").count(), 1);
assert.equal(
  await page
    .locator(".hero-viewport canvas")
    .evaluate((c) => Boolean(c.getContext("webgl2"))),
  true,
);
assert.equal(await page.locator(".signature-cursor-layer").count(), 1);
await page.mouse.move(714, 721);
await tick();
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-mode"),
  "ball",
);
const ball = await page.locator(".signature-cursor-position").boundingBox();
assert.equal(ball.width, 14);
assert.equal(ball.height, 14);
assert.ok(Math.abs(ball.x + 7 - 714) < 0.1);
const native = await page.evaluate(() =>
  [...document.querySelectorAll("body *")]
    .filter((e) => getComputedStyle(e).cursor !== "none")
    .map((e) => e.tagName + "." + e.className),
);
assert.deepEqual(native, []);
await contour(
  page.getByRole("link", { name: "Explore my work", exact: true }),
  "frame",
  "Primary CTA",
);
await contour(
  page.getByRole("button", { name: "Switch to dark mode", exact: true }),
  "frame",
  "Eclipse pill",
);
await contour(
  page.getByRole("button", {
    name: "Unfold or assemble the orbit sculpture",
    exact: true,
  }),
  "circle",
  "Round orbit seal",
);
await contour(
  page.getByRole("button", { name: "Reset orbit sculpture", exact: true }),
  "circle",
  "Round 3D control",
);
await page.mouse.move(718, 722);
await tick();
await page.screenshot({ path: "qa/v4-hero-light.png" });
await page
  .getByRole("button", { name: "Unfold orbit sculpture", exact: true })
  .click();
await page.waitForFunction(
  () => Number(document.querySelector(".hero-viewport").dataset.spread) > 0.99,
);
await page
  .getByRole("button", { name: "Reset orbit sculpture", exact: true })
  .click();
await page.waitForFunction(
  () => Number(document.querySelector(".hero-viewport").dataset.spread) < 0.01,
);
const viewport = page.locator(".hero-viewport");
const bounds = await viewport.boundingBox();
const before = await viewport.getAttribute("data-rotation");
await page.mouse.move(
  bounds.x + bounds.width * 0.45,
  bounds.y + bounds.height * 0.48,
);
await page.mouse.down();
await page.mouse.move(
  bounds.x + bounds.width * 0.65,
  bounds.y + bounds.height * 0.56,
  { steps: 8 },
);
await page.mouse.up();
await tick();
assert.notEqual(
  await viewport.getAttribute("data-rotation"),
  before,
  "Hero did not rotate on drag",
);
await viewport.focus();
await page.keyboard.press("ArrowRight");
await tick();
await page.keyboard.press("Home");
await tick();
await audit("Light desktop");
await page
  .getByRole("button", { name: "Switch to dark mode", exact: true })
  .click();
await page.waitForFunction(
  () => !document.documentElement.classList.contains("theme-changing"),
);
await page.mouse.move(718, 722);
await tick();
await page.screenshot({ path: "qa/v4-hero-dark.png" });
await contour(
  page.getByRole("button", {
    name: "Explore NexMeet, Real-time communication platform",
    exact: true,
  }),
  "frame",
  "Project image",
);
await page
  .getByRole("button", {
    name: "Explore NexMeet, Real-time communication platform",
    exact: true,
  })
  .click();
await contour(
  page.getByRole("button", { name: "Close project details", exact: true }),
  "circle",
  "Modal close control",
);
assert.equal(
  await page
    .locator(".signature-cursor-layer")
    .evaluate((e) => e.matches(":popover-open")),
  true,
);
assert.equal(
  await page
    .locator("dialog")
    .evaluate((e) => getComputedStyle(e, "::backdrop").cursor),
  "none",
);
await audit("Dark project dialog");
await page.keyboard.press("Escape");
await page.locator(".stack-playground").scrollIntoViewIfNeeded();
await page.waitForSelector('.stack-playground[data-status="ready"]', {
  timeout: 45000,
});
await page.waitForFunction(
  () => document.querySelector(".stack-viewport").dataset.logosReady === "true",
);
assert.equal(
  await page
    .locator(".stack-viewport canvas")
    .evaluate((c) => Boolean(c.getContext("webgl2"))),
  true,
);
assert.equal(await page.locator(".stack-viewport canvas").count(), 1);
await contour(
  page.getByRole("button", { name: "Explore React in 3D", exact: true }),
  "frame",
  "Skill card",
);
await page
  .getByRole("button", { name: "Explore Next.js in 3D", exact: true })
  .click();
await tick();
assert.equal(await page.locator(".stack-focus-copy h3").innerText(), "Next.js");
assert.equal(
  await page.locator(".stack-viewport").getAttribute("data-selected"),
  "1",
);
await page
  .getByRole("button", { name: "Explore React in 3D", exact: true })
  .click();
await tick();
// Raycast a visible right-hand cartridge. This is an actual click on the 3D canvas.
const stack = page.locator(".stack-viewport");
const box = await stack.boundingBox();
let found = false;
for (const fx of [0.62, 0.64, 0.66, 0.68, 0.6]) {
  for (const fy of [0.45, 0.5, 0.55, 0.6]) {
    await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy);
    await tick();
    const hovered = await stack.getAttribute("data-hovered");
    if (hovered && Number(hovered) > 0) {
      await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
      await tick();
      assert.equal(await stack.getAttribute("data-selected"), hovered);
      found = true;
      break;
    }
  }
  if (found) break;
}
assert.equal(found, true, "No 3D cartridge was pickable");
await page
  .getByRole("button", { name: "Unfold toolkit sculpture", exact: true })
  .click();
await tick();
assert.ok(Number(await stack.getAttribute("data-spread")) > 0.99);
await page.mouse.move(38, 380);
await page
  .locator(".stack-playground")
  .screenshot({ path: "qa/v4-stack-interactive.png" });
await page
  .getByRole("button", { name: "Reset toolkit sculpture", exact: true })
  .click();
await tick();
await page.getByRole("tab", { name: "05 Languages", exact: true }).click();
await tick();
for (const group of toolkitGroups) {
  await page
    .getByRole("tab", { name: `${group.number} ${group.label}`, exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".stack-viewport").dataset.logosReady === "true",
  );
  await tick();
  assert.equal(await page.locator(".tool-card").count(), 6);
  assert.equal(await page.locator(".stack-viewport canvas").count(), 1);
  assert.equal(
    await page.locator(".stack-focus-copy h3").innerText(),
    group.tools[0][0],
  );
  const images = await page
    .locator(".technology-logo")
    .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0));
  assert.equal(images, true);
}
await audit("Dark interactive toolkit");
await page.getByRole("tab", { name: "01 Frontend", exact: true }).click();
await tick();
// Normal-motion path: real inertia, visible light bloom, and a pause that actually stops time.
await page.emulateMedia({ reducedMotion: "no-preference" });
await page
  .getByRole("button", { name: "Pause toolkit idle animation", exact: true })
  .click();
await tick();
const frozen = await stack.getAttribute("data-phase");
await page.waitForTimeout(160);
assert.equal(await stack.getAttribute("data-phase"), frozen);
await page
  .getByRole("button", { name: "Resume toolkit idle animation", exact: true })
  .click();
await page.waitForFunction(
  (value) => document.querySelector(".stack-viewport").dataset.phase !== value,
  frozen,
);
await page
  .getByRole("button", { name: "Spin toolkit sculpture", exact: true })
  .click();
const spun = await stack.getAttribute("data-rotation");
await page.waitForFunction(
  (value) =>
    document.querySelector(".stack-viewport").dataset.rotation !== value,
  spun,
);
await page.evaluate(() => {
  window.glowEvidence = [];
  document.addEventListener("pointermove", () => {
    window.glowEvidence.push(
      document.querySelector(".cursor-aura").getAnimations().length,
    );
  });
});
await page.mouse.move(35, 380);
await page.waitForTimeout(200);
await page
  .getByRole("button", { name: "Explore React in 3D", exact: true })
  .hover();
assert.ok(
  Number(
    await page.locator(".signature-cursor-layer").getAttribute("data-bloom"),
  ) > 0,
);
const effects = await page.evaluate(() => window.glowEvidence);
assert.ok(
  effects.some((count) => count > 0),
  `No bloom observed: ${JSON.stringify(effects)}`,
);
await page.screenshot({ path: "qa/v4-hover-bloom.png" });
await page.keyboard.press("Tab");
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "false",
);
await page.mouse.move(35, 380);
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "true",
);
await page.emulateMedia({ reducedMotion: "reduce" });
for (const width of [320, 375, 390, 430, 768, 850, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  await tick();
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  viewports.push({ width, scrollWidth });
  assert.equal(scrollWidth, width, `Overflow at ${width}`);
}
await page.setViewportSize({ width: 390, height: 844 });
await tick();
await page.locator(".stack-playground").scrollIntoViewIfNeeded();
await tick();
await page
  .locator(".stack-playground")
  .screenshot({ path: "qa/v4-stack-mobile.png" });
await page.locator(".contact-card").scrollIntoViewIfNeeded();
await tick();
assert.equal(
  await page
    .locator(".contact-card")
    .evaluate((e) => getComputedStyle(e).backgroundColor),
  "rgb(41, 53, 37)",
);
await audit("Dark mobile");
const mobileContext = await browser.newContext({
  ...devices["iPhone 13"],
  colorScheme: "dark",
  reducedMotion: "reduce",
});
const mobile = await mobileContext.newPage();
await mobile.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await mobile.waitForSelector('.hero-artifact[data-status="ready"]', {
  timeout: 45000,
});
assert.equal(
  await mobile
    .locator("html")
    .evaluate((e) => e.classList.contains("cursor-enabled")),
  false,
);
await mobile
  .getByRole("button", { name: "Unfold orbit sculpture", exact: true })
  .tap();
await mobile.waitForFunction(
  () => Number(document.querySelector(".hero-viewport").dataset.spread) > 0.99,
);
assert.equal(
  await mobile.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "false",
);
await mobile
  .getByRole("button", { name: "Reset orbit sculpture", exact: true })
  .tap();
await mobile.screenshot({ path: "qa/v4-hero-mobile.png" });
const hashes = JSON.parse(
  await readFile("qa/v4-project-art-before.json", "utf8"),
);
for (const [name, hash] of Object.entries(hashes))
  assert.equal(
    createHash("sha256")
      .update(await readFile(`public/images/${name}`))
      .digest("hex"),
    hash,
  );
const result = {
  errors,
  contours,
  viewports,
  audits,
  webgl:
    "Two real WebGL2 scenes, built from procedural geometry. Drag, keyboard rotation, unfold, reset, spin, pause, 3D raycast selection, DOM-to-scene synchronization, theme changes, and all five logo sets passed.",
  artwork: "All five approved project images are byte-for-byte unchanged.",
};
await writeFile("qa/immersive-results.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
assert.equal(errors.length, 0);
assert.equal(audits.flatMap((a) => a.violations).length, 0);
await browser.close();
