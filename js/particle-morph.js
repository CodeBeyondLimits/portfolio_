// ==========================================================================
// 3D CONTINUOUS PARTICLE TYPOGRAPHY MORPH SIMULATION
// Phased morphing: "WELCOME" -> "TO THE" -> "WORLD OF" -> "HARSHITH"
// Organic 3D physics, curl dispersion, magnetic "COME ALONG →" button
// ==========================================================================

export function initParticleMorph() {
  const canvas = document.getElementById('particle-canvas');
  const comeAlongBtn = document.getElementById('come-along-btn');
  const stageDots = document.querySelectorAll('.stage-dot');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const PHRASES = ['WELCOME', 'TO THE', 'WORLD OF', 'HARSHITH'];
  let currentPhase = 0;
  let isTransitioning = false;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Color palette for glowing particles
  const COLORS = [
    'rgba(218, 123, 147, ', // #DA7B93 Vibrant dusty pink
    'rgba(103, 232, 249, ', // #67E8F9 Icy cyan
    'rgba(183, 148, 244, ', // #B794F4 Electric lavender
    'rgba(243, 246, 248, '  // #F3F6F8 Pure white
  ];

  const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 450), 3200);
  const particles = [];

  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    radius: 120,
    isHovered: false
  };

  // Precompute target point clouds for each phrase
  const targets = {};
  PHRASES.forEach(phrase => {
    targets[phrase] = generateTextCoordinates(phrase, width, height, PARTICLE_COUNT);
  });

  // Particle Class
  class Particle {
    constructor(i) {
      this.index = i;
      // Start in a loose 3D sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 200 + Math.random() * 300;

      this.x = rad * Math.sin(phi) * Math.cos(theta);
      this.y = rad * Math.sin(phi) * Math.sin(theta);
      this.z = rad * Math.cos(phi);

      this.tx = 0;
      this.ty = 0;
      this.tz = 0;

      this.vx = 0;
      this.vy = 0;
      this.vz = 0;

      this.baseSize = Math.random() * 2.2 + 1.2;
      this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.4 + 0.6;
      this.noise = Math.random() * 100;
    }

    setTarget(targetPoint) {
      if (targetPoint) {
        this.tx = targetPoint.x;
        this.ty = targetPoint.y;
        this.tz = targetPoint.z;
      } else {
        // Disperse outwards
        this.tx = (Math.random() - 0.5) * width * 1.5;
        this.ty = (Math.random() - 0.5) * height * 1.5;
        this.tz = (Math.random() - 0.5) * 600;
      }
    }

    explode() {
      const angle = Math.random() * Math.PI * 2;
      const force = Math.random() * 35 + 15;
      this.vx += Math.cos(angle) * force;
      this.vy += Math.sin(angle) * force;
      this.vz += (Math.random() - 0.5) * force;
    }

    update() {
      this.noise += 0.02;

      // Spring towards target position
      const dx = this.tx - this.x;
      const dy = this.ty - this.y;
      const dz = this.tz - this.z;

      const spring = 0.045;
      const friction = 0.88;

      this.vx += dx * spring;
      this.vy += dy * spring;
      this.vz += dz * spring;

      // Ambient organic drift
      this.vx += Math.sin(this.noise) * 0.15;
      this.vy += Math.cos(this.noise) * 0.15;

      // Mouse repulsion in screen projection
      if (mouse.isHovered) {
        const mdx = (this.x + width / 2) - mouse.x;
        const mdy = (this.y + height / 2) - mouse.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (dist < mouse.radius && dist > 0) {
          const repelForce = (mouse.radius - dist) / mouse.radius;
          this.vx += (mdx / dist) * repelForce * 8;
          this.vy += (mdy / dist) * repelForce * 8;
        }
      }

      this.vx *= friction;
      this.vy *= friction;
      this.vz *= friction;

      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;
    }

    draw(ctx, fov, cameraParallaxX, cameraParallaxY) {
      const camZ = 500;
      const pz = this.z + camZ;
      if (pz <= 10) return;

      const scale = fov / pz;
      const sx = width / 2 + (this.x + cameraParallaxX) * scale;
      const sy = height / 2 + (this.y + cameraParallaxY) * scale;
      const size = Math.max(0.6, this.baseSize * scale);

      if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) return;

      const depthAlpha = Math.min(1, Math.max(0.15, scale * this.alpha));

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.colorBase}${depthAlpha})`;
      ctx.fill();
    }
  }

  // Initialize Particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle(i);
    particles.push(p);
  }

  // Assign initial target (WELCOME)
  assignTargets(PHRASES[0]);

  function assignTargets(phrase) {
    const coords = targets[phrase] || [];
    for (let i = 0; i < particles.length; i++) {
      const targetPoint = coords[i % coords.length];
      particles[i].setTarget(targetPoint);
    }
  }

  function triggerPhase(phaseIndex) {
    if (phaseIndex < 0 || phaseIndex >= PHRASES.length) return;
    currentPhase = phaseIndex;

    // Update dots
    stageDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentPhase);
    });

    // Particle explosion impulse before reforming
    particles.forEach(p => p.explode());
    assignTargets(PHRASES[currentPhase]);

    // Handle "COME ALONG →" button reveal
    if (comeAlongBtn) {
      if (currentPhase === 3) {
        animateButtonIn();
      } else {
        comeAlongBtn.classList.remove('is-revealed');
      }
    }
  }

  function animateButtonIn() {
    if (!comeAlongBtn) return;
    // Fly in from random position
    const randomAngle = Math.random() * Math.PI * 2;
    const distance = 400;
    const startX = Math.cos(randomAngle) * distance;
    const startY = Math.sin(randomAngle) * distance + 120;
    const startRot = (Math.random() - 0.5) * 45;

    comeAlongBtn.style.transform = `translate3d(${startX}px, ${startY}px, 0) rotate(${startRot}deg) scale(0.6)`;
    comeAlongBtn.classList.add('is-revealed');

    // Smoothly settle into place on base curve
    requestAnimationFrame(() => {
      comeAlongBtn.style.transition = 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease';
      comeAlongBtn.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
    });
  }

  // Magnetic Button Behavior
  if (comeAlongBtn) {
    window.addEventListener('mousemove', (e) => {
      if (currentPhase !== 3) return;
      const rect = comeAlongBtn.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;
      const distX = e.clientX - btnX;
      const distY = e.clientY - btnY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < 120) {
        const pullX = distX * 0.35;
        const pullY = distY * 0.35;
        comeAlongBtn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.04)`;
      } else {
        comeAlongBtn.style.transform = 'translate3d(0, 0, 0) scale(1)';
      }
    });

    comeAlongBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Scatter particles outward
      particles.forEach(p => {
        p.vx += (Math.random() - 0.5) * 60;
        p.vy += (Math.random() - 0.5) * 60;
        p.vz += (Math.random() - 0.5) * 80;
      });

      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Dots click handler
  stageDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const phase = parseInt(dot.getAttribute('data-phase'), 10);
      triggerPhase(phase);
    });
  });

  // Scroll-linked morphing inside Hero viewport
  let scrollAccumulator = 0;
  window.addEventListener('wheel', (e) => {
    const heroRect = canvas.parentElement.getBoundingClientRect();
    if (heroRect.bottom <= 100) return; // Only control when hero is in view

    // If on last phase and scrolling down, allow normal page scroll
    if (currentPhase === 3 && e.deltaY > 0) return;
    // If on first phase and scrolling up, allow normal page scroll
    if (currentPhase === 0 && e.deltaY < 0) return;

    scrollAccumulator += e.deltaY;
    if (scrollAccumulator > 140) {
      scrollAccumulator = 0;
      if (currentPhase < PHRASES.length - 1) {
        triggerPhase(currentPhase + 1);
      }
    } else if (scrollAccumulator < -140) {
      scrollAccumulator = 0;
      if (currentPhase > 0) {
        triggerPhase(currentPhase - 1);
      }
    }
  }, { passive: true });

  // Mouse & Resize Handlers
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    PHRASES.forEach(phrase => {
      targets[phrase] = generateTextCoordinates(phrase, width, height, PARTICLE_COUNT);
    });
    assignTargets(PHRASES[currentPhase]);
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isHovered = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isHovered = false;
  });

  // Touch Support
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
      mouse.isHovered = true;
    }
  }, { passive: true });

  // Animation Loop
  let animId;
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse coordinates
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    const cameraParallaxX = (mouse.x - width / 2) * -0.06;
    const cameraParallaxY = (mouse.y - height / 2) * -0.06;

    const fov = 420;

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(ctx, fov, cameraParallaxX, cameraParallaxY);
    }

    animId = requestAnimationFrame(render);
  }

  render();

  // Automatic opening cinematic sequence if user doesn't interact in first 3 seconds
  setTimeout(() => {
    if (currentPhase === 0) {
      triggerPhase(1);
      setTimeout(() => {
        if (currentPhase === 1) triggerPhase(2);
        setTimeout(() => {
          if (currentPhase === 2) triggerPhase(3);
        }, 1600);
      }, 1600);
    }
  }, 2200);

  return () => cancelAnimationFrame(animId);
}

