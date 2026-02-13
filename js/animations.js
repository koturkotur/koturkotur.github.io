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
   * Only considers visible cards for proper stagger calculation
   * @param {HTMLElement} grid - The project grid container
   */
  function applyStaggerDelays(grid) {
    if (!grid) return;

    const allCards = Array.from(grid.children);
    const columns = getGridColumns();

    // Get only visible cards and apply stagger based on their visible index
    const visibleCards = allCards.filter(card => {
      const style = window.getComputedStyle(card);
      return style.display !== 'none';
    });

    // Reset all cards first
    allCards.forEach(card => {
      card.style.transitionDelay = '';
    });

    // Apply stagger to visible cards only
    visibleCards.forEach((card, visibleIndex) => {
      const columnIndex = visibleIndex % columns;
      const delay = columnIndex * 0.1;
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

    // Wait for CSS to apply the hidden state before triggering animations
    setTimeout(() => {
      // Create new observer and observe visible elements
      observer = new IntersectionObserver(handleIntersection, OBSERVER_OPTIONS);

      // Observe all elements that are visible (not filtered out)
      const viewportElements = [];
      const offscreenElements = [];

      animElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none') {
          if (isInViewport(el)) {
            viewportElements.push(el);
          } else {
            offscreenElements.push(el);
            observer.observe(el);
          }
        }
      });

      // Trigger animation for viewport elements
      if (viewportElements.length > 0) {
        viewportElements.forEach(el => {
          el.classList.add('is-visible');
        });
      }
    }, 50);
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
