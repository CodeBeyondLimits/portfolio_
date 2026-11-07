// ==========================================================================
// LENIS SMOOTH SCROLL & GSAP SCROLLTRIGGER SYNCHRONIZATION
// Butter-smooth momentum, reverse scroll handling, zero snapping
// ==========================================================================

export function initSmoothScroll() {
  if (typeof Lenis === 'undefined') {
    console.warn('Lenis not available, falling back to standard scroll loop');
    return null;
  }

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    return null; // Respect reduced motion preferences
  }

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.8,
    smoothTouch: false
  });

  // Synchronize with GSAP ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    // Standalone RAF Loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Handle in-page anchor clicks with Lenis scrollTo
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -20, duration: 1.4 });
      }
    });
  });

  return lenis;
}