// Rasterize font and extract centered 3D coordinates
function generateTextCoordinates(text, screenWidth, screenHeight, maxPoints) {
  const offscreen = document.createElement('canvas');
  const octx = offscreen.getContext('2d');

  // Dynamic font sizing based on viewport
  let fontSize = Math.min(screenWidth * 0.16, 140);
  if (text.length > 7) fontSize *= 0.72; // scale for "HARSHITH" and "WORLD OF"

  offscreen.width = screenWidth;
  offscreen.height = screenHeight;

  octx.fillStyle = '#FFFFFF';
  octx.font = `700 ${fontSize}px "Geist", sans-serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillText(text, screenWidth / 2, screenHeight / 2 - 20);

  const imgData = octx.getImageData(0, 0, screenWidth, screenHeight).data;
  const rawPoints = [];
  const step = Math.max(3, Math.floor(Math.sqrt((screenWidth * screenHeight) / 70000)));

  for (let y = 0; y < screenHeight; y += step) {
    for (let x = 0; x < screenWidth; x += step) {
      const idx = (y * screenWidth + x) * 4;
      if (imgData[idx + 3] > 140) {
        rawPoints.push({
          x: x - screenWidth / 2,
          y: y - screenHeight / 2,
          z: (Math.random() - 0.5) * 80 // 3D depth layer
        });
      }
    }
  }

  // Shuffle points for organic distribution
  for (let i = rawPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rawPoints[i], rawPoints[j]] = [rawPoints[j], rawPoints[i]];
  }

  return rawPoints;
}
