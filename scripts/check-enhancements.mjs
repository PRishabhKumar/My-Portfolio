import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
await mkdir("qa", { recursive: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  colorScheme: "light",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
assert.equal(await page.locator(".signature-cursor-layer").count(), 1);
assert.equal(await page.locator(".project-cursor").count(), 0);
await page.mouse.move(720, 722);
await page.waitForFunction(
  () =>
    document.querySelector(".signature-cursor-layer").dataset.visible ===
    "true",
);
assert.equal(
  await page.evaluate(() =>
    document.querySelector(".signature-cursor-layer").matches(":popover-open"),
  ),
  true,
);
assert.equal(await page.locator(".cursor-contour").count(), 1);
assert.equal(
  await page
    .locator(".cursor-ribbon, .cursor-caption, .cursor-click-shards")
    .count(),
  0,
);
assert.equal(await page.locator(".signature-cursor-art circle").count(), 0);
const native = await page.evaluate(() =>
  [...document.querySelectorAll("body *")]
    .filter((e) => getComputedStyle(e).cursor !== "none")
    .map((e) => e.tagName + "." + e.className),
);
assert.deepEqual(
  native,
  [],
  "A native cursor is leaking through a page element",
);
await page.screenshot({ path: "qa/v2-light-desktop.png" });
await page.screenshot({
  path: "qa/v2-cursor-rest.png",
  clip: { x: 677, y: 679, width: 86, height: 86 },
});
await page
  .getByRole("button", { name: "Switch to dark mode", exact: true })
  .click();
assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
assert.equal(
  await page.evaluate(() => localStorage.getItem("rishabh-theme")),
  "dark",
);
assert.equal(
  await page
    .getByRole("button", { name: "Switch to light mode", exact: true })
    .getAttribute("aria-pressed"),
  "true",
);
await page.waitForFunction(
  () => !document.documentElement.classList.contains("theme-changing"),
);
await page.mouse.move(720, 722);
await page.screenshot({ path: "qa/v2-dark-desktop.png" });
await page.screenshot({ path: "qa/v2-dark-full.png", fullPage: true });
await page.reload({ waitUntil: "networkidle" });
assert.equal(
  await page.locator("html").getAttribute("data-theme"),
  "dark",
  "Night preference was not restored",
);
const accessibility = [];
const audit = async (name) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  accessibility.push({
    name,
    violations: result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        message: n.failureSummary,
      })),
    })),
  });
};
await audit("Dark desktop");
await page
  .getByRole("button", {
    name: "Explore CareerMitra, AI-powered career platform",
    exact: true,
  })
  .hover();
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-mode"),
  "frame",
);
await page
  .getByRole("button", {
    name: "Explore CareerMitra, AI-powered career platform",
    exact: true,
  })
  .click();
await page.waitForFunction(() =>
  document.querySelector(".signature-cursor-layer").matches(":popover-open"),
);
await page
  .getByRole("button", { name: "Close project details", exact: true })
  .hover();
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "true",
);
assert.equal(
  await page
    .locator(".modal-close")
    .evaluate((e) => getComputedStyle(e).cursor),
  "none",
);
assert.equal(
  await page
    .locator("dialog")
    .evaluate((e) => getComputedStyle(e, "::backdrop").cursor),
  "none",
);
await page.screenshot({ path: "qa/v2-dark-modal-cursor.png" });
await audit("Dark project dialog");
await page.keyboard.press("Escape");
assert.equal(await page.locator("dialog").count(), 0);
await page.mouse.move(40, 100);
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "true",
);
await page.keyboard.press("Tab");
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "false",
);
await page.mouse.move(80, 110);
assert.equal(
  await page.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "true",
);
const viewports = [];
for (const width of [320, 375, 390, 430, 768, 850, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  assert.ok(scrollWidth <= width, `Dark overflow at ${width}: ${scrollWidth}`);
  viewports.push({ width, scrollWidth });
}
await page.setViewportSize({ width: 390, height: 900 });
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/v2-dark-mobile.png" });
await audit("Dark mobile");
await page.getByRole("button", { name: "Open navigation menu" }).click();
await audit("Dark mobile menu");
await page
  .getByRole("button", { name: "Switch to light mode", exact: true })
  .click();
assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
await page.keyboard.press("Escape");

// Real animation path, including modal exit and precise cursor position.
await page.setViewportSize({ width: 1440, height: 1000 });
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await page
  .locator("h1 .heading-line-content")
  .last()
  .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
await page.mouse.move(715, 721);
await page.waitForFunction(
  () =>
    document.querySelector(".signature-cursor-position").style.transform ===
    "translate3d(708px, 714px, 0px)",
);
const pathBefore = await page.locator(".cursor-contour").getAttribute("d");
await page.getByRole("link", { name: "Explore my work", exact: true }).hover();
await page.waitForFunction(
  (path) =>
    document.querySelector(".cursor-contour").getAttribute("d") !== path,
  pathBefore,
);
await page.getByRole("link", { name: "Explore my work", exact: true }).click();
await page
  .getByRole("button", {
    name: "Explore NexMeet, Real-time communication platform",
    exact: true,
  })
  .click();
await page
  .getByRole("button", { name: "Close project details", exact: true })
  .click();
await page.waitForSelector("dialog", { state: "detached" });
assert.equal(await page.evaluate(() => document.body.style.overflow), "");
await page
  .getByRole("button", { name: "Switch to dark mode", exact: true })
  .click();
await page.waitForFunction(
  () => !document.documentElement.classList.contains("theme-changing"),
);
await page
  .getByRole("button", { name: "Switch to light mode", exact: true })
  .click();
await page.waitForFunction(
  () => !document.documentElement.classList.contains("theme-changing"),
);

const mobileContext = await browser.newContext({
  ...devices["iPhone 13"],
  colorScheme: "dark",
});
const mobile = await mobileContext.newPage();
await mobile.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
assert.equal(
  await mobile.locator("html").getAttribute("data-theme"),
  "dark",
  "System preference was not respected",
);
assert.equal(
  await mobile
    .locator("html")
    .evaluate((el) => el.classList.contains("cursor-enabled")),
  false,
);
assert.equal(
  await mobile.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "false",
);
await mobile
  .getByRole("button", { name: "Switch to light mode", exact: true })
  .tap();
assert.equal(await mobile.locator("html").getAttribute("data-theme"), "light");
assert.equal(
  await mobile.locator(".signature-cursor-layer").getAttribute("data-visible"),
  "false",
);

const result = {
  errors,
  cursor:
    "One ball cursor with 6px-offset frames and dotted circular outlines. Native cursor suppressed across every DOM element and dialog backdrop. Tracks accurately, morphs on hover, and hides for keyboard/touch.",
  theme:
    "Toggle, saved preference, system default, both modal and mobile-menu themes, and touch operation passed.",
  motion:
    "Masked headings, cursor hover feedback, pointer accuracy, and animated dialog exit passed.",
  viewports,
  accessibility,
};
await writeFile(
  "qa/enhancements-results.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
assert.equal(errors.length, 0);
assert.equal(
  accessibility.flatMap((r) => r.violations).length,
  0,
  "Accessibility violations remain",
);
await browser.close();
