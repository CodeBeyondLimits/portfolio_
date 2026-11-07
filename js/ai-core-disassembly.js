// ==========================================================================
// 3D AI COMPUTATIONAL CORE & REVERSIBLE SCROLL DISASSEMBLY ENGINE
// Built with Three.js
// 100% Deterministic, Progress-driven, Reversible Reassembly
// Palette: #2F4454, #2E151B, #DA7B93, #376E6F, #1C3334, #67E8F9, #B794F4
// ==========================================================================

export function initAICoreDisassembly() {
  const canvas = document.getElementById('ai-core-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    console.warn('Three.js not loaded or canvas missing');
    return;
  }

  const container = canvas.parentElement;
  let width = (canvas.width = container.clientWidth);
  let height = (canvas.height = container.clientHeight);

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1C3334, 0.025);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 16);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Lighting Environment
  const ambientLight = new THREE.AmbientLight(0x2F4454, 1.2);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x67E8F9, 2.2); // Icy cyan key light
  keyLight.position.set(12, 18, 14);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xDA7B93, 1.8); // Vibrant dusty pink rim
  rimLight.position.set(-14, -10, -8);
  scene.add(rimLight);

  // Core internal point light (revealed during disassembly)
  const coreLight = new THREE.PointLight(0xDA7B93, 3, 25);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);

  // Cursor-reactive dynamic light
  const cursorLight = new THREE.PointLight(0xB794F4, 2, 20); // Electric lavender
  cursorLight.position.set(0, 0, 10);
  scene.add(cursorLight);

  // 3. Root Machine Group
  const machineRoot = new THREE.Group();
  scene.add(machineRoot);

  // Material Library
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2F4454,
    metalness: 0.85,
    roughness: 0.25,
    wireframe: false
  });

  const burgundyMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2E151B,
    metalness: 0.7,
    roughness: 0.35
  });

  const accentPinkMat = new THREE.MeshStandardMaterial({
    color: 0xDA7B93,
    emissive: 0xDA7B93,
    emissiveIntensity: 0.45,
    metalness: 0.6,
    roughness: 0.2
  });

  const glowingCoreMat = new THREE.MeshStandardMaterial({
    color: 0xDA7B93,
    emissive: 0xDA7B93,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0.9
  });

  const wireframeLatticeMat = new THREE.MeshBasicMaterial({
    color: 0x67E8F9,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });

  // Array storing all disassembling modules and their deterministic states
  const machineComponents = [];

  // ========================================================================
  // COMPONENT 1: CENTRAL NEURAL NUCLEUS
  // ========================================================================
  const nucleusGroup = new THREE.Group();
  const nucleusInnerGeom = new THREE.SphereGeometry(1.2, 32, 32);
  const nucleusInner = new THREE.Mesh(nucleusInnerGeom, glowingCoreMat);
  nucleusGroup.add(nucleusInner);

  const nucleusLatticeGeom = new THREE.IcosahedronGeometry(1.6, 1);
  const nucleusLattice = new THREE.Mesh(nucleusLatticeGeom, wireframeLatticeMat);
  nucleusGroup.add(nucleusLattice);

  machineRoot.add(nucleusGroup);

  machineComponents.push({
    mesh: nucleusGroup,
    pos0: new THREE.Vector3(0, 0, 0),
    pos1: new THREE.Vector3(0, 0, 1.8), // Moves forward when exposed
    rot0: new THREE.Euler(0, 0, 0),
    rot1: new THREE.Euler(Math.PI * 2, Math.PI * 4, 0),
    scale0: new THREE.Vector3(1, 1, 1),
    scale1: new THREE.Vector3(1.35, 1.35, 1.35)
  });

  // ========================================================================
  // COMPONENT 2: MECHANICAL GIMBAL RINGS (3 Concentric Rings)
  // ========================================================================
  const ringGeoms = [
    { inner: 2.8, outer: 3.1, mat: darkMetalMat, axis: 'x', mult: 1 },
    { inner: 3.4, outer: 3.7, mat: burgundyMetalMat, axis: 'y', mult: -1 },
    { inner: 4.0, outer: 4.3, mat: accentPinkMat, axis: 'z', mult: 1.5 }
  ];

  ringGeoms.forEach((rg, idx) => {
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry((rg.inner + rg.outer) / 2, (rg.outer - rg.inner) / 2, 16, 64),
      rg.mat
    );

    // Initial orientation
    const initRot = new THREE.Euler(
      idx === 0 ? 0 : Math.PI / 4 * idx,
      idx === 1 ? Math.PI / 2 : 0,
      idx === 2 ? Math.PI / 3 : 0
    );
    ringMesh.rotation.copy(initRot);
    machineRoot.add(ringMesh);

    // Disassembled target: expands outward and tilts heavily
    const disRot = new THREE.Euler(
      initRot.x + Math.PI * 2 * rg.mult,
      initRot.y + Math.PI * 1.5 * rg.mult,
      initRot.z + Math.PI * rg.mult
    );

    machineComponents.push({
      mesh: ringMesh,
      pos0: new THREE.Vector3(0, 0, 0),
      pos1: new THREE.Vector3(0, 0, (idx - 1) * 3.2), // Spreads along Z
      rot0: initRot.clone(),
      rot1: disRot,
      scale0: new THREE.Vector3(1, 1, 1),
      scale1: new THREE.Vector3(1.4 + idx * 0.2, 1.4 + idx * 0.2, 1.4 + idx * 0.2)
    });
  });

  // ========================================================================
  // COMPONENT 3: MODULAR FACETED ARMOR SHELL PLATES (14 Plates)
  // In assembled state: form a faceted protective spherical capsule
  // In disassembled state: travel outward along normal vectors
  // ========================================================================
  const shellPlatesGroup = new THREE.Group();
  machineRoot.add(shellPlatesGroup);

  const PLATE_COUNT = 14;
  const plateGeom = new THREE.BoxGeometry(1.6, 1.2, 0.22);

  for (let i = 0; i < PLATE_COUNT; i++) {
    // Distribute spherically
    const phi = Math.acos(-1 + (2 * i) / PLATE_COUNT);
    const theta = Math.sqrt(PLATE_COUNT * Math.PI) * phi;
    const rAssembled = 3.6;

    const normal = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    ).normalize();

    const plateMesh = new THREE.Mesh(plateGeom, i % 2 === 0 ? darkMetalMat : burgundyMetalMat);

    // Position on sphere surface and align face to normal
    const pos0 = normal.clone().multiplyScalar(rAssembled);
    plateMesh.position.copy(pos0);
    plateMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    const rot0 = plateMesh.rotation.clone();

    shellPlatesGroup.add(plateMesh);

    // Disassembled position: blown outward along its normal by distance + rotation
    const rDisassembled = 9.5 + (i % 3) * 2.2;
    const pos1 = normal.clone().multiplyScalar(rDisassembled);
    const rot1 = new THREE.Euler(
      rot0.x + (i % 2 === 0 ? 1 : -1) * Math.PI * 0.75,
      rot0.y + Math.PI * 0.5,
      rot0.z + (i % 3) * Math.PI * 0.5
    );

    machineComponents.push({
      mesh: plateMesh,
      pos0: pos0.clone(),
      pos1: pos1.clone(),
      rot0: rot0.clone(),
      rot1: rot1.clone(),
      scale0: new THREE.Vector3(1, 1, 1),
      scale1: new THREE.Vector3(0.85, 0.85, 0.85)
    });
  }

  // ========================================================================
  // COMPONENT 4: COMPUTATIONAL MEMORY BLOCKS (8 Prismatic Cubes)
  // Slide out along diagonal axes
  // ========================================================================
  const blockGeom = new THREE.BoxGeometry(0.7, 0.7, 1.4);
  const cubeCorners = [
    [-1, -1, -1], [ 1, -1, -1], [-1,  1, -1], [ 1,  1, -1],
    [-1, -1,  1], [ 1, -1,  1], [-1,  1,  1], [ 1,  1,  1]
  ];

  cubeCorners.forEach(([cx, cy, cz], idx) => {
    const blockMesh = new THREE.Mesh(blockGeom, idx % 2 === 0 ? accentPinkMat : darkMetalMat);
    const dir = new THREE.Vector3(cx, cy, cz).normalize();

    const pos0 = dir.clone().multiplyScalar(2.2);
    const pos1 = dir.clone().multiplyScalar(6.5);

    blockMesh.position.copy(pos0);
    blockMesh.lookAt(new THREE.Vector3(0, 0, 0));
    const rot0 = blockMesh.rotation.clone();
    const rot1 = new THREE.Euler(rot0.x + Math.PI, rot0.y + Math.PI, rot0.z + Math.PI / 2);

    machineRoot.add(blockMesh);

    machineComponents.push({
      mesh: blockMesh,
      pos0: pos0.clone(),
      pos1: pos1.clone(),
      rot0: rot0.clone(),
      rot1: rot1.clone(),
      scale0: new THREE.Vector3(1, 1, 1),
      scale1: new THREE.Vector3(1.2, 1.2, 1.2)
    });
  });

  // ========================================================================
  // COMPONENT 5: FLOATING AMBIENT GLYPHS & ENERGY SHARDS (36 Shards)
  // Orbit gently in the volumetric background
  // ========================================================================
  const shardGeom = new THREE.OctahedronGeometry(0.35, 0);
  const shards = [];

  for (let i = 0; i < 36; i++) {
    const shard = new THREE.Mesh(
      shardGeom,
      i % 2 === 0 ? accentPinkMat : wireframeLatticeMat
    );

    const rad = 7 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    shard.position.set(
      rad * Math.sin(phi) * Math.cos(theta),
      rad * Math.sin(phi) * Math.sin(theta),
      rad * Math.cos(phi)
    );

    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    machineRoot.add(shard);

    shards.push({
      mesh: shard,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      orbitSpeed: (Math.random() - 0.5) * 0.005
    });
  }

  // ========================================================================
  // DETERMINISTIC SCROLL SYNCHRONIZATION
  // Interpolates every component strictly by normalized scroll progress [0..1]
  // Completely reversible: scroll up -> components reassemble perfectly
  // ========================================================================
  let currentScrollProgress = 0;
  let targetScrollProgress = 0;

  const statusLabel = document.getElementById('disassembly-status-text');

  function calculateScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    // Map progress: fully disassembled by 60% of total scroll depth
    return Math.min(1, Math.max(0, (window.scrollY / maxScroll) * 1.6));
  }

  window.addEventListener('scroll', () => {
    targetScrollProgress = calculateScrollProgress();
  }, { passive: true });

  // Mouse Parallax & Dynamic Light Tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / width - 0.5) * 2;
    mouse.targetY = -(e.clientY / height - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    if (!container) return;
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Base cubic-bezier easing function matching specification
  function easeBase(t) {
    // Approximation of cubic-bezier(0.22, 1, 0.36, 1)
    return t === 1 ? 1 : 1 - Math.pow(1 - t, 3.2);
  }

  // Animation Loop
  let clock = new THREE.Clock();
  let animId;

  function render() {
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Smooth lerp for scroll progress
    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;
    const pEased = easeBase(currentScrollProgress);

    // Update status indicator text if present
    if (statusLabel) {
      const pct = Math.round(currentScrollProgress * 100);
      if (pct === 0) {
        statusLabel.textContent = 'CORE ASSEMBLED [0% DISPERSED]';
      } else if (pct >= 99) {
        statusLabel.textContent = 'CORE DISASSEMBLED [100% DISPERSED]';
      } else {
        statusLabel.textContent = `CORE DISMANTLING [${pct}% DISPERSED]`;
      }
    }

    // 2. Interpolate every component state
    machineComponents.forEach(comp => {
      // Deterministic lerp from pos0 -> pos1
      comp.mesh.position.lerpVectors(comp.pos0, comp.pos1, pEased);

      // Deterministic lerp for Euler rotations
      comp.mesh.rotation.x = THREE.MathUtils.lerp(comp.rot0.x, comp.rot1.x, pEased);
      comp.mesh.rotation.y = THREE.MathUtils.lerp(comp.rot0.y, comp.rot1.y, pEased);
      comp.mesh.rotation.z = THREE.MathUtils.lerp(comp.rot0.z, comp.rot1.z, pEased);

      // Deterministic lerp for Scale
      comp.mesh.scale.lerpVectors(comp.scale0, comp.scale1, pEased);
    });

    // 3. Core internal light flares up as outer plates dismantle
    coreLight.intensity = 1.5 + pEased * 4.5;

    // 4. Subtle ambient idle rotation of the whole machine
    machineRoot.rotation.y += 0.002 * (1 - pEased * 0.5);
    machineRoot.rotation.x = Math.sin(elapsedTime * 0.4) * 0.08;

    // 5. Mouse parallax on camera and cursor light
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x = mouse.x * 1.5;
    camera.position.y = mouse.y * 1.5;
    camera.lookAt(0, 0, 0);

    cursorLight.position.set(mouse.x * 6, mouse.y * 6, 8);

    // 6. Floating shards orbit
    shards.forEach(sh => {
      sh.mesh.rotation.x += sh.rotSpeed;
      sh.mesh.rotation.y += sh.rotSpeed;
    });

    renderer.render(scene, camera);
    animId = requestAnimationFrame(render);
  }

  render();

  return () => {
    cancelAnimationFrame(animId);
    renderer.dispose();
  };
}
