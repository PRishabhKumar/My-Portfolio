// A guided virtual-camera route, not the visitor's GPS position.
// Approximate public main-gate endpoint: [1](https://yappe.in/tamil-nadu/vellore/vit-main-gate/646625).
// It is not a claim of real-time presence or a reading of the visitor's location.
export const DESTINATION = Object.freeze({
  lat: 12.9682299,
  lon: 79.1558678,
  name: "Vellore Institute of Technology, Vellore",
});
export const EARTH_KM = 6371;
export const ARRIVAL_HOLD = 3600;
export const STOPS = [
  {
    id: "space",
    at: 0,
    number: "01",
    label: "Space",
    title: "Eight worlds. One home.",
    subtitle:
      "From Mercury to Neptune, a solar system in motion. Scroll inward to find my corner of Earth.",
  },
  {
    id: "earth",
    at: 0.22,
    number: "02",
    label: "Earth",
    title: "Our pale blue dot.",
    subtitle: "Across oceans and continents, follow the coordinates home.",
  },
  {
    id: "india",
    at: 0.47,
    number: "03",
    label: "India",
    title: "India.",
    subtitle: "A world of possibilities. My story starts here.",
  },
  {
    id: "tamil-nadu",
    at: 0.65,
    number: "04",
    label: "Tamil Nadu",
    title: "Tamil Nadu.",
    subtitle: "Further south. A little closer to the place I learn and build.",
  },
  {
    id: "vellore",
    at: 0.8,
    number: "05",
    label: "Vellore",
    title: "Vellore.",
    subtitle: "A city of history, curiosity, and new beginnings.",
  },
  {
    id: "campus",
    at: 1,
    number: "06",
    label: "VIT",
    title: "You found me.",
    subtitle: "Vellore Institute of Technology, Vellore.",
  },
];
const ROUTE = [
  { p: 0, lat: 4, lon: 28, alt: 60000 },
  { p: 0.2, lat: 12, lon: 62, alt: 27000 },
  { p: 0.34, lat: 24, lon: 76, alt: 11000 },
  { p: 0.48, lat: 20.5937, lon: 78.9629, alt: 4500 },
  { p: 0.66, lat: 11.1271, lon: 78.6569, alt: 800 },
  { p: 0.8, lat: 12.9165, lon: 79.1325, alt: 75 },
  { p: 0.91, lat: DESTINATION.lat, lon: DESTINATION.lon, alt: 7 },
  { p: 1, lat: DESTINATION.lat, lon: DESTINATION.lon, alt: 2.5 },
];
export const REGIONS = [
  {
    id: "india",
    bounds: [55, -4, 105, 42],
    image: "/images/location/india.webp",
    from: 0.32,
    to: 0.45,
    radius: 1.000018,
    segments: 160,
  },
  {
    id: "tamil-nadu",
    bounds: [72, 5, 85, 18],
    image: "/images/location/tamil-nadu.webp",
    from: 0.54,
    to: 0.65,
    radius: 1.000035,
    segments: 120,
  },
  {
    id: "vellore",
    bounds: [78.4, 12.25, 79.9, 13.65],
    image: "/images/location/vellore.webp",
    from: 0.72,
    to: 0.8,
    radius: 1.000047,
    segments: 96,
  },
  {
    id: "campus",
    bounds: [79.113, 12.929, 79.2, 13.013],
    image: "/images/location/campus.webp",
    from: 0.84,
    to: 0.91,
    radius: 1.000057,
    segments: 80,
  },
];
export const clamp = (n) => Math.max(0, Math.min(1, n));
export const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export function routeAt(progress) {
  const p = clamp(progress);
  let i = 1;
  while (i < ROUTE.length - 1 && p > ROUTE[i].p) i++;
  const a = ROUTE[i - 1],
    b = ROUTE[i],
    t = smooth(a.p, b.p, p);
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lon: a.lon + (b.lon - a.lon) * t,
    alt: Math.exp(Math.log(a.alt) + (Math.log(b.alt) - Math.log(a.alt)) * t),
  };
}
export function stopAt(p) {
  if (p < 0.13) return 0;
  if (p < 0.39) return 1;
  if (p < 0.57) return 2;
  if (p < 0.74) return 3;
  if (p < 0.89) return 4;
  return 5;
}
export function coordinate(value, axis) {
  if (value == null) return "—";
  return `${Math.abs(value).toFixed(4)}° ${axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W"}`;
}
let warmed = false;
export function warmLocationAssets() {
  if (warmed) return;
  warmed = true;
  for (const url of [
    "/images/location/earth-day.webp",
    "/images/location/sun.webp",
    "/images/location/vit-main-gate.webp",
  ]) {
    const image = new Image();
    image.src = url;
  }
}
