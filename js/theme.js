/**
 * Theme Toggle Module
 * Handles dark/light theme switching with localStorage persistence and system preference detection.
 * @module theme
 */
(function() {
  'use strict';

  // Configuration constants
  const STORAGE_KEY = 'theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';
  const TRANSITION_DURATION = 300; // ms
  const TRANSITION_CLASS = 'theme-transitioning';

  // DOM element references
  const htmlElement = document.documentElement;
  const bodyElement = document.body;

  /**
   * Gets the initial theme preference
   * Priority: localStorage > system preference > default (dark)
   * @returns {string} The theme to apply ('dark' or 'light')
   */
  function getInitialTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme && (savedTheme === THEME_DARK || savedTheme === THEME_LIGHT)) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return THEME_LIGHT;
    }

    // Default to dark
    return THEME_DARK;
  }

  /**
   * Applies the theme to the document
   * @param {string} theme - The theme to apply ('dark' or 'light')
   */
  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
  }

  /**
   * Updates the toggle button's accessibility attributes
   * @param {HTMLElement} button - The theme toggle button
   * @param {string} currentTheme - The currently active theme
   */
  function updateButtonAriaLabel(button, currentTheme) {
    const nextTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  }

  /**
   * Handles the theme transition animation
   * Adds a temporary class to body for CSS transitions, then removes it
   */
  function triggerTransition() {
    bodyElement.classList.add(TRANSITION_CLASS);

    setTimeout(() => {
      bodyElement.classList.remove(TRANSITION_CLASS);
    }, TRANSITION_DURATION);
  }

  /**
   * Toggles between dark and light themes
   * @param {HTMLElement} button - The theme toggle button
   */
  function toggleTheme(button) {
    const currentTheme = htmlElement.getAttribute('data-theme') || THEME_DARK;
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

    // Apply the new theme
    applyTheme(newTheme);

    // Save preference to localStorage
    localStorage.setItem(STORAGE_KEY, newTheme);

    // Trigger transition animation
    triggerTransition();

    // Update button accessibility
    updateButtonAriaLabel(button, newTheme);
  }

  /**
   * Handles system preference changes
   * Only updates if user hasn't manually set a preference (no localStorage override)
   * @param {MediaQueryListEvent} event - The media query change event
   * @param {HTMLElement} button - The theme toggle button
   */
  function handleSystemPreferenceChange(event, button) {
    // Only respect system changes if user hasn't manually overridden
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      return; // User has a manual preference, ignore system changes
    }

    const newTheme = event.matches ? THEME_LIGHT : THEME_DARK;
    applyTheme(newTheme);
    updateButtonAriaLabel(button, newTheme);
  }

  /**
   * Initializes the theme system
   */
  function init() {
    // Get initial theme (inline script should have already applied it, but we confirm here)
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // Find the toggle button
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) {
      return;
    }

    // Set initial aria-label
    updateButtonAriaLabel(toggleButton, initialTheme);

    // Attach click handler
    toggleButton.addEventListener('click', () => toggleTheme(toggleButton));

    // Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handler = (event) => handleSystemPreferenceChange(event, toggleButton);
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else {
        mediaQuery.addListener(handler);
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }
})();
