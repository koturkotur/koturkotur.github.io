/**
 * Scroll-triggered animation system using IntersectionObserver
 * Adds .is-visible class to elements with .anim-* classes when they enter viewport
 */

(function () {
  'use strict';

  // Configuration
  const ANIMATION_CLASSES = [
    'anim-fade-up',
    'anim-fade-in',
    'anim-fade-down',
    'anim-scale-in',
    'anim-slide-right',
    'anim-slide-left'
  ];

  const OBSERVER_OPTIONS = {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
  };

  const STAGGER_STEP = 0.08; // seconds
  const STAGGER_RESET_MS = 200;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let observer = null;
  let staggerIndex = 0;
  let staggerResetTimer = null;

  /**
   * Calculate number of grid columns based on viewport width
   * @returns {number} Number of columns (1, 2, or 3)
   */
  function getGridColumns() {
    const width = window.innerWidth;
    if (width >= 1024) return 3; // Desktop
    if (width >= 768) return 2;  // Tablet
    return 1;                   // Mobile
  }

  /**
   * Apply stagger delays to project cards based on their position in the grid
   * Only considers visible cards for proper stagger calculation
   * @param {HTMLElement} grid - The project grid container
   */
  function applyStaggerDelays(grid) {
    if (!grid) return;

    const allCards = Array.from(grid.children);
    allCards.forEach(card => {
      card.style.transitionDelay = '';
    });
  }

  /**
   * Handle intersection changes - add is-visible class when elements enter viewport
   * @param {IntersectionObserverEntry[]} entries
   */
  function handleIntersection(entries) {
    const toShow = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
    if (!toShow.length) return;

    // Keep order based on DOM position
    toShow.sort((a, b) => {
      if (a === b) return 0;
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    toShow.forEach(el => {
      el.style.transitionDelay = `${staggerIndex * STAGGER_STEP}s`;
      staggerIndex += 1;
      el.classList.add('is-visible');
      observer.unobserve(el);
    });

    clearTimeout(staggerResetTimer);
    staggerResetTimer = setTimeout(() => {
      staggerIndex = 0;
    }, STAGGER_RESET_MS);
  }

  /**
   * Initialize the animation system
   */
  function init() {
    // If user prefers reduced motion, make all elements visible immediately
    if (prefersReducedMotion) {
      const animElements = document.querySelectorAll(ANIMATION_CLASSES.map(cls => `.${cls}`).join(', '));
      animElements.forEach(el => {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Find all animation elements
    const animElements = document.querySelectorAll(ANIMATION_CLASSES.map(cls => `.${cls}`).join(', '));

    // Handle scroll position restoration
    // If we're at the very top, ensure we stay there
    if (window.scrollY < 20) {
      window.scrollTo(0, 0);
    }

    // Create IntersectionObserver
    observer = new IntersectionObserver(handleIntersection, OBSERVER_OPTIONS);

    // Observe all animation elements
    animElements.forEach(el => {
      observer.observe(el);
    });

      // Reset transition delays on cards
      const projectGrid = document.querySelector('.project-grid');
      if (projectGrid) {
        applyStaggerDelays(projectGrid);
      }
  }

  /**
   * Check if an element is currently visible in the viewport
   * @param {HTMLElement} el - The element to check
   * @returns {boolean} True if element is in viewport
   */
  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right > 0
    );
  }

  /**
   * Reinitialize animations - useful when filter changes or new content is added
   * Resets stagger delays and re-observes visible elements
   */
  function reinitialize() {
    // If reduced motion, nothing to do
    if (prefersReducedMotion) return;

    // Disconnect existing observer
    if (observer) {
      observer.disconnect();
    }

    // Remove is-visible and disable transitions so reset is instant
    const animElements = document.querySelectorAll(ANIMATION_CLASSES.map(cls => `.${cls}`).join(', '));
    animElements.forEach(el => {
      el.style.transition = 'none';
      el.classList.remove('is-visible');
    });

    // Reset transition delays to avoid stale values
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      applyStaggerDelays(projectGrid);
    }

    // Force the browser to apply the hidden state immediately
    requestAnimationFrame(() => {
      // Re-enable transitions
      animElements.forEach(el => {
        el.style.transition = '';
      });

      // Create new observer
      observer = new IntersectionObserver(handleIntersection, OBSERVER_OPTIONS);

      // Check each visible element
      requestAnimationFrame(() => {
        const visibleNow = [];
        animElements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none') {
            if (isInViewport(el)) {
              visibleNow.push(el);
            } else {
              observer.observe(el);
            }
          }
        });

        visibleNow.sort((a, b) => {
          if (a === b) return 0;
          return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });

        let localIndex = 0;
        visibleNow.forEach(el => {
          el.style.transitionDelay = `${localIndex * STAGGER_STEP}s`;
          localIndex += 1;
          el.classList.add('is-visible');
        });
      });
    });
  }

  /**
   * Handle window resize - update stagger delays if grid columns change
   */
  function handleResize() {
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      applyStaggerDelays(projectGrid);
    }
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Update stagger delays on window resize (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 150);
  });

  // Listen for custom filter change event
  document.addEventListener('filterChanged', reinitialize);

  // Export reinitialize function globally for filter system to call
  window.AnimationSystem = {
    reinitialize,
    applyStaggerDelays
  };

})();
