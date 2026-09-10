import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 800, height: 520 },
  deviceScaleFactor: 1.5,
  reducedMotion: "reduce",
  colorScheme: "light",
});
await mkdir("artwork-renders", { recursive: true });
const selected = process.argv.slice(2);
const ids = selected.length
  ? selected
  : ["careermitra", "prsonality", "nexmeet", "wanderly", "jarvis"];
for (const id of ids) {
  await page.goto(`http://127.0.0.1:5173/?artwork=${id}`, {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator(".artwork-export")
    .screenshot({ path: `artwork-renders/${id}.png` });
  console.log(`Rendered ${id}`);
}
await browser.close();
