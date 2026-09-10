import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
await mkdir("qa", { recursive: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "qa/desktop-hero.png" });
await page.screenshot({ path: "qa/desktop-full.png", fullPage: true });
assert.equal(await page.locator(".project-card").count(), 5);
await page.getByRole("button", { name: "AI-powered", exact: true }).click();
assert.equal(await page.locator(".project-card").count(), 3);
await page.getByRole("button", { name: "Real-time", exact: true }).click();
assert.equal(await page.locator(".project-card").count(), 1);
await page.getByRole("button", { name: "All projects", exact: true }).click();
assert.equal(await page.locator(".project-card").count(), 5);
await page
  .getByRole("button", {
    name: "Explore CareerMitra, AI-powered career platform",
    exact: true,
  })
  .click();
assert.equal(await page.locator("dialog").isVisible(), true);
assert.equal(await page.locator("#modal-title").innerText(), "CareerMitra");
await page.screenshot({ path: "qa/project-modal.png" });
await page.getByRole("button", { name: "Next project", exact: true }).click();
assert.equal(await page.locator("#modal-title").innerText(), "PRsonality");
await page.keyboard.press("Escape");
assert.equal(await page.locator("dialog").count(), 0);
assert.equal(await page.evaluate(() => document.body.style.overflow), "");
await page.getByRole("tab", { name: "03 AI & automation" }).click();
assert.equal(
  await page.locator('[role="tabpanel"] h3').first().innerText(),
  "Gemini API",
);
await page.keyboard.press("ArrowRight");
assert.equal(
  await page.locator('[role="tabpanel"] h3').first().innerText(),
  "AWS",
);
await page.getByRole("tab", { name: "01 Frontend" }).click();
await page.getByRole("button", { name: /02 Stay a beginner/ }).click();
assert.equal(
  await page
    .getByRole("button", { name: /02 Stay a beginner/ })
    .getAttribute("aria-expanded"),
  "true",
);
await page.getByRole("button", { name: "Copy email address" }).click();
await page.waitForFunction(() =>
  document
    .querySelector('[role="status"]')
    .textContent.includes("Email copied"),
);
assert.match(await page.getByRole("status").innerText(), /Email copied/);
assert.equal(
  await page.evaluate(() => navigator.clipboard.readText()),
  "rishabh260405@gmail.com",
);
const downloadPromise = page.waitForEvent("download");
await page.getByRole("link", { name: "Download résumé", exact: true }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), "Rishabh-Kumar-Resume.pdf");
const measurements = [];
for (const width of [320, 375, 390, 430, 768, 850, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
  const result = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    missingImages: [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.src),
  }));
  measurements.push(result);
  assert.ok(
    result.scrollWidth <= width,
    `Horizontal overflow at ${width}: ${result.scrollWidth}`,
  );
  // Force lazy artwork into view before checking loading.
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.locator("#home").scrollIntoViewIfNeeded();
  if (width === 390) {
    await page.screenshot({ path: "qa/mobile-hero.png" });
    await page.screenshot({ path: "qa/mobile-full.png", fullPage: true });
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    assert.equal(
      await page.locator(".menu-toggle").getAttribute("aria-expanded"),
      "true",
    );
    await page
      .locator("#mobile-navigation")
      .getByRole("link", { name: "02 About" })
      .click();
    assert.equal(await page.locator("#mobile-navigation").count(), 0);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    await page
      .getByRole("button", {
        name: "Explore NexMeet, Real-time communication platform",
        exact: true,
      })
      .click();
    assert.equal(await page.locator("dialog").isVisible(), true);
    await page.screenshot({ path: "qa/mobile-modal.png" });
    await page.getByRole("button", { name: "Close project details" }).click();
  }
}
await writeFile(
  "qa/test-results.json",
  JSON.stringify(
    {
      errors,
      measurements,
      passed:
        "Project filters, modal navigation and Escape, toolkit keyboard navigation, accordion, clipboard, resume download, mobile menu, mobile modal, responsive overflow checks.",
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    { errors, measurements, status: "ALL CHECKS PASSED" },
    null,
    2,
  ),
);
assert.equal(errors.length, 0, "Browser errors found");
await browser.close();
