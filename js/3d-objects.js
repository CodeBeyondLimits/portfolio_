// ==========================================================================
// 3D INTERACTIVE INSTALLATIONS (About Core & Tech Constellation)
// True Cursor-Driven 3D Rotation, Natural Inertia, Depth Parallax & Mobile Touch
// ==========================================================================

export function init3DObjects() {
  initAboutCore();
  initTechConstellation();
}

// --------------------------------------------------------------------------
// 1. NEURAL TOPOLOGY: 3D Cybernetic Polyhedral Sculpture
// True Cursor-Driven 3D Rotation on X and Y axes with Inertia & Reset
// --------------------------------------------------------------------------
function initAboutCore() {
  const canvas = document.getElementById('about-canvas');
  const section = document.getElementById('about');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.clientWidth);
  let height = (canvas.height = canvas.parentElement.clientHeight);

  // Generate 3D Icosahedron vertices & edges
  const t = (1 + Math.sqrt(5)) / 2;
  const rawVertices = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1]
  ].map(v => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    const radius = 115;
    return { x: (v[0] / len) * radius, y: (v[1] / len) * radius, z: (v[2] / len) * radius };
  });

  const edges = [
    [0,11],[0,5],[0,1],[0,7],[0,10],
    [1,5],[1,7],[1,8],[1,9],[2,11],
    [2,10],[2,3],[2,4],[2,6],[3,9],
    [3,4],[3,6],[3,8],[4,9],[5,9],
    [5,11],[4,11],[6,7],[6,10],[7,8],
    [8,10],[8,3],[9,4],[10,11],[6,8]
  ];

  // Floating orbit particles around core
  const orbiters = [];
  for (let i = 0; i < 52; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = 135 + Math.random() * 45;
    orbiters.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      speed: (Math.random() - 0.5) * 0.02
    });
  }

  // Rotation State & Inertia Parameters
  let idleAngleY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let isHovered = false;

  // Track cursor across the entire About section or canvas container
  const trackTarget = section || canvas.parentElement || canvas;

  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized pointer offset (-1 to +1)
    const nx = Math.max(-1.5, Math.min(1.5, (clientX - centerX) / (rect.width * 0.8)));
    const ny = Math.max(-1.5, Math.min(1.5, (clientY - centerY) / (rect.height * 0.8)));

    // Visible 3D rotation angles in radians
    targetTiltX = -ny * 1.15; // Vertical mouse tilts X axis
    targetTiltY = nx * 1.75;  // Horizontal mouse rotates Y axis
    isHovered = true;
  }

  trackTarget.addEventListener('mousemove', (e) => {
    updatePointer(e.clientX, e.clientY);
  });

  trackTarget.addEventListener('mouseleave', () => {
    // Smoothly return towards default orientation with natural inertia
    targetTiltX = 0;
    targetTiltY = 0;
    isHovered = false;
  });

  // Touch device support
  trackTarget.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  trackTarget.addEventListener('touchend', () => {
    targetTiltX = 0;
    targetTiltY = 0;
    isHovered = false;
  });

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Continuous idle spin continues running smoothly
    idleAngleY += 0.005;

    // Smooth spring lerp for cursor rotation (natural inertia)
    currentTiltX += (targetTiltX - currentTiltX) * 0.07;
    currentTiltY += (targetTiltY - currentTiltY) * 0.07;

    const rotX = currentTiltX;
    const rotY = idleAngleY + currentTiltY;

    // Perspective depth shifting with cursor
    const fov = 340 + currentTiltX * 25;
    const camZOffset = 180 - Math.abs(currentTiltY) * 15;

    // Project and rotate icosahedron vertices
    const projected = rawVertices.map(v => {
      // Rotate around X
      let y1 = v.y * Math.cos(rotX) - v.z * Math.sin(rotX);
      let z1 = v.y * Math.sin(rotX) + v.z * Math.cos(rotX);

      // Rotate around Y
      let x2 = v.x * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -v.x * Math.sin(rotY) + z1 * Math.cos(rotY);

      const scale = fov / (fov + z2 + camZOffset);
      return {
        x: width / 2 + x2 * scale,
        y: height / 2 + y1 * scale,
        z: z2,
        scale
      };
    });

    // Glowing core
    const grad = ctx.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, 135);
    grad.addColorStop(0, 'rgba(218, 123, 147, 0.55)');
    grad.addColorStop(0.5, 'rgba(103, 232, 249, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 135, 0, Math.PI * 2);
    ctx.fill();

    // Draw structural edges with depth-dependent opacity
    edges.forEach(([i, j]) => {
      const p1 = projected[i];
      const p2 = projected[j];
      const avgZ = (p1.z + p2.z) / 2;
      const alpha = Math.max(0.18, Math.min(0.95, (avgZ + 120) / 240));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(218, 123, 147, ${alpha})`;
      ctx.lineWidth = 1.35;
      ctx.stroke();
    });

    // Draw vertices
    projected.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2 * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#67E8F9';
      ctx.fill();
    });

    // Orbiting particles reacting to 3D rotation
    orbiters.forEach(o => {
      o.x += Math.sin(rotY) * o.speed * 8;
      o.z += Math.cos(rotX) * o.speed * 8;

      let y1 = o.y * Math.cos(rotX) - o.z * Math.sin(rotX);
      let z1 = o.y * Math.sin(rotX) + o.z * Math.cos(rotX);
      let x2 = o.x * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -o.x * Math.sin(rotY) + z1 * Math.cos(rotY);

      const scale = fov / (fov + z2 + camZOffset);
      const sx = width / 2 + x2 * scale;
      const sy = height / 2 + y1 * scale;

      ctx.beginPath();
      ctx.arc(sx, sy, 1.8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(183, 148, 244, 0.75)';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

// --------------------------------------------------------------------------
// 2. CONSTELLATION OF CAPABILITIES: Interactive 3D Galaxy
// Section-wide Cursor-Driven 3D Rotation, Parallax Depth & Orbital Dynamics
// --------------------------------------------------------------------------
function initTechConstellation() {
  const canvas = document.getElementById('constellation-canvas');
  const section = document.getElementById('toolkit');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.clientWidth);
  let height = (canvas.height = canvas.parentElement.clientHeight);

  const SKILLS = [
    { name: 'Java', category: 'language', color: '#DA7B93', size: 18 },
    { name: 'Python', category: 'language', color: '#67E8F9', size: 22 },
    { name: 'C++', category: 'language', color: '#B794F4', size: 18 },
    { name: 'JavaScript', category: 'language', color: '#FB7185', size: 18 },
    { name: 'React', category: 'frontend', color: '#67E8F9', size: 20 },
    { name: 'HTML / CSS', category: 'frontend', color: '#DA7B93', size: 15 },
    { name: 'Artificial Intelligence', category: 'ai', color: '#67E8F9', size: 26 },
    { name: 'Machine Learning', category: 'ai', color: '#DA7B93', size: 24 },
    { name: 'Generative AI', category: 'ai', color: '#B794F4', size: 20 },
    { name: 'LLM Integrations', category: 'ai', color: '#67E8F9', size: 20 },
    { name: 'Algorithms & Data Structures', category: 'core', color: '#FB7185', size: 24 },
    { name: 'Git & GitHub', category: 'tools', color: '#B794F4', size: 16 },
    { name: 'VS Code', category: 'tools', color: '#DA7B93', size: 15 },
    { name: 'Creative WebGL / 3D', category: 'frontend', color: '#67E8F9', size: 18 },
    { name: 'Automation Workflows', category: 'ai', color: '#DA7B93', size: 16 }
  ];

  // Distribute nodes in a 3D spherical galaxy with individual orbital characteristics
  const nodes = SKILLS.map((skill, idx) => {
    const phi = Math.acos(-1 + (2 * idx) / SKILLS.length);
    const theta = Math.sqrt(SKILLS.length * Math.PI) * phi;
    const rad = 175 + (idx % 3) * 38;

    return {
      name: skill.name,
      category: skill.category,
      color: skill.color,
      baseRadius: skill.size,
      baseX: rad * Math.cos(theta) * Math.sin(phi),
      baseY: rad * Math.sin(theta) * Math.sin(phi),
      baseZ: rad * Math.cos(phi),
      orbitPhase: Math.random() * Math.PI * 2,
      orbitSpeed: 0.008 + (idx % 4) * 0.003,
      rad
    };
  });

  // Background deep space ambient star dust (depth parallax)
  const ambientStars = [];
  for (let s = 0; s < 50; s++) {
    ambientStars.push({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 500,
      z: (Math.random() - 0.5) * 400,
      alpha: 0.2 + Math.random() * 0.5,
      size: 0.8 + Math.random() * 1.5
    });
  }

  // Interactive Galaxy State & Inertia Parameters
  let idleSpin = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let isPointerActive = false;

  const trackTarget = section || canvas.parentElement || canvas;

  function updateGalaxyPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const nx = (clientX - centerX) / (rect.width * 0.7);
    const ny = (clientY - centerY) / (rect.height * 0.7);

    // Visible 3D rotation angles in radians across section
    targetRotY = nx * 1.85;  // Horizontal mouse rotates galaxy around Y
    targetRotX = -ny * 1.15; // Vertical mouse tilts galaxy on X
    isPointerActive = true;
  }

  trackTarget.addEventListener('mousemove', (e) => {
    updateGalaxyPointer(e.clientX, e.clientY);
  });

  trackTarget.addEventListener('mouseleave', () => {
    targetRotX = 0;
    targetRotY = 0;
    isPointerActive = false;
  });

  // Touch device support
  trackTarget.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updateGalaxyPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  trackTarget.addEventListener('touchend', () => {
    targetRotX = 0;
    targetRotY = 0;
    isPointerActive = false;
  });

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Continuous smooth idle rotation
    idleSpin += 0.0025;

    // Smooth spring interpolation for natural inertia
    currentRotX += (targetRotX - currentRotX) * 0.055;
    currentRotY += (targetRotY - currentRotY) * 0.055;

    const rotX = currentRotX;
    const rotY = idleSpin + currentRotY;

    // Perspective depth & Parallax camera offset
    const fov = 420;
    const camOffsetX = currentRotY * 18;
    const camOffsetY = currentRotX * 14;

    // Render Ambient Star Dust with Parallax
    ambientStars.forEach(star => {
      let y1 = star.y * Math.cos(rotX * 0.5) - star.z * Math.sin(rotX * 0.5);
      let z1 = star.y * Math.sin(rotX * 0.5) + star.z * Math.cos(rotX * 0.5);
      let x2 = star.x * Math.cos(rotY * 0.5) + z1 * Math.sin(rotY * 0.5);
      let z2 = -star.x * Math.sin(rotY * 0.5) + z1 * Math.cos(rotY * 0.5);

      const scale = fov / (fov + z2 + 250);
      const sx = width / 2 + (x2 + camOffsetX) * scale;
      const sy = height / 2 + (y1 + camOffsetY) * scale;

      if (sx > 0 && sx < width && sy > 0 && sy < height) {
        ctx.beginPath();
        ctx.arc(sx, sy, star.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(183, 148, 244, ${star.alpha * scale})`;
        ctx.fill();
      }
    });

    // Update and project skills nodes
    const projected = nodes.map(n => {
      // Individual subtle orbital motion
      n.orbitPhase += n.orbitSpeed;
      const ox = n.baseX + Math.sin(n.orbitPhase) * 12;
      const oy = n.baseY + Math.cos(n.orbitPhase) * 10;
      const oz = n.baseZ + Math.sin(n.orbitPhase * 0.8) * 8;

      let y1 = oy * Math.cos(rotX) - oz * Math.sin(rotX);
      let z1 = oy * Math.sin(rotX) + oz * Math.cos(rotX);
      let x2 = ox * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -ox * Math.sin(rotY) + z1 * Math.cos(rotY);

      const scale = fov / (fov + z2 + 210);

      return {
        ...n,
        sx: width / 2 + (x2 + camOffsetX) * scale,
        sy: height / 2 + (y1 + camOffsetY) * scale,
        scale,
        depth: z2
      };
    });

    // Draw connecting energy lines
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const p1 = projected[i];
        const p2 = projected[j];
        const dx = p1.sx - p2.sx;
        const dy = p1.sy - p2.sy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 135) {
          const alpha = (1 - dist / 135) * 0.32;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = `rgba(103, 232, 249, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Sort nodes by depth for correct z-index
    projected.sort((a, b) => a.depth - b.depth);

    // Draw nodes and titles
    projected.forEach(p => {
      const radius = Math.max(3.5, p.baseRadius * p.scale * 0.36);

      // Node Outer Glow
      const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, radius * 3.2);
      glow.addColorStop(0, p.color);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, radius * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Node Solid Core
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Label with depth scale
      const fontSize = Math.max(10, Math.floor(13 * p.scale));
      ctx.font = `600 ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = p.scale > 0.8 ? '#FFFFFF' : 'rgba(243, 246, 248, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, p.sx, p.sy + radius + fontSize + 2);
    });

    requestAnimationFrame(render);
  }

  render();
}
