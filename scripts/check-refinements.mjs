import { chromium } from "playwright";
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
  reducedMotion: "reduce",
  colorScheme: "light",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
const results = [];
for (const theme of ["light", "dark"]) {
  if (theme === "dark") {
    await page
      .getByRole("button", { name: "Switch to dark mode", exact: true })
      .click();
    await page.waitForFunction(
      () => !document.documentElement.classList.contains("theme-changing"),
    );
  }
  for (const group of toolkitGroups) {
    await page
      .getByRole("tab", { name: `${group.number} ${group.label}`, exact: true })
      .click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".technology-logo")].every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    );
    const expected = group.tools.reduce(
      (count, tool) => count + tool[2].length,
      0,
    );
    assert.equal(await page.locator(".tool-card").count(), 6);
    assert.equal(await page.locator(".technology-logo").count(), expected);
    assert.equal(await page.locator(".tool-symbol > svg").count(), 0);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    results.push({
      theme,
      group: group.label,
      logos: expected,
      violations: audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
    if (theme === "dark")
      await page
        .locator(".toolkit-section")
        .screenshot({ path: `qa/v3-toolkit-${group.id}.png` });
  }
  await page.locator(".contact-card").scrollIntoViewIfNeeded();
  await page.mouse.move(32, 100);
  const background = await page
    .locator(".contact-card")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  assert.equal(
    background,
    theme === "dark" ? "rgb(41, 53, 37)" : "rgb(194, 238, 124)",
  );
  await page
    .locator(".contact-card")
    .screenshot({ path: `qa/v3-contact-${theme}.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.locator(".contact-card").scrollIntoViewIfNeeded();
await page
  .locator(".contact-card")
  .screenshot({ path: "qa/v3-contact-mobile.png" });
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth),
  390,
);
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await page.mouse.move(730, 150);
assert.equal(await page.locator(".cursor-contour").count(), 1);
assert.equal(
  await page
    .locator(
      ".signature-cursor-art circle, .cursor-caption, .cursor-click-shards",
    )
    .count(),
  0,
);
assert.equal(
  await page
    .locator(".signature-cursor-art")
    .evaluate((el) => el.getBoundingClientRect().width),
  14,
);
assert.equal(
  await page.locator(".hero h1").evaluate((el) => getComputedStyle(el).cursor),
  "none",
);
await page.screenshot({
  path: "qa/v3-quiet-cursor.png",
  clip: { x: 700, y: 120, width: 110, height: 110 },
});

const before = JSON.parse(
  await readFile("qa/unchanged-project-art.json", "utf8"),
);
for (const [id, hash] of Object.entries(before)) {
  const current = createHash("sha256")
    .update(await readFile(`public/images/${id}-preview.webp`))
    .digest("hex");
  assert.equal(
    current,
    hash,
    `The approved ${id} art was unexpectedly changed`,
  );
}
await page.goto("http://127.0.0.1:5173/?artwork=nexmeet", {
  waitUntil: "networkidle",
});
const imageLayout = await page.evaluate(() => ({
  workspace: document.querySelector(".nex-workspace").offsetHeight,
  videos: document.querySelector(".video-grid").offsetHeight,
  chat: document.querySelector(".nex-chat").offsetHeight,
  photos: [...document.querySelectorAll(".video-tile img")].every(
    (img) => img.complete && img.naturalWidth > 0,
  ),
  controlsBottom:
    document.querySelector(".video-toolbar").offsetTop +
    document.querySelector(".video-toolbar").offsetHeight,
  windowHeight: document.querySelector(".nex-browser").clientHeight,
}));
assert.equal(imageLayout.workspace, imageLayout.videos);
assert.equal(imageLayout.workspace, imageLayout.chat);
assert.equal(imageLayout.photos, true);
assert.ok(imageLayout.controlsBottom <= imageLayout.windowHeight);
await writeFile(
  "qa/refinement-results.json",
  JSON.stringify(
    {
      errors,
      results,
      imageLayout,
      approvedProjectImages: "Other four previews are byte-for-byte unchanged.",
      cursor:
        "One cursor layer with an spaced hover contour; no labels or legacy pointer.",
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    { errors, results, imageLayout, approvedProjectImages: "unchanged" },
    null,
    2,
  ),
);
assert.equal(errors.length, 0);
assert.equal(results.flatMap((r) => r.violations).length, 0);
await browser.close();
