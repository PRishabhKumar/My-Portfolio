import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const results = [];
const audit = async (name) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  results.push({
    name,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
};
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await audit("Desktop");
await page
  .getByRole("button", {
    name: "Explore CareerMitra, AI-powered career platform",
    exact: true,
  })
  .click();
await audit("Project dialog");
await page.keyboard.press("Escape");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173/?intro=skip", { waitUntil: "networkidle" });
await audit("Mobile");
await page.getByRole("button", { name: "Open navigation menu" }).click();
await audit("Mobile menu");
await writeFile(
  "qa/accessibility-results.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
await browser.close();
