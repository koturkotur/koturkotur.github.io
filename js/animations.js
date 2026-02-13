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
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let observer = null;

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
   * @param {HTMLElement} grid - The project grid container
   */
  function applyStaggerDelays(grid) {
    if (!grid) return;

    const cards = Array.from(grid.children);
    const columns = getGridColumns();

    cards.forEach((card, index) => {
      // Calculate column index (position within the row)
      const columnIndex = index % columns;
      // Calculate delay: 0.1s per column position
      const delay = columnIndex * 0.1;

      // Remove any existing delay classes
      for (let i = 1; i <= 8; i++) {
        card.classList.remove(`anim-delay-${i}`);
      }

      // Apply inline style for dynamic delay
      card.style.transitionDelay = `${delay}s`;
    });
  }

  /**
   * Handle intersection changes - add is-visible class when elements enter viewport
   * @param {IntersectionObserverEntry[]} entries
   */
  function handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Unobserve after animation triggers (animate once only)
        observer.unobserve(entry.target);
      }
    });
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

    // Create IntersectionObserver
    observer = new IntersectionObserver(handleIntersection, OBSERVER_OPTIONS);

    // Find all animation elements
    const animElements = document.querySelectorAll(ANIMATION_CLASSES.map(cls => `.${cls}`).join(', '));

    // Observe all animation elements (including project cards)
    animElements.forEach(el => {
      observer.observe(el);
    });

    // Apply stagger delays to project grid cards
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      applyStaggerDelays(projectGrid);
    }
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

    // Remove is-visible from all animation elements to reset them
    const animElements = document.querySelectorAll(ANIMATION_CLASSES.map(cls => `.${cls}`).join(', '));
    animElements.forEach(el => {
      el.classList.remove('is-visible');
    });

    // Re-apply stagger delays to project grid cards
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      applyStaggerDelays(projectGrid);
    }

    // Create new observer and observe visible elements
    observer = new IntersectionObserver(handleIntersection, OBSERVER_OPTIONS);

    // Observe all elements that are visible (not filtered out)
    animElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display !== 'none') {
        observer.observe(el);
      }
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
