import * as THREE from "three";

// All eight planets. Orbital radii, body sizes and speeds are intentionally
// compressed/exaggerated for a legible portfolio illustration, not an ephemeris.
export const SOLAR_PLANETS = [
  {
    id: "mercury",
    name: "Mercury",
    radius: 0.4,
    orbit: 2.9,
    phase: -2.6,
    rate: 0.115,
    spin: 0.105,
    tilt: 0.03,
    inclination: 7,
    image: "/images/location/mercury.webp",
  },
  {
    id: "venus",
    name: "Venus",
    radius: 0.61,
    orbit: 4.1,
    phase: 1.36,
    rate: 0.087,
    spin: -0.073,
    tilt: 2.6,
    inclination: 3.4,
    image: "/images/location/venus.webp",
  },
  {
    id: "earth",
    name: "Earth",
    radius: 0.65,
    orbit: 5.3,
    phase: 0.06,
    rate: 0.07,
    spin: 0.145,
    tilt: 23.4,
    inclination: 0,
  },
  {
    id: "mars",
    name: "Mars",
    radius: 0.46,
    orbit: 6.8,
    phase: -1.02,
    rate: 0.056,
    spin: 0.14,
    tilt: 25.2,
    inclination: 1.85,
    image: "/images/location/mars.webp",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    radius: 1.25,
    orbit: 9.2,
    phase: 2.65,
    rate: 0.038,
    spin: 0.28,
    tilt: 3.1,
    inclination: 1.3,
    image: "/images/location/jupiter.webp",
  },
  {
    id: "saturn",
    name: "Saturn",
    radius: 1.08,
    orbit: 12.1,
    phase: -2.55,
    rate: 0.028,
    spin: 0.25,
    tilt: 26.7,
    inclination: 2.5,
    image: "/images/location/saturn.webp",
  },
  {
    id: "uranus",
    name: "Uranus",
    radius: 0.91,
    orbit: 14.6,
    phase: 0.6,
    rate: 0.021,
    spin: -0.19,
    tilt: 97.8,
    inclination: 0.77,
    image: "/images/location/uranus.webp",
  },
  {
    id: "neptune",
    name: "Neptune",
    radius: 0.86,
    orbit: 17.2,
    phase: -0.48,
    rate: 0.016,
    spin: 0.18,
    tilt: 28.3,
    inclination: 1.77,
    image: "/images/location/neptune.webp",
  },
];
const X = new THREE.Vector3(1, 0, 0),
  RAD = Math.PI / 180;
export function orbitalPosition(spec, time, lock = 1) {
  const angle = spec.phase + time * spec.rate * lock;
  return new THREE.Vector3(
    Math.cos(angle) * spec.orbit,
    0,
    Math.sin(angle) * spec.orbit,
  ).applyAxisAngle(X, spec.inclination * RAD);
}
const fragment = `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D photo;uniform vec3 sunPosition;uniform float fade;
varying vec2 vUV;varying vec3 vWorld;varying vec3 vNormalW;
void main(){vec3 n=normalize(vNormalW);float illumination=max(dot(n,normalize(sunPosition-vWorld)),0.0);vec3 color=texture2D(photo,vUV).rgb*(.20+1.16*illumination);gl_FragColor=vec4(color,fade);
#include <logdepthbuf_fragment>
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export function createSolarOverview({
  scene,
  earth,
  sunPosition,
  texture,
  ownGeometry,
  ownMaterial,
  vertex,
}) {
  const sphere = ownGeometry(new THREE.SphereGeometry(1, 64, 48));
  const path = ownGeometry(
    new THREE.BufferGeometry().setFromPoints(
      Array.from(
        { length: 361 },
        (_, i) =>
          new THREE.Vector3(
            Math.cos((i / 360) * Math.PI * 2),
            0,
            Math.sin((i / 360) * Math.PI * 2),
          ),
      ),
    ),
  );
  const ringTexture = texture("/images/location/saturn-rings.webp");
  const bodies = SOLAR_PLANETS.map((spec) => {
    const root = spec.id === "earth" ? earth : new THREE.Group();
    root.name = spec.name;
    let mesh = null,
      material = null,
      rings = null,
      ringMaterial = null;
    if (spec.id !== "earth") {
      scene.add(root);
      root.rotation.z = spec.tilt * RAD;
      material = ownMaterial(
        new THREE.ShaderMaterial({
          vertexShader: vertex,
          fragmentShader: fragment,
          uniforms: {
            photo: { value: texture(spec.image) },
            sunPosition: { value: sunPosition },
            fade: { value: 1 },
          },
          transparent: true,
        }),
      );
      mesh = new THREE.Mesh(sphere, material);
      root.add(mesh);
      if (spec.id === "saturn") {
        const geometry = ownGeometry(
          new THREE.RingGeometry(1.28, 2.28, 128, 1),
        );
        const pos = geometry.attributes.position,
          uv = geometry.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const r = Math.hypot(pos.getX(i), pos.getY(i));
          uv.setXY(i, (r - 1.28) / (2.28 - 1.28), 0.5);
        }
        ringMaterial = ownMaterial(
          new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
            color: "#e5d7b2",
            toneMapped: false,
          }),
        );
        rings = new THREE.Mesh(geometry, ringMaterial);
        rings.rotation.x = -Math.PI / 2;
        root.add(rings);
      }
      if (spec.id === "uranus") {
        const geometry = ownGeometry(new THREE.RingGeometry(1.15, 1.19, 96));
        ringMaterial = ownMaterial(
          new THREE.MeshBasicMaterial({
            color: "#a3c1b6",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.32,
            depthWrite: false,
          }),
        );
        rings = new THREE.Mesh(geometry, ringMaterial);
        rings.rotation.x = -Math.PI / 2;
        root.add(rings);
      }
    }
    const orbitMaterial = ownMaterial(
      new THREE.LineBasicMaterial({
        color: spec.id === "earth" ? "#b7d49b" : "#8b9784",
        transparent: true,
        opacity: spec.id === "earth" ? 0.36 : 0.21,
        depthWrite: false,
      }),
    );
    const orbit = new THREE.Line(path, orbitMaterial);
    orbit.scale.setScalar(spec.orbit);
    orbit.rotation.x = spec.inclination * RAD;
    scene.add(orbit);
    return {
      ...spec,
      root,
      mesh,
      material,
      rings,
      ringMaterial,
      orbitLine: orbit,
      orbitMaterial,
    };
  });
  return {
    bodies,
    update(time, fade, lock, shift, bodyBoost = 1) {
      for (const body of bodies) {
        body.orbitLine.position.copy(shift);
        body.orbitLine.visible = fade > 0.001;
        body.orbitMaterial.opacity = (body.id === "earth" ? 0.34 : 0.19) * fade;
        if (body.id === "earth") continue;
        body.root.position.copy(orbitalPosition(body, time, lock)).add(shift);
        body.root.visible = fade > 0.001;
        body.root.scale.setScalar(bodyBoost);
        body.mesh.scale.setScalar(body.radius);
        body.mesh.rotation.y = time * body.spin;
        body.material.uniforms.fade.value = fade;
        if (body.ringMaterial)
          body.ringMaterial.opacity =
            (body.id === "saturn" ? 0.88 : 0.32) * fade;
      }
    },
  };
}
