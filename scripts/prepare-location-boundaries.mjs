// Natural Earth public-domain data. This illustration is not a territorial-boundary statement.
import { writeFile } from "node:fs/promises";
const countrySource =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson";
const stateSource =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
const [countries, states] = await Promise.all(
  [countrySource, stateSource].map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
  }),
);
const india = countries.features.find(
  (f) => f.properties.ADM0_A3 === "IND",
).geometry;
const tamilNadu = states.features.find(
  (f) => f.properties.name === "Tamil Nadu",
).geometry;
function outline(g) {
  const rings =
    g.type === "MultiPolygon"
      ? g.coordinates.map((p) => p[0])
      : [g.coordinates[0]];
  return rings
    .map((r) => {
      const points = [r[0]];
      for (const p of r.slice(1))
        if (
          Math.hypot(p[0] - points.at(-1)[0], p[1] - points.at(-1)[1]) > 0.018
        )
          points.push(p);
      points.push(points[0]);
      return points.map((p) => p.slice(0, 2).map((v) => +v.toFixed(5)));
    })
    .filter((r) => r.length > 5);
}
await writeFile(
  "src/location-boundaries.js",
  "// Natural Earth public-domain boundaries, generalized for this guided illustration.\nexport const boundaries = " +
    JSON.stringify({ india: outline(india), tamilNadu: outline(tamilNadu) }) +
    ";\n",
);
await writeFile(
  "public/images/location/boundary-source.txt",
  "Natural Earth public-domain map data. https://www.naturalearthdata.com/about/terms-of-use/\n" +
    countrySource +
    "\n" +
    stateSource +
    "\nGeneralized for visualization; not a statement about disputed boundaries.\n",
);
console.log("Updated geographic boundary outlines.");
