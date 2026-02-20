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

  // Check if device supports hover
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  // DOM element references
  let projectCards = [];


  // Mobile center highlight tracking
  let isCenterTicking = false;
  let centeredCard = null;
  let flipIntervalId = null;
  let isFlipped = false;

  function getCardVideo(card) {
    return card.querySelector('.card-video');
  }

  function playCardVideo(card) {
    const video = getCardVideo(card);
    if (!video) return;

    // Cancel any pending stop reset
    if (video._stopRaf) {
      cancelAnimationFrame(video._stopRaf);
      video._stopRaf = null;
    }

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function stopCardVideo(card) {
    const video = getCardVideo(card);
    if (!video) return;

    const doStop = () => {
      video._stopRaf = null;
      // Wait for the pause event to fire before resetting currentTime,
      // so the seek never races with an in-progress play promise.
      const onPaused = () => {
        video.currentTime = 0;
      };
      video.addEventListener('pause', onPaused, { once: true });
      video.pause();
    };

    // Defer by one rAF so any play() promise has a chance to resolve first
    video._stopRaf = requestAnimationFrame(doStop);
  }

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
   * Handles mouseenter on a card
   * @param {HTMLElement} card - The project card element
   */
  function handleMouseEnter(card) {
    card.classList.add(HOVER_CLASS);

    if (getCardVideo(card)) {
      playCardVideo(card);
    }

  }

  /**
   * Handles mouseleave on a card
   * @param {HTMLElement} card - The project card element
   */
  function handleMouseLeave(card) {
    card.classList.remove(HOVER_CLASS);

    if (getCardVideo(card)) {
      stopCardVideo(card);
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

    if (closestCard !== centeredCard) {
      setCenteredCard(closestCard);
    }
  }

  function clearCenteredFlip() {
    if (flipIntervalId) {
      clearInterval(flipIntervalId);
      flipIntervalId = null;
    }

    if (centeredCard) {
      stopCardVideo(centeredCard);
      centeredCard.classList.remove('is-flipped');
    }

    isFlipped = false;
  }

  function setCenteredCard(card) {
    clearCenteredFlip();
    centeredCard = card;

    if (!centeredCard) return;

    if (getCardVideo(centeredCard)) {
      playCardVideo(centeredCard);
      return;
    }

    flipIntervalId = setInterval(() => {
      isFlipped = !isFlipped;
      centeredCard.classList.toggle('is-flipped', isFlipped);
    }, 1000);
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
