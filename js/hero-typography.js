// ==========================================================================
// HERO MASSIVE TYPOGRAPHY INTERACTION ENGINE — "HARSHITH"
// Perspective tilting, 3D individual letter depth, cursor lighting dispersion
// ==========================================================================

export function initHeroTypography() {
  const container = document.querySelector('.hero-identity-container');
  const letters = document.querySelectorAll('.hero-letter');
  if (!container || !letters.length) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    targetX = (e.clientX - cx) / (window.innerWidth / 2);
    targetY = (e.clientY - cy) / (window.innerHeight / 2);
  });

  // RAF loop for smooth perspective tilt
  let animId;
  function updateTypography() {
    mouseX += (targetX - mouseX) * 0.08;
    mouseY += (targetY - mouseY) * 0.08;

    const tiltX = -mouseY * 12; // deg
    const tiltY = mouseX * 16;  // deg

    container.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

    // Individual letter depth staggered by index from center
    letters.forEach((letter, idx) => {
      const centerDist = idx - (letters.length - 1) / 2;
      const letterZ = Math.abs(centerDist) * -4 + Math.sin(idx * 0.8 + mouseX * 2) * 8;
      const letterRotY = centerDist * mouseX * 4;

      letter.style.transform = `translateZ(${letterZ}px) rotateY(${letterRotY}deg)`;
    });

    animId = requestAnimationFrame(updateTypography);
  }
  updateTypography();

  return () => cancelAnimationFrame(animId);
}
