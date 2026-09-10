import * as THREE from "three";
import {
  REGIONS,
  DESTINATION,
  EARTH_KM,
  routeAt,
  smooth,
  clamp,
} from "./location-data";
import { boundaries } from "./location-boundaries";
import {
  SOLAR_PLANETS,
  orbitalPosition,
  createSolarOverview,
} from "./solar-overview";

const RAD = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0),
  Z = new THREE.Vector3(0, 0, 1);
const geo = (lat, lon, r = 1) =>
  new THREE.Vector3(
    Math.cos(lat * RAD) * Math.cos(lon * RAD) * r,
    Math.sin(lat * RAD) * r,
    -Math.cos(lat * RAD) * Math.sin(lon * RAD) * r,
  );
const vertex = `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUV; varying vec3 vWorld; varying vec3 vNormalW;
void main(){vUV=uv;vec4 world=modelMatrix*vec4(position,1.0);vWorld=world.xyz;vNormalW=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;
#include <logdepthbuf_vertex>
}`;
const earthFragment = `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D dayMap;uniform sampler2D nightMap;uniform sampler2D normalMap;uniform sampler2D specularMap;
uniform vec3 sunDirection;varying vec2 vUV;varying vec3 vWorld;varying vec3 vNormalW;
void main(){
 vec3 n=normalize(vNormalW);vec3 viewDir=normalize(cameraPosition-vWorld);
 vec3 q0=dFdx(vWorld),q1=dFdy(vWorld);vec2 st0=dFdx(vUV),st1=dFdy(vUV);
 vec3 tangent=normalize(q0*st1.y-q1*st0.y);vec3 bitangent=normalize(-q0*st1.x+q1*st0.x);
 vec3 bump=texture2D(normalMap,vUV).xyz*2.0-1.0;bump.xy*=.26;n=normalize(mat3(tangent,bitangent,n)*bump);
 float light=dot(n,sunDirection);float day=smoothstep(-.12,.18,light);
 vec3 daylight=texture2D(dayMap,vUV).rgb*(.14+1.12*max(light,0.0));
 vec3 nights=texture2D(nightMap,vUV).rgb*1.15;
 float ocean=texture2D(specularMap,vUV).r;float shine=pow(max(dot(n,normalize(sunDirection+viewDir)),0.0),42.0)*ocean*.34;
 vec3 color=mix(nights+texture2D(dayMap,vUV).rgb*.019,daylight,day)+shine*day*vec3(1.0,.94,.78);
 float rim=pow(1.0-max(dot(n,viewDir),0.0),3.0);color+=vec3(.07,.25,.40)*rim*day*.22;
 gl_FragColor=vec4(color,1.0);
 #include <logdepthbuf_fragment>
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
const atmosphereFragment = `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 sunDirection;uniform float fade;varying vec3 vWorld;varying vec3 vNormalW;
void main(){vec3 n=normalize(vNormalW);vec3 v=normalize(cameraPosition-vWorld);float edge=pow(1.0-abs(dot(n,v)),3.4);float sun=.25+.75*max(dot(n,sunDirection),0.0);gl_FragColor=vec4(vec3(.14,.43,.70)*sun,edge*.52*fade);
#include <logdepthbuf_fragment>
#include <colorspace_fragment>
}`;
const patchFragment = `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D photo;uniform float fade;varying vec2 vUV;
void main(){float mask=smoothstep(0.0,.027,vUV.x)*smoothstep(0.0,.027,vUV.y)*smoothstep(0.0,.027,1.0-vUV.x)*smoothstep(0.0,.027,1.0-vUV.y);gl_FragColor=vec4(texture2D(photo,vUV).rgb,fade*mask);
#include <logdepthbuf_fragment>
#include <colorspace_fragment>
}`;
const sunFragment = `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D surface;uniform float time;uniform float fade;varying vec2 vUV;varying vec3 vWorld;varying vec3 vNormalW;
void main(){vec2 uv=vUV;uv.x=fract(uv.x+time*.002);uv.y+=sin(uv.x*28.0+time*.16)*.0015;vec3 color=texture2D(surface,uv).rgb;float pulse=.98+.035*sin(time*.65+vUV.y*26.0);float mu=max(dot(normalize(vNormalW),normalize(cameraPosition-vWorld)),0.0);color*=1.48*pulse*(.42+.58*pow(mu,.4));float edge=pow(1.0-abs(dot(normalize(vNormalW),normalize(cameraPosition-vWorld))),2.0);color+=vec3(.40,.09,.005)*edge;gl_FragColor=vec4(color,fade);
#include <logdepthbuf_fragment>
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

function globePatch(bounds, radius, segments) {
  const [west, south, east, north] = bounds,
    positions = [],
    uvs = [],
    indices = [];
  const ny = Math.max(
    32,
    Math.round((segments * (north - south)) / (east - west)),
  );
  for (let j = 0; j <= ny; j++)
    for (let i = 0; i <= segments; i++) {
      const p = geo(
        north - ((north - south) * j) / ny,
        west + ((east - west) * i) / segments,
        radius,
      );
      positions.push(p.x, p.y, p.z);
      uvs.push(i / segments, 1 - j / ny);
    }
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < segments; i++) {
      const a = j * (segments + 1) + i,
        b = a + 1,
        c = a + segments + 1,
        d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createLocationScene(viewport, { onReady, onError } = {}) {
  let disposed = false,
    ready = false,
    last = -1000,
    lastProgress = -1,
    loadCount = 0;
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.setClearColor(0x050b0b, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  viewport.appendChild(renderer.domElement);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(44, 1, 0.000001, 160);
  const ownGeometry = (g) => {
      geometries.add(g);
      return g;
    },
    ownMaterial = (m) => {
      materials.add(m);
      return m;
    };
  const loader = new THREE.TextureLoader();
  function texture(url, color = true) {
    const t = loader.load(
      url,
      () => {
        if (disposed) return;
        loadCount++;
        if (loadCount === 18) {
          ready = true;
          viewport.dataset.ready = "true";
          onReady?.();
        }
      },
      undefined,
      () => {
        if (!disposed) onError?.();
      },
    );
    t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.add(t);
    return t;
  }
  const maps = {
    day: texture("/images/location/earth-day.webp"),
    night: texture("/images/location/earth-night.webp"),
    clouds: texture("/images/location/earth-clouds.webp"),
    normal: texture("/images/location/earth-normal.webp", false),
    specular: texture("/images/location/earth-specular.webp", false),
    sun: texture("/images/location/sun.webp"),
  };
  const earth = new THREE.Group();
  earth.name = "Earth";
  scene.add(earth);
  const lightDirection = new THREE.Vector3(-1, 0, 0);
  const earthMaterial = ownMaterial(
    new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: earthFragment,
      uniforms: {
        dayMap: { value: maps.day },
        nightMap: { value: maps.night },
        normalMap: { value: maps.normal },
        specularMap: { value: maps.specular },
        sunDirection: { value: lightDirection },
      },
    }),
  );
  const earthMesh = new THREE.Mesh(
    ownGeometry(new THREE.SphereGeometry(1, 256, 128)),
    earthMaterial,
  );
  earth.add(earthMesh);
  const cloudMaterial = ownMaterial(
    new THREE.MeshPhongMaterial({
      map: maps.clouds,
      transparent: true,
      opacity: 0.74,
      depthWrite: false,
      shininess: 3,
      side: THREE.FrontSide,
    }),
  );
  const clouds = new THREE.Mesh(
    ownGeometry(new THREE.SphereGeometry(1.006, 128, 96)),
    cloudMaterial,
  );
  clouds.renderOrder = 30;
  earth.add(clouds);
  const atmoMaterial = ownMaterial(
    new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: atmosphereFragment,
      uniforms: { sunDirection: { value: lightDirection }, fade: { value: 1 } },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const atmosphere = new THREE.Mesh(
    ownGeometry(new THREE.SphereGeometry(1.045, 128, 96)),
    atmoMaterial,
  );
  atmosphere.renderOrder = 31;
  earth.add(atmosphere);
  const sunMaterial = ownMaterial(
    new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: sunFragment,
      uniforms: {
        surface: { value: maps.sun },
        time: { value: 0 },
        fade: { value: 1 },
      },
      transparent: true,
    }),
  );
  const sun = new THREE.Mesh(
    ownGeometry(new THREE.SphereGeometry(1, 96, 64)),
    sunMaterial,
  );
  sun.name = "Sun";
  scene.add(sun);
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const cx = glowCanvas.getContext("2d");
  const grad = cx.createRadialGradient(128, 128, 12, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,231,155,.60)");
  grad.addColorStop(0.26, "rgba(255,174,65,.31)");
  grad.addColorStop(0.5, "rgba(214,87,26,.12)");
  grad.addColorStop(1, "rgba(190,64,17,0)");
  cx.fillStyle = grad;
  cx.fillRect(0, 0, 256, 256);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(glowTexture);
  const glowMaterial = ownMaterial(
    new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.87,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  const glow = new THREE.Sprite(glowMaterial);
  scene.add(glow);
  const light = new THREE.DirectionalLight(0xfff0d6, 2.8);
  light.target = earth;
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x6d8799, 0.13));

  // A real star field and a visible orbital plane; sizes/distances are illustrative.
  const starPositions = [],
    starColors = [];
  let seed = 817;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 1800; i++) {
    const a = random() * Math.PI * 2,
      z = random() * 2 - 1,
      r = 38 + random() * 38,
      s = Math.sqrt(1 - z * z);
    starPositions.push(r * s * Math.cos(a), r * z, r * s * Math.sin(a));
    const c = 0.45 + random() * 0.55;
    starColors.push(c, c * 0.99, c * 0.92);
  }
  const starsGeometry = ownGeometry(new THREE.BufferGeometry());
  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3),
  );
  starsGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(starColors, 3),
  );
  const starsMaterial = ownMaterial(
    new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  );
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
  const solar = createSolarOverview({
    scene,
    earth,
    sunPosition: sun.position,
    texture,
    ownGeometry,
    ownMaterial,
    vertex,
  });
  const earthSpec = SOLAR_PLANETS.find((planet) => planet.id === "earth");
  const solarShift = new THREE.Vector3();
  const lockedShift = new THREE.Vector3(1.4, 0, 0).sub(
    orbitalPosition(earthSpec, 0, 0),
  );
  const overviewUp = new THREE.Vector3();

  const patches = REGIONS.map((region, index) => {
    const t = texture(region.image);
    const material = ownMaterial(
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: patchFragment,
        uniforms: { photo: { value: t }, fade: { value: 0 } },
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    const mesh = new THREE.Mesh(
      ownGeometry(globePatch(region.bounds, region.radius, region.segments)),
      material,
    );
    mesh.renderOrder = 10 + index;
    mesh.visible = false;
    earth.add(mesh);
    return { mesh, material, ...region };
  });
  const countryMaterial = ownMaterial(
    new THREE.LineBasicMaterial({
      color: "#d5d6a4",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  const stateMaterial = ownMaterial(
    new THREE.LineBasicMaterial({
      color: "#d3eda7",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  for (const [rings, material] of [
    [boundaries.india, countryMaterial],
    [boundaries.tamilNadu, stateMaterial],
  ])
    for (const ring of rings) {
      const line = new THREE.Line(
        ownGeometry(
          new THREE.BufferGeometry().setFromPoints(
            ring.map(([lon, lat]) => geo(lat, lon, 1.000079)),
          ),
        ),
        material,
      );
      line.renderOrder = 25;
      earth.add(line);
    }
  const tilt = new THREE.Quaternion().setFromAxisAngle(Z, 23.4 * RAD),
    rotation = new THREE.Quaternion(),
    inverse = new THREE.Quaternion();
  const target = new THREE.Vector3(),
    normal = new THREE.Vector3(),
    north = new THREE.Vector3(),
    spaceCamera = new THREE.Vector3(),
    navCamera = new THREE.Vector3(),
    navTarget = new THREE.Vector3();
  const raycaster = new THREE.Raycaster(),
    sphere = new THREE.Sphere(new THREE.Vector3(), 1.00006),
    intersection = new THREE.Vector3();
  let width = 1,
    height = 1,
    mobile = false;
  const resize = () => {
    width = Math.max(1, viewport.clientWidth);
    height = Math.max(1, viewport.clientHeight);
    mobile = width / height < 0.88;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    last = -1000;
    lastProgress = -1;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  resize();
  const lost = (event) => {
    event.preventDefault();
    if (!disposed) onError?.();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  let telemetry = { lat: null, lon: null, alt: null, pin: null };
  function render(progress = 0, time = 0, force = false) {
    if (disposed || document.hidden) return telemetry;
    const p = clamp(progress);
    if (
      !force &&
      Math.abs(p - lastProgress) < 0.00001 &&
      (p > 0.56 || time - last < 0.032)
    )
      return telemetry;
    last = time;
    lastProgress = p;
    const solarFade = 1 - smooth(0.07, 0.23, p),
      orbitLock = 1 - smooth(0, 0.22, p),
      orbitAngle = earthSpec.phase + time * earthSpec.rate * orbitLock;
    const compact = mobile && height < 700;
    const bodyBoost = mobile ? (compact ? 1.28 : 1.16) : 1;
    const earthScale = THREE.MathUtils.lerp(
      earthSpec.radius * bodyBoost,
      1,
      smooth(0.035, 0.2, p),
    );
    solarShift.copy(lockedShift).multiplyScalar(smooth(0, 0.23, p));
    sun.position.copy(solarShift);
    sun.scale.setScalar(1.75);
    sun.visible = solarFade > 0.001;
    sun.rotation.y = time * 0.028;
    sunMaterial.uniforms.time.value = time;
    sunMaterial.uniforms.fade.value = solarFade;
    glow.position.copy(sun.position);
    glow.scale.setScalar(9.4 * (1 + Math.sin(time * 0.48) * 0.016));
    glowMaterial.opacity = solarFade * 0.72;
    glow.visible = sun.visible;
    solar.update(time, solarFade, orbitLock, solarShift, bodyBoost);
    earth.position
      .copy(orbitalPosition(earthSpec, time, orbitLock))
      .add(solarShift);
    earth.scale.setScalar(earthScale);
    const spin =
      Math.PI / 2 + time * earthSpec.spin * (1 - smooth(0.03, 0.26, p));
    rotation.setFromAxisAngle(UP, spin);
    earth.quaternion.copy(tilt).multiply(rotation);
    light.position.copy(sun.position);
    lightDirection.subVectors(sun.position, earth.position).normalize();
    clouds.rotation.y = time * 0.004;
    cloudMaterial.opacity = 0.75 * (1 - smooth(0.25, 0.55, p));
    clouds.visible = p < 0.55;
    atmoMaterial.uniforms.fade.value = 1 - smooth(0.25, 0.55, p);
    atmosphere.visible = p < 0.55;
    earthMesh.visible = p < 0.64;
    starsMaterial.opacity = 0.85 * (1 - smooth(0.35, 0.53, p));
    stars.visible = p < 0.53;
    for (const layer of patches) {
      const fade = smooth(layer.from, layer.to, p);
      layer.material.uniforms.fade.value = fade;
      layer.mesh.visible = fade > 0.0001;
    }
    countryMaterial.opacity =
      0.75 * smooth(0.29, 0.41, p) * (1 - smooth(0.62, 0.73, p));
    stateMaterial.opacity =
      0.9 * smooth(0.54, 0.63, p) * (1 - smooth(0.78, 0.85, p));
    countryMaterial.visible = countryMaterial.opacity > 0.0001;
    stateMaterial.visible = stateMaterial.opacity > 0.0001;
    const point = routeAt(p);
    normal
      .copy(geo(point.lat, point.lon))
      .applyQuaternion(earth.quaternion)
      .normalize();
    north
      .set(
        -Math.sin(point.lat * RAD) * Math.cos(point.lon * RAD),
        Math.cos(point.lat * RAD),
        Math.sin(point.lat * RAD) * Math.sin(point.lon * RAD),
      )
      .applyQuaternion(earth.quaternion)
      .normalize();
    navCamera
      .copy(earth.position)
      .addScaledVector(normal, earthScale * (1 + point.alt / EARTH_KM));
    navTarget
      .copy(earth.position)
      .addScaledVector(normal, smooth(0.25, 0.55, p) * 1.00006 * earthScale);
    // A complete, legible system in the opening view. On tall phones the
    // orbital plane is viewed vertically; scrolling rolls smoothly into Earth.
    const shortLandscape = !mobile && height < 650;
    const safeFraction = Math.max(
      0.34,
      (height - (mobile ? 315 : 285)) / height,
    );
    const verticalExtent =
      mobile && !compact ? 35.5 : shortLandscape ? 12.5 : 22;
    const horizontalExtent = mobile && !compact ? 23 : 37;
    const fitY = verticalExtent / (2 * Math.tan(22 * RAD) * safeFraction);
    const fitX =
      horizontalExtent / (2 * Math.tan(22 * RAD) * camera.aspect * 0.91);
    let overviewDistance = Math.max(fitY, fitX);
    const elevation = compact ? 0.74 : shortLandscape ? 0.33 : 0.62;
    const direction = new THREE.Vector3(
      0,
      elevation,
      Math.sqrt(1 - elevation * elevation),
    );
    overviewUp.set(mobile && !compact ? 1 : 0, mobile && !compact ? 0 : 1, 0);
    const right = new THREE.Vector3()
      .crossVectors(direction.clone().negate(), overviewUp)
      .normalize();
    const screenUp = new THREE.Vector3()
      .crossVectors(right, direction.clone().negate())
      .normalize();
    const safeTop = mobile ? (compact ? 195 : 146) : shortLandscape ? 124 : 193;
    const safeBottom =
      height - (mobile ? (compact ? 238 : 250) : shortLandscape ? 172 : 260);
    const viewCenter = (safeTop + Math.max(safeTop + 95, safeBottom)) / 2;
    const topLimit = Math.max(0.18, (2 * (viewCenter - safeTop)) / height);
    const bottomLimit = Math.max(
      0.16,
      (2 * (safeBottom - viewCenter - 20)) / height,
    );
    // Fit the actual moving bodies (including Saturn's rings) inside the UI-safe
    // area, so an outer planet never disappears behind the telemetry panel.
    for (const body of [
      { id: "sun", root: sun, radius: 1.75 },
      ...solar.bodies,
    ]) {
      const position = body.root.position.clone().sub(solarShift);
      const radius =
        body.id === "earth"
          ? earthScale
          : body.id === "saturn"
            ? 2.28 * bodyBoost
            : body.id === "uranus"
              ? 1.19 * bodyBoost
              : body.radius * (body.id === "sun" ? 1 : bodyBoost);
      const horizontal = position.dot(right),
        vertical = position.dot(screenUp),
        depth = position.dot(direction);
      overviewDistance = Math.max(
        overviewDistance,
        depth +
          (Math.abs(horizontal) + radius) /
            (Math.tan(22 * RAD) * camera.aspect * 0.9),
        depth +
          Math.max(0, vertical + radius) / (Math.tan(22 * RAD) * topLimit),
        depth +
          Math.max(0, -vertical + radius) / (Math.tan(22 * RAD) * bottomLimit),
      );
    }
    spaceCamera.copy(direction).multiplyScalar(overviewDistance);
    const settle = smooth(0, 0.23, p);
    camera.position.lerpVectors(spaceCamera, navCamera, settle);
    target.set(0, 0, 0).lerp(navTarget, settle);
    camera.up
      .copy(overviewUp)
      .lerp(north, smooth(0.07, 0.32, p))
      .normalize();
    camera.setViewOffset(
      width,
      height,
      0,
      (height / 2 - viewCenter) * (1 - settle),
      width,
      height,
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
    earth.updateMatrixWorld(true);
    sphere.center.copy(earth.position);
    sphere.radius = 1.00006 * earthScale;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    let lat = null,
      lon = null;
    if (p > 0.008 && raycaster.ray.intersectSphere(sphere, intersection)) {
      inverse.copy(earth.quaternion).invert();
      intersection.sub(earth.position).applyQuaternion(inverse).normalize();
      lat = Math.asin(THREE.MathUtils.clamp(intersection.y, -1, 1)) / RAD;
      lon = Math.atan2(-intersection.z, intersection.x) / RAD;
    }
    const pinNormal = geo(DESTINATION.lat, DESTINATION.lon).applyQuaternion(
      earth.quaternion,
    );
    const pinWorld = pinNormal
        .clone()
        .multiplyScalar(1.000085 * earthScale)
        .add(earth.position),
      projected = pinWorld.clone().project(camera);
    const facing =
      pinNormal.dot(camera.position.clone().sub(earth.position).normalize()) >
      0;
    const pin =
      p > 0.59 &&
      p < 0.965 &&
      facing &&
      Math.abs(projected.x) < 0.9 &&
      Math.abs(projected.y) < 0.8
        ? {
            x: ((projected.x + 1) * width) / 2,
            y: ((1 - projected.y) * height) / 2,
          }
        : null;
    const solarLabels = [];
    const planetPoses = {};
    if (p < 0.18) {
      const candidates = [
        { id: "sun", name: "Sun", root: sun, radius: 1.75 },
        ...solar.bodies,
      ];
      for (const body of candidates) {
        const center = body.root.position.clone().project(camera);
        const radius =
          body.id === "earth"
            ? earthScale
            : body.radius * (body.id === "sun" ? 1 : bodyBoost);
        const pixelRadius =
          (radius * height) /
          (2 *
            Math.tan(22 * RAD) *
            camera.position.distanceTo(body.root.position));
        if (center.z < 1)
          solarLabels.push({
            id: body.id,
            name: body.name,
            x: ((center.x + 1) * width) / 2,
            y: ((1 - center.y) * height) / 2,
            radius: pixelRadius,
          });
      }
    }
    for (const body of solar.bodies)
      planetPoses[body.id] = {
        orbit: +(body.phase + time * body.rate * orbitLock).toFixed(5),
        spin: +(time * body.spin).toFixed(5),
        position: body.root.position.toArray().map((v) => +v.toFixed(4)),
      };
    viewport.dataset.planets = JSON.stringify(planetPoses);
    viewport.dataset.planetCount = "8";
    telemetry = {
      solarLabels,
      solarCompact: compact,
      lat,
      lon,
      alt:
        p > 0.008
          ? Math.max(
              0,
              (camera.position.distanceTo(earth.position) / earthScale - 1) *
                EARTH_KM,
            )
          : null,
      pin,
    };
    renderer.render(scene, camera);
    viewport.dataset.progress = p.toFixed(4);
    viewport.dataset.rotation = earth.rotation.y.toFixed(4);
    viewport.dataset.orbit = orbitAngle.toFixed(4);
    viewport.dataset.lat = lat == null ? "" : lat.toFixed(6);
    viewport.dataset.lon = lon == null ? "" : lon.toFixed(6);
    viewport.dataset.camera = camera.position
      .toArray()
      .map((v) => v.toFixed(7))
      .join(",");
    return telemetry;
  }
  return {
    render,
    get ready() {
      return ready;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
