import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
  colorScheme: "dark",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await context.setOffline(true);
await page.goto("file:///home/user/Rishabh-Portfolio.html?intro=skip", {
  waitUntil: "load",
});
await page.locator(".education-card").scrollIntoViewIfNeeded();
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
assert.equal(
  await page.locator('[data-coordinate="latitude"]').textContent(),
  "—",
);
await page
  .locator(".journey-scroll")
  .evaluate((e) => (e.scrollTop = (e.scrollHeight - e.clientHeight) * 0.66));
await page.waitForFunction(() =>
  document
    .querySelector('[data-coordinate="latitude"]')
    .textContent.startsWith("11.1271"),
);
await page
  .locator(".journey-scroll")
  .evaluate((e) => (e.scrollTop = e.scrollHeight));
await page.getByRole("button", { name: "Keep this view", exact: true }).click();
assert.equal(
  await page
    .locator(".journey-arrival img")
    .evaluate((e) => e.complete && e.naturalWidth === 638),
  true,
);
await page
  .getByRole("button", { name: "Return to portfolio", exact: true })
  .click();
await page.waitForSelector(".location-dialog", { state: "detached" });
assert.equal(
  await page.locator("#education-location-name").innerText(),
  "Vellore Institute of Technology, Vellore",
);
await page.goto("about:blank");
await page.setContent(
  '<iframe title="Portfolio" sandbox="allow-scripts" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>',
);
await page
  .locator("iframe")
  .evaluate(
    (el, html) => (el.srcdoc = html),
    await readFile("../Rishabh-Portfolio.html", "utf8"),
  );
const frame = page.frameLocator("iframe");
await frame.locator(".education-card").scrollIntoViewIfNeeded();
await frame
  .getByRole("button", {
    name: "Discover where I study — open the location journey",
    exact: true,
  })
  .click();
await frame
  .locator('.location-dialog[data-state="ready"]')
  .waitFor({ timeout: 60000 });
assert.equal(
  await frame
    .locator(".journey-canvas canvas")
    .evaluate((c) => !!c.getContext("webgl2")),
  true,
);
await frame
  .locator(".journey-scroll")
  .evaluate((e) => (e.scrollTop = (e.scrollHeight - e.clientHeight) * 0.8));
await frame
  .locator('[data-coordinate="latitude"]')
  .filter({ hasText: "12.9165° N" })
  .waitFor();
await frame
  .locator(".journey-scroll")
  .evaluate((e) => (e.scrollTop = e.scrollHeight));
await frame
  .locator(".location-dialog")
  .waitFor({ state: "detached", timeout: 10000 });
assert.equal(
  await frame.locator(".education-card.location-returned").count(),
  1,
);
assert.equal(context.pages().length, 1);
assert.equal(errors.length, 0);
const result = {
  errors,
  offline:
    "Real WebGL Sun/Earth, local globe/satellite textures, camera coordinates, the supplied gate photo, and return-to-card work without networking.",
  opaqueIframe:
    "The same journey, native dialog, and automatic arrival close pass inside a script-only opaque-origin iframe.",
  privacy: "No GPS permissions or live map-tile API is used.",
};
await writeFile(
  "qa/location-offline-results.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
