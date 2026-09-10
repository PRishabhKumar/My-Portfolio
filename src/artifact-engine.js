import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { technologyLogos } from "./toolkit";

const TAU = Math.PI * 2;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const shortest = (a, b) => ((((b - a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

// Both sculptures are built from code. No downloaded models, HDRs, or texture CDNs.
export function createArtifact(viewport, options) {
  const { variant } = options;
  const isHero = variant === "hero";
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  const geometry = (g) => {
    geometries.add(g);
    return g;
  };
  const material = (m) => {
    materials.add(m);
    return m;
  };
  const texture = (t) => {
    textures.add(t);
    return t;
  };
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio || 1, innerWidth < 650 ? 1.35 : 1.75),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isHero ? 1.08 : 0.95;
  renderer.domElement.className = "artifact-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  viewport.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  camera.position.set(0, isHero ? 0.35 : 2.2, isHero ? 7.7 : 5.6);
  camera.lookAt(0, isHero ? -0.04 : -0.12, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // Dark studio walls and broad softboxes give the metal real, contrasty reflections.
  room.traverse((object) => {
    if (object.material?.isMeshStandardMaterial)
      object.material.color.setHex(
        object.isInstancedMesh ? 0x242b1f : 0x555e4b,
      );
    if (object.isPointLight) object.intensity *= 0.78;
  });
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const keyLight = new THREE.DirectionalLight(0xfff3df, 3.1);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xe3efd3, 1.8);
  fillLight.position.set(-4, 2.5, 3);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xc2d69d, 2.4);
  rimLight.position.set(1, 4, -4);
  scene.add(rimLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const chrome = material(
    new THREE.MeshPhysicalMaterial({
      color: 0xc3c9bb,
      metalness: 1,
      roughness: 0.21,
      clearcoat: 0.65,
      envMapIntensity: 1.8,
    }),
  );
  const brushed = material(
    new THREE.MeshStandardMaterial({
      color: 0x79816d,
      metalness: 0.88,
      roughness: 0.34,
      envMapIntensity: 1.2,
    }),
  );
  const brass = material(
    new THREE.MeshStandardMaterial({
      color: 0xc5aa7c,
      metalness: 0.8,
      roughness: 0.27,
    }),
  );
  const sage = material(
    new THREE.MeshPhysicalMaterial({
      color: 0xabc972,
      metalness: 0.1,
      roughness: 0.29,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
    }),
  );
  const graphite = material(
    new THREE.MeshStandardMaterial({
      color: 0x283024,
      metalness: 0.62,
      roughness: 0.42,
    }),
  );
  const ceramic = material(
    new THREE.MeshPhysicalMaterial({
      color: 0xeceddf,
      roughness: 0.28,
      metalness: 0.08,
      clearcoat: 0.6,
    }),
  );
  const light = material(
    new THREE.MeshBasicMaterial({ color: 0xc5df9d, toneMapped: false }),
  );
  const mesh = (g, m, parent = scene) => {
    const result = new THREE.Mesh(g, m);
    parent.add(result);
    return result;
  };
  const rounded = (w, h, d, r = 0.07) =>
    geometry(new RoundedBoxGeometry(w, h, d, 4, r));
  const sphereGeometry = geometry(new THREE.SphereGeometry(1, 28, 20));
  const torus = (r, tube = 0.022, segments = 120) =>
    geometry(new THREE.TorusGeometry(r, tube, 8, segments));
  const cylinder = (r, height, sides = 32) =>
    geometry(new THREE.CylinderGeometry(r, r, height, sides));
  const model = new THREE.Group();
  scene.add(model);
  const pickables = [];
  const arms = [],
    modules = [],
    coreLayers = [],
    connectors = [];
  let ring, secondaryRing, satellite;

  // A soft contact shadow anchors the floating metal without an expensive postprocess.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d");
  const gradient = shadowContext.createRadialGradient(64, 64, 8, 64, 64, 62);
  gradient.addColorStop(0, "rgba(11,20,7,.35)");
  gradient.addColorStop(0.45, "rgba(11,20,7,.16)");
  gradient.addColorStop(1, "rgba(11,20,7,0)");
  shadowContext.fillStyle = gradient;
  shadowContext.fillRect(0, 0, 128, 128);
  const shadowTexture = texture(new THREE.CanvasTexture(shadowCanvas));
  const shadowMaterial = material(
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    }),
  );
  const shadow = mesh(
    geometry(new THREE.PlaneGeometry(isHero ? 4.8 : 5.8, isHero ? 2.6 : 4.4)),
    shadowMaterial,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = isHero ? -1.66 : -1.08;

  if (isHero) {
    // ORBIT / 01 — a milled six-arm rotor, nested orbital rails and a ceramic satellite.
    const rotor = new THREE.Group();
    model.add(rotor);
    rotor.rotation.z = Math.PI / 12;
    const armGeometry = rounded(0.48, 1.4, 0.61, 0.225);
    const endGeometry = rounded(0.36, 0.14, 0.45, 0.065);
    for (let i = 0; i < 6; i++) {
      const angle = (i * TAU) / 6;
      const arm = new THREE.Group();
      arm.rotation.z = angle;
      rotor.add(arm);
      const beam = mesh(armGeometry, chrome, arm);
      beam.position.y = 0.47;
      const cap = mesh(endGeometry, brushed, arm);
      cap.position.set(0, 1.13, 0);
      const fastener = mesh(sphereGeometry, brass, arm);
      fastener.scale.setScalar(0.044);
      fastener.position.set(0, 1.02, 0.3);
      arms.push({ group: arm, angle });
      beam.userData.part = "rotor";
      pickables.push(beam);
    }
    const hub = mesh(cylinder(0.36, 0.7), graphite, rotor);
    hub.rotation.x = Math.PI / 2;
    const hubFace = mesh(cylinder(0.26, 0.035), sage, rotor);
    hubFace.rotation.x = Math.PI / 2;
    hubFace.position.z = 0.365;
    const hubRing = mesh(torus(0.3, 0.021, 64), brass, rotor);
    hubRing.position.z = 0.371;
    // An engraved asterisk-like drive in the center, not a generic primitive.
    const slotGeometry = rounded(0.032, 0.3, 0.008, 0.005);
    for (let i = 0; i < 3; i++) {
      const slot = mesh(slotGeometry, graphite, rotor);
      slot.position.z = 0.394;
      slot.rotation.z = (i * Math.PI) / 3;
    }
    ring = mesh(torus(1.77, 0.036, 160), chrome, model);
    ring.rotation.set(0.58, 0.64, -0.45);
    secondaryRing = mesh(torus(1.9, 0.012, 160), brass, model);
    secondaryRing.rotation.set(0.65, 0.67, -0.46);
    // Tiny indexed collars make the orbit feel manufactured, not merely decorative.
    for (let i = 0; i < 3; i++) {
      const angle = 0.4 + i * 2.25;
      const collar = mesh(sphereGeometry, i === 1 ? sage : brass, ring);
      collar.scale.setScalar(i === 1 ? 0.082 : 0.049);
      collar.position.set(Math.cos(angle) * 1.77, Math.sin(angle) * 1.77, 0);
    }
    satellite = mesh(sphereGeometry, sage, model);
    satellite.scale.setScalar(0.37);
    satellite.position.set(1.14, -1.08, 0.56);
    pickables.push(satellite);
    const seam = mesh(torus(0.372, 0.006, 96), brushed, satellite);
    seam.scale.setScalar(1 / 0.37);
    seam.rotation.y = Math.PI / 2;
  } else {
    // STACK / 02 — a six-cartridge radial computer with actual brand plates.
    const hex = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i * TAU) / 6;
      const x = Math.cos(angle) * 0.6,
        y = Math.sin(angle) * 0.6;
      i ? hex.lineTo(x, y) : hex.moveTo(x, y);
    }
    hex.closePath();
    const layerGeometry = geometry(
      new THREE.ExtrudeGeometry(hex, {
        depth: 0.09,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.026,
        bevelThickness: 0.025,
      }),
    );
    for (let i = 0; i < 5; i++) {
      const plate = mesh(
        layerGeometry,
        i === 2 ? sage : i === 4 ? chrome : graphite,
        model,
      );
      plate.rotation.x = -Math.PI / 2;
      plate.position.y = -0.57 + i * 0.18;
      coreLayers.push(plate);
    }
    const shaft = mesh(cylinder(0.13, 1.23), brass, model);
    shaft.position.y = -0.1;
    const top = mesh(cylinder(0.25, 0.08), brushed, model);
    top.position.y = 0.49;
    const topLight = mesh(cylinder(0.155, 0.085), light, model);
    topLight.position.y = 0.496;
    const drive = mesh(torus(0.33, 0.018, 72), brass, model);
    drive.rotation.x = Math.PI / 2;
    drive.position.y = 0.51;
    ring = mesh(torus(1.52, 0.027), brushed, model);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.32;
    secondaryRing = mesh(torus(1.59, 0.012), brass, model);
    secondaryRing.rotation.x = Math.PI / 2;
    secondaryRing.position.y = -0.4;
    const cartridgeGeometry = rounded(1.13, 0.89, 0.19, 0.085);
    const backingGeometry = rounded(1.01, 0.77, 0.055, 0.075);
    const faceGeometry = geometry(new THREE.PlaneGeometry(0.95, 0.68));
    const screwGeometry = geometry(new THREE.SphereGeometry(0.016, 8, 6));
    const connectorGeometry = cylinder(0.016, 1, 8);
    const dotGeometry = geometry(new THREE.SphereGeometry(0.022, 10, 8));
    for (let i = 0; i < 6; i++) {
      const group = new THREE.Group();
      group.userData.moduleIndex = i;
      model.add(group);
      const bodyMaterial = material(ceramic.clone());
      const body = mesh(cartridgeGeometry, bodyMaterial, group);
      body.userData.moduleIndex = i;
      pickables.push(body);
      const back = mesh(backingGeometry, graphite, group);
      back.position.z = -0.114;
      const frontMaterial = material(
        new THREE.MeshBasicMaterial({ color: 0xf0f2e8, toneMapped: false }),
      );
      const face = mesh(faceGeometry, frontMaterial, group);
      face.position.z = 0.099;
      face.userData.moduleIndex = i;
      pickables.push(face);
      for (const x of [-0.48, 0.48])
        for (const y of [-0.35, 0.35]) {
          const screw = mesh(screwGeometry, brass, group);
          screw.position.set(x, y, 0.092);
        }
      const led = mesh(dotGeometry, light, group);
      led.position.set(0.43, -0.28, 0.103);
      // Back faces are ribbed as well, so a full turn is worth making.
      for (let j = 0; j < 4; j++) {
        const vent = mesh(rounded(0.53, 0.019, 0.01, 0.005), brushed, group);
        vent.position.set(0, 0.13 - j * 0.084, -0.146);
      }
      const connector = mesh(connectorGeometry, brass, model);
      connectors.push(connector);
      modules.push({
        group,
        bodyMaterial,
        frontMaterial,
        led,
        angle: (i * TAU) / 6,
        baseY: i % 2 ? 0.12 : 0.2,
      });
    }
  }

  const state = {
    active: true,
    disposed: false,
    paused: false,
    dragging: false,
    unfolded: false,
    yaw: isHero ? -0.5 : 0,
    targetYaw: isHero ? -0.5 : 0,
    pitch: isHero ? -0.04 : 0.03,
    targetPitch: isHero ? -0.04 : 0.03,
    spin: 0,
    spread: 0,
    time: 0,
    selected: 0,
    hovered: -1,
    dark: document.documentElement.dataset.theme === "dark",
    ready: false,
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const upVector = new THREE.Vector3(0, 1, 0);
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    direction = new THREE.Vector3();
  let frame = 0,
    last = 0,
    lastRender = 0,
    generation = 0,
    currentGroup = null;
  let downX = 0,
    downY = 0,
    lastX = 0,
    lastY = 0,
    lastMove = 0,
    speed = 0,
    travel = 0;

  function resize() {
    const width = Math.max(1, viewport.clientWidth),
      height = Math.max(1, viewport.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the complete artifact in frame, even on narrow phones.
    const fit = Math.max(1, (isHero ? 1.13 : 1.32) / camera.aspect);
    camera.position.set(
      0,
      isHero ? 0.35 : 2.2 * fit,
      (isHero ? 7.7 : 5.6) * fit,
    );
    camera.lookAt(0, isHero ? -0.04 : -0.12, 0);
    camera.updateProjectionMatrix();
    wake();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);

  function draw(now) {
    frame = 0;
    if (state.disposed || !state.active || document.hidden) return;
    const dt = Math.min((now - (last || now - 16.7)) / 1000, 0.045);
    last = now;
    if (!state.paused && !reduced.matches) state.time += dt;
    const smoothing =
      reduced.matches && !state.dragging ? 1 : 1 - Math.exp(-9 * dt);
    if (!state.dragging && Math.abs(state.spin) > 0.003) {
      state.targetYaw += state.spin * dt;
      state.spin *= Math.exp(-1.5 * dt);
    }
    state.yaw += (state.targetYaw - state.yaw) * smoothing;
    state.pitch += (state.targetPitch - state.pitch) * smoothing;
    state.spread += ((state.unfolded ? 1 : 0) - state.spread) * smoothing;
    model.rotation.set(state.pitch, state.yaw, isHero ? -0.1 : 0);
    model.position.y =
      reduced.matches || state.paused ? 0 : Math.sin(state.time * 0.8) * 0.035;
    if (isHero) {
      for (const arm of arms) {
        const amount = state.spread * 0.54;
        arm.group.position.set(
          -Math.sin(arm.angle) * amount,
          Math.cos(arm.angle) * amount,
          state.spread * 0.11,
        );
      }
      ring.rotation.z = -0.45 + Math.sin(state.time * 0.17) * 0.04;
      secondaryRing.scale.setScalar(1 + state.spread * 0.045);
      satellite.position.y =
        -1.08 + Math.sin(state.time * 0.8 + 1) * 0.04 + state.spread * 0.12;
    } else {
      coreLayers.forEach((layer, i) => {
        layer.position.y = -0.57 + i * (0.18 + state.spread * 0.055);
      });
      modules.forEach((module, i) => {
        const radius = 1.52 + state.spread * 0.48;
        const y =
          module.baseY +
          Math.sin(state.time * 0.8 + i) *
            (reduced.matches || state.paused ? 0 : 0.022);
        module.group.position.set(
          Math.sin(module.angle) * radius,
          y,
          Math.cos(module.angle) * radius,
        );
        module.group.rotation.set(-0.11, module.angle, 0);
        const selected = i === state.selected,
          hovering = i === state.hovered;
        module.bodyMaterial.emissive.setHex(
          selected || hovering ? 0x749747 : 0x000000,
        );
        module.bodyMaterial.emissiveIntensity = hovering
          ? 0.28
          : selected
            ? 0.13
            : 0;
        module.led.scale.setScalar(selected ? 1.2 : 0.66);
        a.set(
          Math.sin(module.angle) * 0.48,
          -0.32,
          Math.cos(module.angle) * 0.48,
        );
        b.copy(module.group.position).add(new THREE.Vector3(0, -0.3, 0));
        direction.subVectors(b, a);
        connectors[i].position.copy(a).add(b).multiplyScalar(0.5);
        connectors[i].scale.y = direction.length();
        connectors[i].quaternion.setFromUnitVectors(
          upVector,
          direction.normalize(),
        );
      });
      ring.rotation.z = Math.sin(state.time * 0.13) * 0.013;
      ring.scale.setScalar(1 + state.spread * 0.21);
      secondaryRing.scale.setScalar(1 + state.spread * 0.22);
    }
    viewport.dataset.rotation = `${state.yaw.toFixed(3)},${state.pitch.toFixed(3)}`;
    viewport.dataset.phase = state.time.toFixed(3);
    viewport.dataset.spread = state.spread.toFixed(3);
    // 30fps while resting; full refresh during manipulation and pose changes.
    const moving =
      state.dragging ||
      Math.abs(state.targetPitch - state.pitch) > 0.004 ||
      Math.abs(state.targetYaw - state.yaw) > 0.004 ||
      Math.abs(state.spin) > 0.01 ||
      Math.abs((state.unfolded ? 1 : 0) - state.spread) > 0.004;
    if (moving || now - lastRender > 31 || !state.ready) {
      renderer.render(scene, camera);
      lastRender = now;
      if (!state.ready) {
        state.ready = true;
        options.onReady?.();
      }
    }
    if ((!state.paused && !reduced.matches) || moving)
      frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (!frame && state.active && !state.disposed && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(draw);
    }
  }
  function setActive(active) {
    state.active = active;
    if (active) wake();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }
  function select(index, notify = false) {
    state.selected = clamp(index, 0, 5);
    if (!isHero) {
      const desired = -modules[state.selected].angle;
      state.targetYaw = state.yaw + shortest(state.yaw, desired);
      state.spin = 0;
      state.targetPitch = 0.03;
      viewport.dataset.selected = String(state.selected);
      if (notify) options.onSelect?.(state.selected);
    }
    wake();
  }
  function toggleUnfold(force) {
    state.unfolded = typeof force === "boolean" ? force : !state.unfolded;
    options.onUnfold?.(state.unfolded);
    wake();
  }
  function reset() {
    state.targetYaw = isHero ? -0.5 : -modules[state.selected].angle;
    state.targetPitch = isHero ? -0.04 : 0.03;
    state.spin = 0;
    toggleUnfold(false);
    wake();
  }
  function spin() {
    state.spin = reduced.matches ? 0 : 3.5;
    state.targetYaw += reduced.matches ? Math.PI / 3 : 0.5;
    wake();
  }
  function pause(value) {
    state.paused = value;
    wake();
  }
  function theme(dark) {
    state.dark = dark;
    chrome.color.setHex(dark ? 0xd0d7c9 : 0xbac3b4);
    chrome.envMapIntensity = dark ? 1.6 : 1.8;
    shadowMaterial.opacity = dark ? 0.38 : 0.85;
    wake();
  }
  async function setGroup(group) {
    if (isHero || group.id === currentGroup) return;
    currentGroup = group.id;
    const token = ++generation;
    viewport.dataset.logosReady = "false";
    const maps = await Promise.all(
      group.tools.map(async ([name, subtitle, ids]) => {
        const canvas = document.createElement("canvas");
        canvas.width = 384;
        canvas.height = 276;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#f0f2e8";
        ctx.fillRect(0, 0, 384, 276);
        const images = await Promise.all(
          ids.map(
            (id) =>
              new Promise((resolve) => {
                const image = new Image();
                image.crossOrigin = "anonymous";
                image.onload = () => resolve(image);
                image.onerror = () => resolve(null);
                image.src = technologyLogos[id].src;
              }),
          ),
        );
        images.forEach((image, i) => {
          if (!image) return;
          const size = ids.length > 1 ? 106 : 132;
          const ratio = image.naturalWidth / image.naturalHeight;
          const width = ratio >= 1 ? size : size * ratio,
            height = ratio >= 1 ? size / ratio : size;
          const center = ids.length > 1 ? 124 + i * 136 : 192;
          ctx.drawImage(
            image,
            center - width / 2,
            100 - height / 2,
            width,
            height,
          );
        });
        ctx.fillStyle = "#36472b";
        ctx.font = '500 19px "DM Sans", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(name, 192, 217, 335);
        ctx.fillStyle = "#8a9979";
        ctx.font = '12px "DM Mono", monospace';
        ctx.fillText("PART OF THE STACK", 192, 246);
        const result = new THREE.CanvasTexture(canvas);
        result.colorSpace = THREE.SRGBColorSpace;
        result.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy(),
        );
        return result;
      }),
    );
    if (state.disposed || token !== generation) {
      maps.forEach((map) => map.dispose());
      return;
    }
    maps.forEach((map, i) => {
      const old = modules[i].frontMaterial.map;
      if (old) {
        old.dispose();
        textures.delete(old);
      }
      modules[i].frontMaterial.map = texture(map);
      modules[i].frontMaterial.needsUpdate = true;
    });
    viewport.dataset.logosReady = "true";
    wake();
  }
  function hit(event) {
    const bounds = viewport.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const found = raycaster.intersectObjects(pickables, false)[0];
    return found?.object;
  }
  function pointerDown(event) {
    if (
      event.button !== 0 ||
      !event.isPrimary ||
      event.target !== renderer.domElement
    )
      return;
    state.dragging = true;
    state.spin = 0;
    speed = 0;
    travel = 0;
    downX = lastX = event.clientX;
    downY = lastY = event.clientY;
    lastMove = performance.now();
    viewport.dataset.dragging = "true";
    renderer.domElement.setPointerCapture(event.pointerId);
    wake();
  }
  function pointerMove(event) {
    if (!event.isPrimary) return;
    if (state.dragging && event.pointerType === "mouse" && !event.buttons)
      cancelGrab();
    if (state.dragging) {
      const now = performance.now();
      const dx = event.clientX - lastX,
        dy = event.clientY - lastY;
      state.targetYaw += dx * 0.008;
      state.targetPitch = clamp(
        state.targetPitch + dy * 0.006,
        isHero ? -0.7 : -0.42,
        isHero ? 0.7 : 0.48,
      );
      travel = Math.max(
        travel,
        Math.hypot(event.clientX - downX, event.clientY - downY),
      );
      speed = clamp(
        (dx * 0.008) / Math.max(0.015, (now - lastMove) / 1000),
        -2.7,
        2.7,
      );
      lastX = event.clientX;
      lastY = event.clientY;
      lastMove = now;
      wake();
    } else if (event.pointerType !== "touch") {
      const part = hit(event);
      state.hovered = part?.userData.moduleIndex ?? -1;
      viewport.dataset.hovered = String(state.hovered);
      viewport.dataset.hit = part ? "true" : "false";
      wake();
    }
  }
  function pointerUp(event) {
    if (!event.isPrimary || !state.dragging) return;
    state.dragging = false;
    viewport.dataset.dragging = "false";
    try {
      renderer.domElement.releasePointerCapture(event.pointerId);
    } catch {
      /* cancelled by a touch scroll */
    }
    if (event.type !== "pointercancel") {
      if (travel < 6) {
        const part = hit(event);
        if (isHero && part) toggleUnfold();
        else if (part?.userData.moduleIndex !== undefined)
          select(part.userData.moduleIndex, true);
      } else if (!reduced.matches) state.spin = speed * 0.5;
    }
    wake();
  }
  function cancelGrab() {
    state.dragging = false;
    state.spin = 0;
    viewport.dataset.dragging = "false";
  }
  function pointerLeave() {
    if (!state.dragging) {
      state.hovered = -1;
      viewport.dataset.hit = "false";
    }
  }
  function key(event) {
    const keys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Enter",
      " ",
      "Home",
      "r",
      "R",
    ];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    state.spin = 0;
    if (event.key === "ArrowLeft") state.targetYaw -= 0.3;
    if (event.key === "ArrowRight") state.targetYaw += 0.3;
    if (event.key === "ArrowUp")
      state.targetPitch = clamp(state.targetPitch - 0.15, -0.65, 0.65);
    if (event.key === "ArrowDown")
      state.targetPitch = clamp(state.targetPitch + 0.15, -0.65, 0.65);
    if (event.key === "Enter" || event.key === " ") toggleUnfold();
    if (["Home", "r", "R"].includes(event.key)) reset();
    wake();
  }
  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  }
  function onLost(event) {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    options.onLost?.();
  }
  function onRestored() {
    state.ready = false;
    wake();
  }
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointermove", pointerMove);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  renderer.domElement.addEventListener("pointercancel", pointerUp);
  renderer.domElement.addEventListener("pointerleave", pointerLeave);
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  renderer.domElement.addEventListener("webglcontextrestored", onRestored);
  viewport.addEventListener("keydown", key);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("blur", cancelGrab);
  reduced.addEventListener("change", wake);
  theme(state.dark);
  resize();
  wake();

  return {
    setActive,
    select,
    toggleUnfold,
    reset,
    spin,
    pause,
    theme,
    setGroup,
    dispose() {
      state.disposed = true;
      generation++;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewport.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", cancelGrab);
      reduced.removeEventListener("change", wake);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("pointerleave", pointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onRestored,
      );
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
