// ==========================================================================
// MY JOURNEY: INTERACTIVE NEURAL TIMELINE
// Scroll-linked node illumination and progress tracking
// ==========================================================================

export function initJourney() {
  const nodes = document.querySelectorAll('.journey-node');
  if (!nodes.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-active-step');
        const dot = entry.target.querySelector('.journey-dot');
        if (dot) {
          dot.style.transform = 'scale(1.35)';
          dot.style.boxShadow = '0 0 16px #DA7B93';
        }
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '0px 0px -60px 0px'
  });

  nodes.forEach(node => observer.observe(node));
}
