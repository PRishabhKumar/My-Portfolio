import { chromium } from "playwright";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { BOOT, CD_COMMAND, NPM_COMMAND } from "../src/boot-sequence.js";

// The restored intro is a desktop/Command Prompt story, not the retired workstation.
const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-webgl"],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  reducedMotion: "no-preference",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const epoch = new Date("2026-09-10T06:00:00Z");
await page.clock.install({ time: epoch });
await page.clock.pauseAt(epoch);
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".boot-intro");
assert.equal(await page.locator(".studio-intro,.code-workbench").count(), 0);
await page.evaluate(() => {
  window.introClicks = [];
  document.addEventListener("click", (e) => {
    if (e.target.closest(".boot-local-link"))
      introClicks.push({ ctrl: e.ctrlKey, prevented: e.defaultPrevented });
  });
});
async function at(time) {
  const current = Number(
    await page.locator(".boot-intro").getAttribute("data-time"),
  );
  await page.clock.fastForward(Math.max(1, time - current));
  await page.clock.runFor(17);
}
await at(BOOT.start + 400);
assert.equal(await page.locator(".boot-start-menu").count(), 1);
assert.equal(await page.locator(".boot-pinned-grid").count(), 1);
await at(BOOT.searchEnd + 200);
assert.match(
  await page.locator(".boot-search-field").textContent(),
  /command prompt/,
);
await at(BOOT.terminal + 400);
assert.equal(await page.locator(".boot-start-menu").count(), 0);
assert.equal(
  await page.locator('[data-command="directory"]').textContent(),
  "Rishabh>",
);
await at(BOOT.cdEnd + 200);
assert.equal(
  await page.locator('[data-command="directory"]').textContent(),
  "Rishabh>" + CD_COMMAND,
);
await at(BOOT.npmEnd + 200);
assert.equal(
  await page.locator('[data-command="start-server"]').textContent(),
  "Rishabh's Portfolio>" + NPM_COMMAND,
);
await at(BOOT.local + 200);
assert.equal(
  await page.locator(".boot-local-link").textContent(),
  "http://localhost:5173/",
);
await at(BOOT.click + 100);
assert.deepEqual(await page.evaluate(() => introClicks), [
  { ctrl: true, prevented: true },
]);
await page.clock.fastForward(BOOT.exit + 100);
assert.equal(await page.locator(".boot-intro").count(), 0);
assert.equal(await page.locator("#main-content").count(), 1);
assert.equal(errors.length, 0);
const result = {
  errors,
  seconds: (BOOT.click + BOOT.exit) / 1000,
  status:
    "Restored Windows desktop → Start search → Command Prompt → original commands → automatic portfolio handoff. No 3D workstation or VS Code opening.",
};
await writeFile("qa/intro-results.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
