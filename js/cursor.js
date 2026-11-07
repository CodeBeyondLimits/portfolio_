// ==========================================================================
// CUSTOM MAGNETIC CURSOR CONTROLLER
// Responsive dot + aura with lerp trailing, magnetic attraction, and section states
// ==========================================================================

export function initCustomCursor() {
  // Disable on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';

  const aura = document.createElement('div');
  aura.className = 'custom-cursor-aura';

  document.body.appendChild(dot);
  document.body.appendChild(aura);

  const mouse = { x: -100, y: -100 };
  const auraPos = { x: -100, y: -100 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
  });

  // Smooth lerp trailing for the aura
  let animId;
  function updateAura() {
    auraPos.x += (mouse.x - auraPos.x) * 0.16;
    auraPos.y += (mouse.y - auraPos.y) * 0.16;

    aura.style.transform = `translate3d(${auraPos.x}px, ${auraPos.y}px, 0) translate(-50%, -50%)`;
    animId = requestAnimationFrame(updateAura);
  }
  updateAura();

  // Interactive Hover States
  const interactives = document.querySelectorAll('a, button, input, textarea, select, .stage-dot, .journey-node, .project-item');

  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // Re-observe dynamic elements
  const observer = new MutationObserver(() => {
    document.querySelectorAll('a, button, input, textarea, select, .stage-dot').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    cancelAnimationFrame(animId);
    dot.remove();
    aura.remove();
  };
}
