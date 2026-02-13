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
    // Intercept internal link clicks to zoom out
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      
      // Ignore:
      // - Empty links or anchors
      // - External links
      // - Links opening in new tabs
      // - Same-page anchor links (e.g., #about)
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
        // Only trigger if we're actually going to a different URL
        const currentUrl = window.location.pathname;
        const targetUrl = new URL(href, window.location.origin).pathname;
        
        if (currentUrl === targetUrl && href.includes('#')) {
          return; // Just an anchor scroll
        }

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

    // Handle back/forward buttons (popstate)
    // Ensures the page is visible if user clicks "Back" or returns via history
    window.addEventListener('pageshow', (event) => {
      // Always remove the class on show to ensure page is visible
      document.body.classList.remove(TRANSITION_CLASS);
    });
  }

  // Initialize immediately
  init();

})();
