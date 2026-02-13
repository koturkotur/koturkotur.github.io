/**
 * Page Transitions Module
 * Handles zoom in/out animations when navigating between pages.
 */
(function() {
  'use strict';

  const TRANSITION_DURATION = 600; // Match CSS transition time
  const TRANSITION_CLASS = 'page-transitioning';

  /**
   * Initializes page transitions
   */
  function init() {
    // 1. Zoom in the page on load
    document.addEventListener('DOMContentLoaded', () => {
      // Small delay to ensure browser has started rendering the initial state
      setTimeout(() => {
        document.body.classList.remove(TRANSITION_CLASS);
      }, 50);
    });

    // 2. Intercept internal link clicks to zoom out
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      
      // Ignore:
      // - Empty links or anchors
      // - External links
      // - Links opening in new tabs
      // - File downloads (not likely here but good practice)
      if (!href || 
          href.startsWith('#') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') ||
          link.getAttribute('target') === '_blank' ||
          link.hasAttribute('download')) {
        return;
      }

      // Check if it's an internal navigation
      const isInternal = href.startsWith('/') || 
                         href.startsWith('.') || 
                         !href.includes('://');

      if (isInternal) {
        // Prevent default navigation
        event.preventDefault();

        // Add transition class
        document.body.classList.add(TRANSITION_CLASS);

        // Navigate after animation completes
        setTimeout(() => {
          window.location.href = href;
        }, TRANSITION_DURATION);
      }
    });

    // 3. Handle back/forward buttons (popstate)
    // Ensures the page is visible if user clicks "Back"
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        document.body.classList.remove(TRANSITION_CLASS);
      }
    });
  }

  // Initialize immediately
  init();

})();
