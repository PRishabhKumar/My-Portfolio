# Rishabh Kumar · Portfolio

An editorial portfolio built with **React + Vite**, inspired by Rishabh’s attached resume. Warm ivory, deep ink, and lime; no blue-purple gradients, template stock photos, or invented professional experience.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` folder to a static host such as Netlify, Vercel, or Cloudflare Pages. Use `npm run build` as the build command and `dist` as the output directory. Assets assume deployment at the root of the domain. There is no backend or environment-variable setup.

## Standalone version

`Rishabh-Portfolio.html` is also supplied as a separate deliverable. It embeds the application, styles, fonts, artwork, and original resume in one HTML file. Download it and open it in a modern browser—no server or installation required.

To regenerate it from this source:

```bash
npm run build
python scripts/export-standalone.py
```

The default output is `../Rishabh-Portfolio.html`. You can pass a different output path as an argument. External project links need an internet connection; email links open the visitor’s configured mail client.

## What’s included

- Fully responsive layouts, tested at widths from **320px to 1920px**.
- Responsive navigation with active-section indicators, smooth anchor scrolling, and a reading-progress bar.
- A real, draggable 3D orbital sculpture, a hands-on 3D skills carousel, rotating stamp, masked typography, layered scroll reveals, magnetic controls, and the site-wide EMBRACE cursor.
- Five projects: CareerMitra, PRsonality, NexMeet, Wanderly, and JARVIS.
- Project filtering and accessible detail dialogs, including previous/next navigation, focus restoration, backdrop dismissal, and Escape support.
- About, education, coursework, CGPA, and Oracle certifications based on the supplied resume.
- Keyboard-accessible technical-skill tabs and expandable engineering principles.
- Working GitHub, LinkedIn, LeetCode, live-project, and source-code links from the resume.
- Original resume download, mailto contact links, and email copying with confirmation.
- Self-hosted fonts and local WebP artwork. No analytics, tracking, or external font/CDN requests.
- Reduced-motion support, focus indicators, a skip link, semantic landmarks, and contrast adjustments.

## Edit your content

| File | What to edit |
| --- | --- |
| `src/projects.js` | Contact/social links, project descriptions, dates, technologies, live demos, and repositories |
| `src/App.jsx` | Hero copy, about section, education, and contact wording |
| `src/toolkit.js` | Skills, technology names, and actual brand-logo mappings |
| `src/styles.css` | Base typography, layouts, and breakpoints |
| `src/enhancements.css` | Light/dark palettes, eclipse switch, cursor appearance, and refined motion |
| `src/SignatureCursor.jsx` | Larger ball, 6px-offset hover outlines, dotted circles, stronger glow, and dialog-safe layering |
| `src/ArtifactScene.jsx` | React 3D controls, viewport lifecycle, and the linked skills inspector |
| `src/artifact-engine.js` | Both custom Three.js artifacts, materials, lighting, raycasting, and manipulation |
| `src/immersive.css` | Responsive 3D stages, inspector, controls, and focus states |
| `src/ThemeToggle.jsx` | Theme state, system preferences, persistence, and animated eclipse toggle |
| `src/MotionDesign.jsx` | Masked heading lines, magnetic controls, scroll parallax, and sliding filter plate |
| `public/Rishabh-Kumar-Resume.pdf` | Replace this to update the downloadable resume |
| `public/images/` | Hero and project imagery |
| `index.html` | Page title, SEO description, theme color, and social metadata |

## About the project imagery

The project cards are **custom interface illustrations**, not screenshots or performance claims. They are explicitly identified as illustrations on the site. The resume score, placeholder document, video-call participants, cabin, and example assistant command are illustrative UI content.

The chrome hero sculpture, cabin image, and fictional video-call portraits are AI-generated visual assets. No supplied portrait of Rishabh was available, so none was invented or used to represent him.

Editable artwork compositions are in `src/ProjectArt.jsx` and `src/artwork.css`. To regenerate the five card images with the dev server running:

```bash
npx playwright install --with-deps chromium
npm run artwork
```

This produces PNG renders in `artwork-renders/`. Export those to WebP using the same names as the files in `public/images/`. You do not need to run this to use or deploy the website; finished WebP assets are included.

## Testing

With the development server running on port 5173:

```bash
npx playwright install --with-deps chromium
node scripts/check-site.mjs
node scripts/check-accessibility.mjs
node scripts/check-enhancements.mjs
node scripts/check-refinements.mjs
node scripts/check-immersive.mjs
node scripts/check-intro.mjs
node scripts/check-intro-pacing.mjs
node scripts/check-location.mjs
node scripts/check-solar-system.mjs
# After building/exporting the HTML:
node scripts/check-location-offline.mjs
```

The interaction suite checks project filters, modal navigation and dismissal, toolkit keyboard controls, accordions, clipboard behavior, resume downloading, mobile navigation, image loading, and horizontal overflow at ten viewport widths. The accessibility script audits desktop, project dialog, mobile, and mobile-menu states with axe-core. Test results are stored in `qa/`.

## Notes

- The contact section intentionally uses email, not an unconnected form that pretends to submit messages.
- JARVIS is a local desktop application, so its action opens the repository rather than an invented live demo.
- Some externally hosted project demos may need a moment to wake up. Their availability is controlled by their respective hosts.
- All fonts are distributed under the SIL Open Font License; notices are in `public/fonts/`.

## Motion & night mode update

### EMBRACE — one ball, with breathing room

The default cursor is one clearly visible, shaded 14px ball. Hovering a control transforms it into that element’s silhouette. There is **no second native cursor or following dot**.

- Buttons, links, project images, and skill cards get a rectangular/rounded outline with a consistent 6px gap outside the live element. The shape still follows the actual dimensions and corner radii, but never sits directly on its border.
- True circular controls get a concentric dotted circle, also 6px outside their edge. Pill-shaped switches retain their actual capsule silhouette.
- The contour continues to track magnetic movement, scrolling, layout changes, and resizing.
- A stronger sage/champagne/peach bloom rolls outward on hover, with a brighter core and a broader 950ms fade. It does not fill the screen or keep flashing.
- The top-layer popover keeps the pointer above native project dialogs and their backdrops. Older browsers have a dialog-local fallback.
- Keyboard navigation, touch, browser blur, and leaving the page hide the pointer. Reduced motion disables blooms and makes geometry changes immediate.
- Free 3D viewports keep the ball free to move, instead of locking it to the entire canvas.

### A considered dark theme

The eclipse switch in the header changes from a rotating sun to a crescent moon. All sections, navigation, tags, dialogs, and contact controls have matching light/dark colors. The final contact panel uses low-luminance sage (#293525), soft cream type, and small desaturated accents in dark mode—not a large neon-green block. The hero has a separate nighttime image; project images keep their intentional original art direction.

The first visit follows the system color preference. Explicit choices are saved under `rishabh-theme` in localStorage and restored before first paint to prevent a light flash. Sandboxed previews that disallow storage keep the choice in memory for the current visit. System changes are followed until the visitor makes an explicit choice.

### More deliberate motion

Line-by-line masked heading reveals, image unmasking, staggered project captions, an animated filter ink plate, magnetic buttons, a gentle hero parallax, scroll-linked education orbits, staggered toolkit cards, and animated dialog entrances/exits. Motion preferences are respected throughout; scrolling remains native, not hijacked.

`check-enhancements.mjs` tests both themes, persistence, system preference, touch interaction, cursor exclusivity (including dialog backdrops), cursor positioning and quiet hover feedback, responsive resizing at ten widths, modal exit behavior, and dark-mode accessibility states.

## Actual skill logos

Every tool/language card uses real, locally hosted brand artwork. Paired cards show both logos (JavaScript/TypeScript, HTML5/CSS3, Socket.io/WebRTC, and Copilot/Claude Code). The original brand colors are preserved on neutral ivory backplates.

Assets come from project-owned repositories, Devicon, Simple Icons, and Lobe Icons. Individual sources are recorded in `public/logos/sources.json`; notices are in `public/logos/NOTICE.txt`. There are no logo-CDN requests at runtime. `scripts/prepare-logos.mjs` can regenerate the assets.

SQL, REST, and NLP are unbranded concepts rather than products with a single official logo. Their cards now explicitly identify the relevant implementation already present in the resume—MySQL, Flask, and Python—rather than inventing an “official” logo. Porcupine uses the Picovoice SDK app mark from its own repository.

## NexMeet artwork refresh

Only NexMeet’s preview was replaced. It now includes four higher-quality fictional participant portraits, preserved photo proportions, active-speaker feedback, a room-chat sidebar, and fully visible conferencing controls. The other four approved preview images are byte-for-byte unchanged.

To render just NexMeet (without touching the other images):

```bash
npm run artwork -- nexmeet
```

The final WebP is already included. `scripts/check-refinements.mjs` checks brand-logo loading in all five skill categories and both themes, contrast, the muted contact surface, the minimal cursor, NexMeet layout bounds, and the integrity of the other project images.

## Interactive 3D edition

These are actual **Three.js/WebGL2 scenes**, not videos or pointer-tilted screenshots. Both artifacts are constructed from geometry in `src/artifact-engine.js`; they need no remote GLB files or HDR downloads.

### ORBIT / 01 — hero

A custom six-arm chrome rotor, brushed collars, a brass-edged drive, nested orbital rails, and a ceramic sage satellite. Drag to turn it in three dimensions; click the object or the circular seal to unfold its arms. The controls also let you spin, assemble, reset, and pause the idle movement.

### STACK / 02 — skills

Six physical technology cartridges surround a layered hexagonal core. Each cartridge carries the actual brand artwork, with a beveled ceramic body, metal connectors, indicator, fasteners, and a ribbed back. The real logos are drawn into local canvas textures, not approximated with generic icons.

- Drag the assembly to inspect it; click a 3D cartridge to select it.
- Hover or click a skill card to bring its cartridge forward—even if it was already selected before you spun the sculpture.
- Category tabs replace all six branded cartridges without rebuilding the renderer.
- Unfold separates the layers and spreads the cartridges; reset assembles the view again.
- The inspector and accessible HTML skill cards retain the complete content alongside the 3D scene.

### Input, accessibility & performance

Focus either viewport and use arrow keys to rotate, Enter/Space to unfold, and Home/R to reset. All primary actions also have labeled HTML buttons. Touch supports manipulation while leaving vertical page scrolling available.

Scenes initialize near the viewport, stop rendering when off-screen or the browser tab is hidden, cap rendering at about 30fps while resting, and use full refresh while manipulating. Pixel density is capped on high-DPI devices. Pause stops ambient motion; reduced-motion preferences remove ambient motion and inertia. If WebGL is unavailable, the hero keeps its original illustration and every skill remains available through the regular interface.

`check-immersive.mjs` tests genuine WebGL contexts, dragging, keyboard controls, unfolding, pause/spin, raycast selection, DOM/3D synchronization, all logo groups, both themes, touch, native-pointer suppression, consistently spaced rectangular/circular cursor geometry, glow, dialog layering, responsive widths, and accessibility. It also verifies that all five approved project images are unchanged.

The standalone export embeds Three.js and all imagery/fonts/logos. A deliberately single JS bundle keeps it functional both offline and inside the script-only file viewer; Vite’s advisory large-chunk warning is expected for this fully self-contained 3D edition.


## Restored Command Prompt introduction

The 3D person/desk/VS Code opening has been removed from the active application. The earlier **Windows desktop → Start search → Command Prompt** intro is restored, with the approved Quiet Technology wallpaper and the relaxed approximately 23-second pacing.

It still types `command prompt`, opens the terminal, then runs the visual sequence:

```text
Rishabh> cd "Rishabh's Portfolio"
Rishabh's Portfolio> npm run dev
```

The familiar Vite output and simulated Control-click open the same portfolio in place. No local command is executed and no visitor is sent to their own localhost. Skip intro, Escape, reduced-motion direct entry, and `?intro=skip` are retained.

## From orbit to campus — education-card journey

Scroll to the **About / education** card. A floating invitation appears when the card enters the viewport. Its complete surface is an accessible button: click anywhere in the card (or press Enter/Space) to open the journey.

### Experience

- The college details are initially concealed by a frosted overlay (including their accessible text). A larger floating invitation opens a native top-layer glass-style dialog over the existing page. Cancelling keeps the card concealed; completing the journey reveals the college and CGPA.
- A **real Three.js/WebGL2 full solar-system scene** is drawn inside it: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune all rotate on their axes and revolve around the Sun. Saturn has textured rings, Uranus has a subtle ring system, and Earth retains moving clouds, night lights, ocean reflections and an atmospheric rim. Moving labels identify each world. This is not a flat planet image or video.
- The coordinates initially show dashes. **Scroll to find me** appears when the scene is ready.
- Only the dialog’s own scroll container moves. Wheel, touch, Page Down/arrow keys, or the chapter buttons drive the camera. Scrolling backward reverses the route.
- The camera approaches Earth, then **India → Tamil Nadu → Vellore → VIT**. Higher-detail, geographically registered image patches sit on the same spherical coordinate system; they are not unrelated images sliding across the screen.
- The latitude/longitude readout is computed from the centre-view ray’s intersection with the globe, transformed back into geographic coordinates. These are **virtual view coordinates**, not the visitor’s GPS position. No geolocation permission or location-tracking API is used.
- At the campus, the user-supplied main-gate photograph appears. After approximately 3.6 seconds at the end, the dialog closes and the page returns to **“Vellore Institute of Technology, Vellore.”** The name receives a gentle highlight.
- **Keep this view** suspends the automatic return. Close, Escape, restart, pause orbital motion, and chapter jumps are also available.

### Quality, safety & performance

The globe uses a 4K day texture, 2K clouds/night/normal textures, and a separate specular map. The regional crops reach 2048px, with a finer campus crop. Curved geographic patch meshes and logarithmic depth preserve alignment during the close approach. Satellite view rendering stops when stationary; off-screen/hidden animations and disposed dialogs do not retain a running renderer.

Planet sizes, orbital spacing and time scales are illustrative, not an ephemeris or an astronomically scaled simulation. Regional imagery is a historical mosaic, not a live satellite feed. On devices without WebGL, the clearly labeled fallback keeps the image-based route and all navigation controls usable. Reduced motion removes idle orbital animation and makes the camera follow scrolling directly.

### Geographic endpoint & sources

The public main-gate endpoint is approximate: **12.9682° N, 79.1559° E**, based on the main-gate listing. [1](https://yappe.in/tamil-nadu/vellore/vit-main-gate/646625)

- **Planet textures and the India crop:** Solar System Scope’s NASA-derived texture pack, CC BY 4.0; locally resized/compressed. The collection’s license is documented here. [5](https://commons.wikimedia.org/wiki/Category:Solar_System_Scope) Primary source: https://www.solarsystemscope.com/textures/
- **Tamil Nadu, Vellore and campus imagery:** Sentinel-2 cloudless 2016 by EOX IT Services GmbH, containing modified Copernicus Sentinel data 2016 & 2017, CC BY 4.0. The provider’s capabilities document identifies the license of the `s2cloudless` layer. [1](https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml) The provider permits downloading rendered image mosaics under the applicable license. [3](https://s2maps.eox.at/)
- **Geographic outlines:** Natural Earth public-domain data, generalized for this guided illustration; not a statement about disputed boundaries. https://www.naturalearthdata.com/about/terms-of-use/
- **Campus gate:** the user’s `image-1.png`, converted to WebP without content edits or invented architecture.

Attribution is displayed next to the imagery. Individual URLs, bounds and transformations are preserved in `public/images/location/sources.json` and `LICENSE.txt`.

### Files & reproduction

- `src/LocationJourney.jsx` — independent scrolling, dialog/focus management, HUD, gate-photo arrival and return.
- `src/location-engine.js` — full-system camera framing, georeferenced surface patches, real camera movement, and centre-view coordinates.
- `src/solar-overview.js` — the eight planets, individual spin/orbit rates, textured bodies and planetary rings.
- `src/location-data.js` — destination, route, stops, image bounds and formatters.
- `src/location-boundaries.js` — locally bundled Natural Earth outlines.
- `src/location-journey.css` — scoped card invitation, glass dialog, HUD and responsive layouts.
- `scripts/prepare-location-assets.py` — downloads the attributed source assets and prepares the local textures (Python/Pillow).
- `scripts/prepare-location-boundaries.mjs` — regenerates the local boundary data.
- `scripts/check-location.mjs` — WebGL/motion, contained wheel/touch scrolling, coordinates, all stops, photo/auto-return, keyboard/focus, cursor layering, responsive layouts, accessibility and preserved-file hashes.
- `scripts/check-location-offline.mjs` — standalone/opaque-iframe checks after export.

All imagery is local and is embedded in the standalone HTML. There are no map API keys or live map-tile requests. The original hero and toolkit 3D scenes, custom cursor, theme styles and all five approved project previews remain unchanged; `qa/pre-location-preserved.json` records their hashes.

### Full-system and concealed-card refinement

The overview camera keeps all moving planets inside the usable viewing area, including during resize. On tall phones the orbital plane is presented vertically. Planet images are bundled locally under the existing Solar System Scope CC BY 4.0 attribution. The VIT card hides its contents before the trip with a strong blur and frosted cover; the enlarged invitation remains the single whole-card keyboard/touch target. Details reveal only after arriving, and remain visible for the rest of the page visit.

On short phone screens, a compact planet key replaces overlapping individual labels. The animated 3D bodies themselves remain visible.
