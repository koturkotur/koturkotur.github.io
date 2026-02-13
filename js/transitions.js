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
    var currentPath = window.location.pathname;
    var previousPath = sessionStorage.getItem('lastPagePath');

    // Only restore scroll position on RELOAD (same page).
    // When navigating from a different page, start at top.
    if (previousPath === currentPath) {
      var savedScroll = sessionStorage.getItem('scrollY_' + currentPath);
      if (savedScroll !== null) {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }
    } else {
      // Different page — start at top
      window.scrollTo(0, 0);
    }

    // Always record which page we're on now
    sessionStorage.setItem('lastPagePath', currentPath);

    // Continuously save scroll position so it's available on reload
    var scrollSaveTimer;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(function() {
        sessionStorage.setItem('scrollY_' + window.location.pathname, window.scrollY);
      }, 100);
    }, { passive: true });

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
        const currentUrl = window.location.pathname;
        const targetUrl = new URL(href, window.location.origin).pathname;

        // If it's just an anchor scroll on the same page, let it happen naturally
        if (currentUrl === targetUrl && href.includes('#')) {
          return;
        }

        // Check if this is the logo (nav-logo class) - scroll to top without reload
        const isLogo = link.classList.contains('nav-logo');
        if (currentUrl === targetUrl && isLogo) {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // If clicking a link to the SAME page (reload scenario), do a hard reload without animation
        if (currentUrl === targetUrl) {
          event.preventDefault();
          window.location.reload();
          return;
        }

        // Different page — use zoom animation
        event.preventDefault();
        document.body.classList.add(TRANSITION_CLASS);

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
