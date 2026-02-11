/**
 * Card Hover Module
 * Enhanced hover effects for project cards with image preloading and parallax.
 * Only activates on devices that support hover (desktop).
 * @module card-hover
 */
(function() {
  'use strict';

  // Configuration constants
  const HOVER_CLASS = 'is-hovered';
  const MAX_PARALLAX_OFFSET = 5; // px - maximum movement in any direction
  const PARALLAX_STRENGTH = 0.02; // multiplier for mouse position

  // Check if device supports hover
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  // DOM element references
  let projectCards = [];

  // Track active cards and their animation frames
  const activeCards = new Map(); // cardElement -> { rafId, targetX, targetY, currentX, currentY }

  // Mobile center highlight tracking
  let isCenterTicking = false;

  /**
   * Cache DOM references
   */
  function cacheElements() {
    projectCards = Array.from(document.querySelectorAll('.project-card'));
  }

  /**
   * Preloads the hover image for a card
   * @param {HTMLElement} card - The project card element
   */
  function preloadHoverImage(card) {
    const hoverImage = card.querySelector('.card-hover');
    if (!hoverImage) return;

    const src = hoverImage.getAttribute('src');
    if (!src) return;

    // Create a new Image object to trigger loading
    const preloadImg = new Image();
    preloadImg.src = src;
  }

  /**
   * Sets up IntersectionObserver to preload hover images when cards enter viewport
   */
  function setupImagePreloading() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: preload all images immediately
      projectCards.forEach(preloadHoverImage);
      return;
    }

    const observerOptions = {
      root: null, // viewport
      rootMargin: '50px', // start loading slightly before visible
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          preloadHoverImage(entry.target);
          // Stop observing this card after preloading
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    projectCards.forEach(card => {
      observer.observe(card);
    });
  }

  /**
   * Applies parallax transform to card image
   * @param {HTMLElement} cardImage - The card image wrapper element
   * @param {number} offsetX - Horizontal offset in pixels
   * @param {number} offsetY - Vertical offset in pixels
   */
  function applyParallax(cardImage, offsetX, offsetY) {
    if (!cardImage) return;
    cardImage.style.setProperty('--parallax-x', `${offsetX}px`);
    cardImage.style.setProperty('--parallax-y', `${offsetY}px`);
  }

  /**
   * Resets parallax transform on card image
   * @param {HTMLElement} cardImage - The card image wrapper element
   */
  function resetParallax(cardImage) {
    if (!cardImage) return;
    cardImage.style.removeProperty('--parallax-x');
    cardImage.style.removeProperty('--parallax-y');
  }

  /**
   * Animation loop for smooth parallax effect
   * Uses linear interpolation for smooth movement
   * @param {HTMLElement} card - The project card element
   */
  function animateParallax(card) {
    const state = activeCards.get(card);
    if (!state) return;

    // Linear interpolation for smooth movement (0.1 = smooth, 0.3 = responsive)
    const lerpFactor = 0.15;
    state.currentX += (state.targetX - state.currentX) * lerpFactor;
    state.currentY += (state.targetY - state.currentY) * lerpFactor;

    // Apply the transform
    const cardImage = card.querySelector('.card-image');
    applyParallax(cardImage, state.currentX, state.currentY);

    // Continue animation if there's significant movement remaining
    const deltaX = Math.abs(state.targetX - state.currentX);
    const deltaY = Math.abs(state.targetY - state.currentY);

    if (deltaX > 0.01 || deltaY > 0.01) {
      state.rafId = requestAnimationFrame(() => animateParallax(card));
    } else {
      // Snap to final position and stop animation
      applyParallax(cardImage, state.targetX, state.targetY);
      state.rafId = null;
    }
  }

  /**
   * Handles mouseenter on a card
   * @param {HTMLElement} card - The project card element
   */
  function handleMouseEnter(card) {
    card.classList.add(HOVER_CLASS);

    // Initialize parallax state for this card
    activeCards.set(card, {
      rafId: null,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0
    });
  }

  /**
   * Handles mouseleave on a card
   * @param {HTMLElement} card - The project card element
   */
  function handleMouseLeave(card) {
    card.classList.remove(HOVER_CLASS);

    // Cancel any running animation
    const state = activeCards.get(card);
    if (state && state.rafId) {
      cancelAnimationFrame(state.rafId);
    }

    // Reset parallax
    const cardImage = card.querySelector('.card-image');
    resetParallax(cardImage);

    // Remove from active cards
    activeCards.delete(card);
  }

  /**
   * Handles mousemove on a card for parallax effect
   * @param {HTMLElement} card - The project card element
   * @param {MouseEvent} event - The mouse event
   */
  function handleMouseMove(card, event) {
    const state = activeCards.get(card);
    if (!state) return;

    // Get card dimensions and position
    const rect = card.getBoundingClientRect();

    // Calculate mouse position relative to card center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate offset from center (-1 to 1)
    const offsetX = (mouseX - centerX) / centerX;
    const offsetY = (mouseY - centerY) / centerY;

    // Calculate target parallax values (inverted for natural feel)
    state.targetX = offsetX * MAX_PARALLAX_OFFSET * -1;
    state.targetY = offsetY * MAX_PARALLAX_OFFSET * -1;

    // Start animation loop if not already running
    if (!state.rafId) {
      state.rafId = requestAnimationFrame(() => animateParallax(card));
    }
  }

  /**
   * Attaches hover event handlers to all project cards
   */
  function attachHoverHandlers() {
    projectCards.forEach(card => {
      // Mouse enter - add hover class and initialize state
      card.addEventListener('mouseenter', () => {
        handleMouseEnter(card);
      });

      // Mouse leave - remove hover class and cleanup
      card.addEventListener('mouseleave', () => {
        handleMouseLeave(card);
      });

      // Mouse move - update parallax target
      card.addEventListener('mousemove', (event) => {
        handleMouseMove(card, event);
      });
    });
  }

  /**
   * Highlights the card closest to the viewport center (mobile)
   */
  function updateCenteredCard() {
    if (projectCards.length === 0) return;

    const viewportCenter = window.innerHeight / 2;
    let closestCard = null;
    let closestDistance = Infinity;

    projectCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const distance = Math.abs(viewportCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestCard = card;
      }
    });

    projectCards.forEach(card => {
      card.classList.toggle('is-centered', card === closestCard);
    });
  }

  function requestCenterTick() {
    if (!isCenterTicking) {
      window.requestAnimationFrame(() => {
        updateCenteredCard();
        isCenterTicking = false;
      });
      isCenterTicking = true;
    }
  }

  function attachCenterHighlightHandlers() {
    updateCenteredCard();
    window.addEventListener('scroll', requestCenterTick, { passive: true });
    window.addEventListener('resize', requestCenterTick);
  }

  /**
   * Initializes the card hover module
   */
  function init() {
    cacheElements();

    if (projectCards.length === 0) {
      console.warn('No project cards found (.project-card)');
      return;
    }

    // Mobile: highlight card centered in viewport
    if (!supportsHover) {
      attachCenterHighlightHandlers();
      return;
    }

    // Setup image preloading
    setupImagePreloading();

    // Attach hover handlers
    attachHoverHandlers();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
