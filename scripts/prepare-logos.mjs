// Download and self-host actual brand artwork; no generic substitute icons.
// This is a build-time utility only. The website never calls a logo CDN.
import * as simpleIcons from "simple-icons";
import { mkdir, writeFile } from "node:fs/promises";
const directory = new URL("../public/logos/", import.meta.url);
await mkdir(directory, { recursive: true });
const sources = [];
const icons = Object.values(simpleIcons).filter((item) => item?.slug);
for (const [id, slug] of [
  ["socketio", "socketdotio"],
  ["webrtc", "webrtc"],
  ["nginx", "nginx"],
  ["git", "git"],
  ["hoppscotch", "hoppscotch"],
  ["copilot", "githubcopilot"],
  ["claude", "claude"],
  ["docker", "docker"],
]) {
  const icon = icons.find((icon) => icon.slug === slug);
  if (!icon) throw new Error(`Missing brand: ${slug}`);
  const svg = icon.svg.replace("<svg ", `<svg fill="#${icon.hex}" `);
  await writeFile(new URL(`${id}.svg`, directory), svg);
  sources.push({
    id,
    file: `${id}.svg`,
    provider: "Simple Icons",
    brandSource: icon.source,
    source: `https://github.com/simple-icons/simple-icons/blob/develop/icons/${slug}.svg`,
  });
}
const devicon =
  "https://raw.githubusercontent.com/devicons/devicon/master/icons/";
const external = [
  ["react", devicon + "react/react-original.svg"],
  ["nextjs", devicon + "nextjs/nextjs-original.svg"],
  ["javascript", devicon + "javascript/javascript-original.svg"],
  ["typescript", devicon + "typescript/typescript-original.svg"],
  ["html5", devicon + "html5/html5-original.svg"],
  ["css3", devicon + "css3/css3-original.svg"],
  ["framer-motion", devicon + "framermotion/framermotion-original.svg"],
  ["nodejs", devicon + "nodejs/nodejs-original.svg"],
  ["express", devicon + "express/express-original.svg"],
  ["mongodb", devicon + "mongodb/mongodb-original.svg"],
  ["mysql", devicon + "mysql/mysql-original.svg"],
  ["flask", devicon + "flask/flask-original.svg"],
  ["opencv", devicon + "opencv/opencv-original.svg"],
  ["python", devicon + "python/python-original.svg"],
  ["java", devicon + "java/java-original.svg"],
  ["c", devicon + "c/c-original.svg"],
  [
    "aws",
    devicon + "amazonwebservices/amazonwebservices-original-wordmark.svg",
  ],
  [
    "gemini",
    "https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/gemini-color.svg",
  ],
  [
    "openai",
    "https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/openai.svg",
  ],
  [
    "vite",
    "https://raw.githubusercontent.com/voidzero-dev/community-design-resources/55902097229cf01cf2a4ceb376f992f5cf306756/brand-assets/vite/vite-icon-color-bracketless.svg",
  ],
  [
    "tesseract",
    "https://raw.githubusercontent.com/naptha/tesseract.js/master/docs/images/tesseract.png",
  ],
  [
    "porcupine",
    "https://raw.githubusercontent.com/Picovoice/porcupine/master/demo/flutter/ios/Runner/Assets.xcassets/AppIcon.appiconset/pv_circle_512-1024.png",
  ],
];
await Promise.all(
  external.map(async ([id, url]) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${id}: ${response.status}`);
    const isSvg = url.endsWith(".svg");
    let data = isSvg
      ? await response.text()
      : Buffer.from(await response.arrayBuffer());
    if (isSvg) {
      if (!data.includes("<svg")) throw new Error(`${id}: not an SVG`);
      data = data.replaceAll("currentColor", "#20251c");
      if (/<script|<foreignObject|onload=/i.test(data))
        throw new Error(`${id}: invalid SVG content`);
    }
    const file = `${id}.${isSvg ? "svg" : "png"}`;
    await writeFile(new URL(file, directory), data);
    sources.push({
      id,
      file,
      provider: url.includes("/devicons/")
        ? "Devicon"
        : url.includes("/lobehub/")
          ? "Lobe Icons"
          : "Project-owned repository",
      source: url,
    });
    console.log(`Saved ${id}`);
  }),
);
await writeFile(
  new URL("sources.json", directory),
  JSON.stringify(
    sources.sort((a, b) => a.id.localeCompare(b.id)),
    null,
    2,
  ),
);
await writeFile(
  new URL("NOTICE.txt", directory),
  "Brand artwork is displayed for identification of technologies used. Marks remain the property of their respective owners; no endorsement is implied. Sources for each file are in sources.json. Simple Icons artwork is distributed under CC0, Devicon under MIT, and Lobe Icons under MIT. The Tesseract.js and Picovoice images come from their own project repositories. Porcupine uses the Picovoice SDK app mark. SQL, NLP, and REST are concepts rather than unique brands, so their cards explicitly identify the implementation (MySQL, Python, Flask) instead of inventing a logo.\n",
);
console.log(`${sources.length} authentic brand assets saved locally.`);
