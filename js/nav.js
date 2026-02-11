/**
 * Navigation Module
 * Handles mobile menu toggle, scroll behavior, and accessibility.
 * @module nav
 */
(function() {
  'use strict';

  // Configuration constants
  const SCROLL_THRESHOLD = 100; // px - when to add .nav-scrolled
  const HIDE_THRESHOLD = 50; // px - minimum scroll to trigger hide/show
  const SCROLLED_CLASS = 'nav-scrolled';
  const HIDDEN_CLASS = 'nav-hidden';
  const ACTIVE_CLASS = 'active';

  // DOM element references
  let menuBtn = null;
  let mobileMenu = null;
  let navHeader = null;
  let mobileMenuLinks = [];

  // State tracking
  let lastScrollY = 0;
  let ticking = false;

  /**
   * Cache DOM references
   */
  function cacheElements() {
    menuBtn = document.getElementById('nav-menu-btn');
    mobileMenu = document.getElementById('mobile-menu');
    navHeader = document.getElementById('nav-header');
    mobileMenuLinks = Array.from(document.querySelectorAll('.mobile-menu-link'));
  }

  /**
   * Checks if mobile menu is currently open
   * @returns {boolean}
   */
  function isMenuOpen() {
    return menuBtn && menuBtn.classList.contains(ACTIVE_CLASS);
  }

  /**
   * Opens the mobile menu
   */
  function openMenu() {
    if (!menuBtn || !mobileMenu) return;

    menuBtn.classList.add(ACTIVE_CLASS);
    mobileMenu.classList.add(ACTIVE_CLASS);

    // Update accessibility attributes
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Closes the mobile menu
   */
  function closeMenu() {
    if (!menuBtn || !mobileMenu) return;

    menuBtn.classList.remove(ACTIVE_CLASS);
    mobileMenu.classList.remove(ACTIVE_CLASS);

    // Update accessibility attributes
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Toggles the mobile menu open/closed
   */
  function toggleMenu() {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /**
   * Handles scroll behavior for the navigation
   * Adds/removes .nav-scrolled based on scroll position
   * Optionally hides/shows nav based on scroll direction
   */
  function handleScroll() {
    const currentScrollY = window.scrollY;

    // Add/remove scrolled class based on threshold
    if (navHeader) {
      if (currentScrollY > SCROLL_THRESHOLD) {
        navHeader.classList.add(SCROLLED_CLASS);
      } else {
        navHeader.classList.remove(SCROLLED_CLASS);
      }

      // Hide/show nav based on scroll direction (optional enhancement)
      // Only trigger after scrolling past the hide threshold
      if (Math.abs(currentScrollY - lastScrollY) > HIDE_THRESHOLD) {
        if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
          // Scrolling down - hide nav
          navHeader.classList.add(HIDDEN_CLASS);
        } else {
          // Scrolling up - show nav
          navHeader.classList.remove(HIDDEN_CLASS);
        }
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  /**
   * Request animation frame wrapper for smooth scroll handling
   */
  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }

  /**
   * Attaches event handlers for mobile menu
   */
  function attachMenuHandlers() {
    if (!menuBtn) {
      console.warn('Menu button not found (#nav-menu-btn)');
      return;
    }

    if (!mobileMenu) {
      console.warn('Mobile menu not found (#mobile-menu)');
      return;
    }

    // Toggle menu on hamburger click
    menuBtn.addEventListener('click', (event) => {
      event.preventDefault();
      toggleMenu();
    });

    // Close menu when a mobile menu link is clicked
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isMenuOpen()) {
        closeMenu();
        // Return focus to menu button
        menuBtn.focus();
      }
    });

    // Set initial aria states
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  /**
   * Attaches scroll event handler with throttling
   */
  function attachScrollHandler() {
    if (!navHeader) {
      console.warn('Nav header not found (#nav-header)');
      return;
    }

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', requestTick, { passive: true });

    // Initial check
    handleScroll();
  }

  /**
   * Initializes the navigation module
   */
  function init() {
    cacheElements();
    attachMenuHandlers();
    attachScrollHandler();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
