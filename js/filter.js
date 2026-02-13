/**
 * Project Filter Module
 * Handles category filtering for project cards with desktop pills and mobile dropdown.
 * @module filter
 */
(function() {
  'use strict';

  // Configuration constants
  const ANIMATION_DURATION = 300; // ms - matches CSS transition duration
  const HIDDEN_CLASS = 'filter-hidden';
  const ACTIVE_CLASS = 'active';
  const OPEN_CLASS = 'open';

  // DOM element references (cached after DOM load)
  let filterPills = [];
  let dropdownItems = [];
  let projectCards = [];
  let dropdownToggle = null;
  let dropdownContainer = null;
  let dropdownLabel = null;
  let dropdownMenu = null;
  let filterPillsContainer = null;
  let isDraggingPills = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let hasDraggedPills = false;

  /**
   * Cache DOM references for better performance
   */
  function cacheElements() {
    filterPills = Array.from(document.querySelectorAll('.filter-pill'));
    dropdownItems = Array.from(document.querySelectorAll('.filter-dropdown-item'));
    projectCards = Array.from(document.querySelectorAll('.project-card'));
    dropdownToggle = document.querySelector('.filter-dropdown-toggle');
    dropdownContainer = document.getElementById('filter-dropdown');
    dropdownLabel = document.querySelector('.filter-dropdown-label');
    dropdownMenu = document.querySelector('.filter-dropdown-menu');
    filterPillsContainer = document.querySelector('.filter-pills');
  }

  /**
   * Enables drag-to-scroll for the filter pill bar
   */
  function attachPillDragScroll() {
    if (!filterPillsContainer) return;

    filterPillsContainer.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      isDraggingPills = true;
      hasDraggedPills = false;
      dragStartX = event.clientX;
      dragStartScrollLeft = filterPillsContainer.scrollLeft;
      filterPillsContainer.classList.add('is-dragging');
      if (event.pointerType !== 'mouse') {
        filterPillsContainer.setPointerCapture(event.pointerId);
      }
    });

    filterPillsContainer.addEventListener('pointermove', (event) => {
      if (!isDraggingPills) return;
      const deltaX = event.clientX - dragStartX;
      if (Math.abs(deltaX) > 3) {
        hasDraggedPills = true;
      }
      filterPillsContainer.scrollLeft = dragStartScrollLeft - deltaX;
    });

    const stopDrag = (event) => {
      if (!isDraggingPills) return;
      isDraggingPills = false;
      filterPillsContainer.classList.remove('is-dragging');
      if (event && event.pointerId !== undefined && event.pointerType !== 'mouse') {
        filterPillsContainer.releasePointerCapture(event.pointerId);
      }
      setTimeout(() => {
        hasDraggedPills = false;
      }, 0);
    };

    filterPillsContainer.addEventListener('pointerup', stopDrag);
    filterPillsContainer.addEventListener('pointercancel', stopDrag);
    filterPillsContainer.addEventListener('pointerleave', stopDrag);

    // Prevent accidental click when dragging
    filterPillsContainer.addEventListener('click', (event) => {
      if (hasDraggedPills) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  /**
   * Gets the display text for a filter value
   * @param {string} filterValue - The filter value/slug
   * @returns {string} The human-readable label
   */
  function getFilterLabel(filterValue) {
    // Try to find the corresponding button to get its text
    const pill = filterPills.find(p => p.dataset.filter === filterValue);
    if (pill) {
      return pill.textContent.trim();
    }

    const item = dropdownItems.find(i => i.dataset.filter === filterValue);
    if (item) {
      return item.textContent.trim();
    }

    // Fallback: capitalize first letter
    return filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  }

  /**
   * Updates the active state on filter pills
   * @param {string} activeFilter - The currently active filter value
   */
  function updatePillStates(activeFilter) {
    filterPills.forEach(pill => {
      const isActive = pill.dataset.filter === activeFilter;
      pill.classList.toggle(ACTIVE_CLASS, isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * Updates the active state on dropdown items
   * @param {string} activeFilter - The currently active filter value
   */
  function updateDropdownItemStates(activeFilter) {
    dropdownItems.forEach(item => {
      const isActive = item.dataset.filter === activeFilter;
      item.classList.toggle(ACTIVE_CLASS, isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * Updates the dropdown label text
   * @param {string} filterValue - The currently active filter value
   */
  function updateDropdownLabel(filterValue) {
    if (dropdownLabel) {
      dropdownLabel.textContent = getFilterLabel(filterValue);
    }
  }

  /**
   * Closes the mobile dropdown menu
   */
  function closeDropdown() {
    if (dropdownContainer) {
      dropdownContainer.classList.remove(OPEN_CLASS);
    }
    if (dropdownToggle) {
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Opens the mobile dropdown menu
   */
  function openDropdown() {
    if (dropdownContainer) {
      dropdownContainer.classList.add(OPEN_CLASS);
    }
    if (dropdownToggle) {
      dropdownToggle.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Toggles the mobile dropdown menu
   */
  function toggleDropdown() {
    if (dropdownContainer && dropdownContainer.classList.contains(OPEN_CLASS)) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  /**
   * Filters project cards based on the selected category
   * @param {string} filterValue - The filter value to apply ('all' or category slug)
   */
  function filterCards(filterValue) {
    projectCards.forEach(card => {
      const categories = card.dataset.categories || '';
      const categoryList = categories.split(' ').filter(Boolean);

      // Determine if card should be shown
      const shouldShow = filterValue === 'all' || categoryList.includes(filterValue);

      if (shouldShow) {
        // Card should be shown
        card.classList.remove(HIDDEN_CLASS);
        // After animation completes, ensure display is set
        setTimeout(() => {
          card.style.display = '';
        }, ANIMATION_DURATION);
      } else {
        // Card should be hidden
        card.classList.add(HIDDEN_CLASS);
        // After animation completes, set display none
        setTimeout(() => {
          card.style.display = 'none';
        }, ANIMATION_DURATION);
      }
    });

    // Reinitialize animations on visible cards after transition
    setTimeout(() => {
      if (window.AnimationSystem && typeof window.AnimationSystem.reinitialize === 'function') {
        window.AnimationSystem.reinitialize();
      }
    }, ANIMATION_DURATION);
  }

  /**
   * Handles filter selection
   * @param {string} filterValue - The selected filter value
   * @param {HTMLElement} clickedElement - The element that was clicked
   */
  function handleFilterSelect(filterValue, clickedElement) {
    // Update all UI states
    updatePillStates(filterValue);
    updateDropdownItemStates(filterValue);
    updateDropdownLabel(filterValue);

    // Close dropdown if it was a dropdown item that was clicked
    if (clickedElement.classList.contains('filter-dropdown-item')) {
      closeDropdown();
    }

    // Apply the filter
    filterCards(filterValue);
  }

  /**
   * Attaches click handlers to filter buttons
   */
  function attachFilterHandlers() {
    // Desktop pills
    filterPills.forEach(pill => {
      pill.addEventListener('click', (event) => {
        event.preventDefault();
        const filterValue = pill.dataset.filter;
        if (filterValue) {
          handleFilterSelect(filterValue, pill);
        }
      });
    });

    // Mobile dropdown items
    dropdownItems.forEach(item => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        const filterValue = item.dataset.filter;
        if (filterValue) {
          handleFilterSelect(filterValue, item);
        }
      });
    });
  }

  /**
   * Attaches dropdown toggle handler
   */
  function attachDropdownHandlers() {
    if (!dropdownToggle) return;

    // Toggle dropdown on button click
    dropdownToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (dropdownContainer && dropdownContainer.classList.contains(OPEN_CLASS)) {
        const isClickInside = dropdownContainer.contains(event.target);
        if (!isClickInside) {
          closeDropdown();
        }
      }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dropdownContainer && dropdownContainer.classList.contains(OPEN_CLASS)) {
        closeDropdown();
        // Return focus to toggle button
        dropdownToggle.focus();
      }
    });
  }

  /**
   * Initializes the filter system
   */
  function init() {
    cacheElements();

    // Check if required elements exist
    if (filterPills.length === 0 && dropdownItems.length === 0) {
      console.warn('No filter buttons found (.filter-pill or .filter-dropdown-item)');
      return;
    }

    if (projectCards.length === 0) {
      console.warn('No project cards found (.project-card)');
      return;
    }

    // Attach all event handlers
    attachFilterHandlers();
    attachDropdownHandlers();
    attachPillDragScroll();

    // Set initial active state (default to 'all' if exists)
    const allFilter = filterPills.find(p => p.dataset.filter === 'all') ||
                      dropdownItems.find(i => i.dataset.filter === 'all');
    if (allFilter) {
      handleFilterSelect('all', allFilter);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
