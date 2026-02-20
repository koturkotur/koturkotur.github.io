/**
 * Page Transitions Module
 * Handles zoom in/out animations when navigating between pages.
 */
(function() {
  'use strict';

  const TRANSITION_DURATION = 0;
  const TRANSITION_CLASS = 'page-transitioning';

  /**
   * Initializes page transitions
   */
  function init() {
    var currentPath = window.location.pathname;
    var previousPath = sessionStorage.getItem('lastPagePath');
    var navTriggered = sessionStorage.getItem('navTriggered') === '1';
    var forceTopPath = sessionStorage.getItem('forceTopOnReload');

    // If logo click flagged a forced top reload for this page
    if (forceTopPath === currentPath) {
      window.scrollTo(0, 0);
      sessionStorage.setItem('scrollY_' + currentPath, '0');
      sessionStorage.removeItem('forceTopOnReload');
      sessionStorage.removeItem('navTriggered');
    } else if (navTriggered) {
      // If navigation was triggered by clicking a link, always start at top
      window.scrollTo(0, 0);
      sessionStorage.removeItem('navTriggered');
    } else if (previousPath === currentPath) {
      // Only restore scroll position on reload (same page).
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

        // If clicking a link to the SAME page (reload scenario), do a hard reload without animation
        if (currentUrl === targetUrl) {
          event.preventDefault();
          if (link.classList.contains('nav-logo') && targetUrl === '/') {
            sessionStorage.setItem('resetFilter', '1');
            sessionStorage.setItem('scrollY_' + currentUrl, '0');
            sessionStorage.setItem('forceTopOnReload', currentUrl);
          }
          sessionStorage.setItem('navTriggered', '1');
          window.location.reload();
          return;
        }

        // Different page — simple navigation (no zoom)
        event.preventDefault();
        sessionStorage.setItem('navTriggered', '1');
        if (link.classList.contains('nav-logo') && targetUrl === '/') {
          sessionStorage.setItem('resetFilter', '1');
          sessionStorage.setItem('scrollY_' + targetUrl, '0');
          sessionStorage.setItem('forceTopOnReload', targetUrl);
        }
        window.location.href = href;
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
