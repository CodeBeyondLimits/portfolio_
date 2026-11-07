// B11. Mandatory Tagline Reveal Section
// Words transition individually from 28% muted opacity to full white on scroll
// Base curve: cubic-bezier(0.22, 1, 0.36, 1), throttled via requestAnimationFrame

export function initTaglineReveal() {
  const container = document.getElementById('tagline-reveal');
  if (!container) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = container.querySelectorAll('.tagline-word');

  if (isReduced) {
    words.forEach(w => w.classList.add('is-revealed'));
    return;
  }

  // Use IntersectionObserver with multiple thresholds or throttled rAF scroll tracking
  let isTicking = false;

  function checkWords() {
    const viewportHeight = window.innerHeight;
    const triggerY = viewportHeight * 0.78; // Trigger line at 78% down viewport

    words.forEach((word) => {
      const rect = word.getBoundingClientRect();
      if (rect.top <= triggerY) {
        word.classList.add('is-revealed');
      }
    });

    isTicking = false;
  }

  function onScroll() {
    if (!isTicking) {
      window.requestAnimationFrame(checkWords);
      isTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  checkWords(); // Initial check on load
}
