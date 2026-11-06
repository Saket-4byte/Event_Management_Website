/**
 * EVENTORA - Main Application Orchestrator
 * Coordinates state, event listeners, UI modules, modal dialogs, Lucide icon rendering,
 * real-time countdown clocks, toast notifications, and scroll animations.
 */

import { getStoredEvents, saveEvents } from './data.js';
import { initTheme, toggleTheme, getCurrentTheme } from './theme.js';
import {
  filterState,
  getFilteredEvents,
  renderCategoryFilters,
  renderFeaturedGrid,
  renderUpcomingGrid,
  resetFilterState,
  updateResultsCounterDisplay,
  formatDisplayDate,
  parseEventDateTime,
  calculateTimeRemaining,
  createEventDetailsMarkup,
  updateAllCardCountdowns
} from './events.js';
import {
  getStoredRegistrations,
  processRegistration,
  cancelRegistration,
  validateFullName,
  validateEmail,
  validatePhone,
  validateSelectedEvent,
  validateRegistrationForm,
  populateEventSelect,
  createRegistrationSuccessMarkup,
  renderRegistrationsList,
  formatRegistrationDate
} from './registration.js';

/**
 * Re-runs Lucide icon parser on dynamic elements safely
 */
export function refreshLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Displays a toast notification in the fixed toast container.
 * @param {string} message - Message body
 * @param {'info'|'success'|'warning'|'error'} type - Style modifier
 * @param {string} title - Optional title headline
 * @param {number} duration - Milliseconds before auto-dismiss
 */
export function showToast(message, type = 'info', title = '', duration = 3600) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'check-circle-2',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  };

  const defaultTitles = {
    success: 'Success',
    error: 'Attention',
    warning: 'Notice',
    info: 'Eventora'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.setAttribute('role', 'status');

  toast.innerHTML = `
    <div class="toast-icon-wrap">
      <i data-lucide="${icons[type] || 'info'}" class="toast-icon" aria-hidden="true"></i>
    </div>
    <div class="toast-content">
      <span class="toast-title">${title || defaultTitles[type] || 'Notification'}</span>
      <span class="toast-msg">${message}</span>
    </div>
    <button type="button" class="toast-close-btn" aria-label="Dismiss notification">
      <i data-lucide="x" aria-hidden="true"></i>
    </button>
  `;

  container.appendChild(toast);
  refreshLucideIcons();

  let dismissTimeout;

  const dismissToast = () => {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
  };

  toast.querySelector('.toast-close-btn')?.addEventListener('click', dismissToast);

  dismissTimeout = setTimeout(dismissToast, duration);
}

/**
 * Updates UI badge counts for user registrations
 */
export function updateRegistrationsBadge() {
  const registrations = getStoredRegistrations();
  const badge = document.querySelector('[data-badge="my-registrations-count"]');
  if (badge) {
    badge.textContent = registrations.length;
    badge.style.display = registrations.length > 0 ? 'inline-flex' : 'none';
  }
}

/**
 * Initializes scroll-driven viewport animations using IntersectionObserver.
 * Fully honors prefers-reduced-motion.
 */
function initScrollAnimations() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll(
    'section, .section-header-block, .why-card, .featured-card, .newsletter-card, .contact-card'
  );

  if (prefersReduced || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  elements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
}

/**
 * Main application initialization routine
 */
function initApp() {
  console.log('🚀 Initializing Eventora Application...');

  // 1. Initialize Theme Controller
  initTheme(() => {
    refreshLucideIcons();
  });

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = toggleTheme();
      refreshLucideIcons();
      showToast(
        `Switched to ${activeTheme === 'dark' ? 'Dark Navy' : 'Light'} Mode`,
        'info',
        'Theme Changed'
      );
    });
  }

  // 2. Sticky Header Scroll Shadow
  const headerEl = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      headerEl.classList.add('scrolled');
    } else {
      headerEl.classList.remove('scrolled');
    }
  });

  // 3. Mobile Hamburger Menu Toggle & Accessible Drawer
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
      mobileDrawer.setAttribute('aria-hidden', (!isOpen).toString());
    });

    // Close mobile menu when clicking a link
    mobileDrawer.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // 3b. Desktop Navigation Active Link Scroll-Spy
  const desktopNavLinks = document.querySelectorAll('.nav-links-desktop .nav-link');
  const spySections = document.querySelectorAll('section[id]');

  function updateNavSpy() {
    const scrollY = window.scrollY + 140;
    let currentSectionId = '';

    spySections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      desktopNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isMatch = href === `#${currentSectionId}`;
        link.classList.toggle('active', isMatch);
      });
    }
  }

  window.addEventListener('scroll', updateNavSpy, { passive: true });

  // 4. Load dataset
  const allEvents = getStoredEvents();

  // 5. Render FEATURED EVENTS section
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid) {
    renderFeaturedGrid(featuredGrid, allEvents);
  }

  // 6. Render EXPLORE EVENTS section & Filter Engine
  const upcomingGrid = document.getElementById('upcoming-grid');
  const filterContainer = document.getElementById('category-filter-bar');
  const priceSelect = document.getElementById('price-filter-select');
  const sortSelect = document.getElementById('sort-filter-select');
  const searchInput = document.getElementById('event-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const resetBtn = document.getElementById('reset-filters-btn');
  const resultsCounterEl = document.getElementById('results-count-text');

  function refreshUpcomingView() {
    const filtered = getFilteredEvents(allEvents);

    // Render upcoming cards (passes clear callback for the empty state button)
    renderUpcomingGrid(upcomingGrid, filtered, handleClearAllFilters);

    // Update results counter (Showing X of Y events)
    updateResultsCounterDisplay(resultsCounterEl, filtered.length, allEvents.length);

    // Toggle reset filters button visibility
    const isFiltered =
      filterState.category !== 'all' ||
      filterState.searchQuery.trim() !== '' ||
      filterState.priceFilter !== 'all';

    if (resetBtn) {
      resetBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }

    updateAllCardCountdowns(document);
    refreshLucideIcons();
  }

  // Clear / Reset All Filters Handler
  function handleClearAllFilters() {
    resetFilterState();
    if (priceSelect) priceSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'date-asc';
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';

    // Reset category chip UI active state to 'all'
    if (filterContainer) {
      filterContainer.querySelectorAll('.filter-chip').forEach(c => {
        const isAll = c.dataset.category.toLowerCase() === 'all';
        c.classList.toggle('active', isAll);
        c.setAttribute('aria-pressed', isAll.toString());
      });
    }

    refreshUpcomingView();
    showToast('All search and category filters have been reset.', 'info', 'Filters Cleared');
  }

  // Category filter bar initialization
  if (filterContainer) {
    renderCategoryFilters(filterContainer, () => {
      refreshUpcomingView();
    });
  }

  // Price dropdown filter
  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      filterState.priceFilter = e.target.value;
      refreshUpcomingView();
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filterState.sortBy = e.target.value;
      refreshUpcomingView();
    });
  }

  // Search input & Clear search button
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      filterState.searchQuery = val;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = val.length > 0 ? 'inline-flex' : 'none';
      }
      refreshUpcomingView();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        filterState.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        refreshUpcomingView();
        searchInput.focus();
      }
    });
  }

  // Header quick search trigger focuses search input
  const navSearchTrigger = document.querySelector('.nav-icon-btn[href="#explore-events"]');
  if (navSearchTrigger) {
    navSearchTrigger.addEventListener('click', () => {
      setTimeout(() => {
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }, 350);
    });
  }

  // Reset filters button
  if (resetBtn) {
    resetBtn.addEventListener('click', handleClearAllFilters);
  }

  // Initial upcoming view render
  refreshUpcomingView();

  // 7. Event Details Modal & Live Countdown Timer Management
  const detailsModal = document.getElementById('event-details-modal');
  const detailsModalClose = document.getElementById('details-modal-close');
  const detailsModalBody = document.getElementById('details-modal-body');
  let countdownTimerInterval = null;

  function stopCountdownTimer() {
    if (countdownTimerInterval) {
      clearInterval(countdownTimerInterval);
      countdownTimerInterval = null;
    }
  }

  function closeEventDetailsModal() {
    stopCountdownTimer();
    if (detailsModal && detailsModal.open) {
      detailsModal.close();
    }
  }

  function openEventDetailsModal(eventId) {
    stopCountdownTimer();

    const event = allEvents.find(e => e.id === eventId);
    if (!event || !detailsModal || !detailsModalBody) return;

    // 1. Load details dynamically using event data & reusable markup generator
    detailsModalBody.innerHTML = createEventDetailsMarkup(event);

    // 2. Setup live ticking countdown timer (updating every second)
    const targetDateTime = parseEventDateTime(event.date, event.startTime);
    const tilesGrid = detailsModalBody.querySelector('#countdown-tiles');
    const expiredBanner = detailsModalBody.querySelector('#countdown-expired-banner');
    const cdDays = detailsModalBody.querySelector('#cd-days');
    const cdHours = detailsModalBody.querySelector('#cd-hours');
    const cdMinutes = detailsModalBody.querySelector('#cd-minutes');
    const cdSeconds = detailsModalBody.querySelector('#cd-seconds');

    function updateCountdownTick() {
      const time = calculateTimeRemaining(targetDateTime);

      if (time.isExpired) {
        if (tilesGrid) tilesGrid.style.display = 'none';
        if (expiredBanner) expiredBanner.style.display = 'flex';
        stopCountdownTimer();
        return;
      }

      if (tilesGrid) tilesGrid.style.display = 'flex';
      if (expiredBanner) expiredBanner.style.display = 'none';

      if (cdDays) cdDays.textContent = String(time.days).padStart(2, '0');
      if (cdHours) cdHours.textContent = String(time.hours).padStart(2, '0');
      if (cdMinutes) cdMinutes.textContent = String(time.minutes).padStart(2, '0');
      if (cdSeconds) cdSeconds.textContent = String(time.seconds).padStart(2, '0');
    }

    // Run first update immediately
    updateCountdownTick();
    // Update every second
    countdownTimerInterval = setInterval(updateCountdownTick, 1000);

    // 3. Prominent "Register Now" button inside details view
    const registerNowBtn = detailsModalBody.querySelector('#details-register-now-btn');
    if (registerNowBtn) {
      registerNowBtn.addEventListener('click', () => {
        closeEventDetailsModal();
        openRegistrationModal(event.id);
      });
    }

    // 4. Secondary close button in footer bar
    const innerCloseBtn = detailsModalBody.querySelector('#details-close-modal-btn');
    if (innerCloseBtn) {
      innerCloseBtn.addEventListener('click', closeEventDetailsModal);
    }

    // 5. Open dialog and refresh icons
    detailsModal.showModal();
    refreshLucideIcons();
  }

  // Header close button
  if (detailsModalClose) {
    detailsModalClose.addEventListener('click', closeEventDetailsModal);
  }

  // Outside click to close details modal
  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      const rect = detailsModal.getBoundingClientRect();
      const inBox = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!inBox) {
        closeEventDetailsModal();
      }
    });

    detailsModal.addEventListener('close', stopCountdownTimer);
    detailsModal.addEventListener('cancel', stopCountdownTimer);
  }

  // 8. Registration Modal Management
  const regModal = document.getElementById('registration-modal');
  const regModalClose = document.getElementById('reg-modal-close');
  const regCancelBtn = document.getElementById('reg-cancel-btn');
  const regForm = document.getElementById('registration-form');
  const regEventSelect = document.getElementById('reg-event');
  const regSuccessView = document.getElementById('reg-success-view');
  const regSuccessDetails = document.getElementById('reg-success-details');
  const successDoneBtn = document.getElementById('success-done-btn');
  const successViewRegBtn = document.getElementById('success-view-registrations-btn');

  function openRegistrationModal(eventId = '') {
    if (!regModal) return;

    // Close details modal if open and stop countdown timer
    closeEventDetailsModal();

    // Reset Form & Success State
    if (regForm) {
      regForm.reset();
      regForm.style.display = 'flex';
      clearFormErrors();
    }
    if (regSuccessView) {
      regSuccessView.style.display = 'none';
    }

    // Populate event options and select eventId
    populateEventSelect(regEventSelect, allEvents, eventId);
    if (eventId && regEventSelect) {
      regEventSelect.value = eventId;
    }

    regModal.showModal();
    refreshLucideIcons();

    // Focus name input for convenience
    const nameInput = document.getElementById('reg-name');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 80);
    }
  }

  function closeRegistrationModal() {
    if (regModal && regModal.open) {
      regModal.close();
    }
  }

  function clearFormErrors() {
    document.querySelectorAll('.form-error-msg').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
    document.querySelectorAll('.form-input').forEach(el => {
      el.classList.remove('is-invalid');
    });
  }

  function clearFieldError(fieldName) {
    const errorEl = document.getElementById(`error-${fieldName}`);
    const inputEl = document.getElementById(
      `reg-${fieldName === 'selectedEvent' ? 'event' : fieldName === 'fullName' ? 'name' : fieldName}`
    );
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
    if (inputEl) {
      inputEl.classList.remove('is-invalid');
    }
  }

  function setFieldError(fieldName, message) {
    const errorEl = document.getElementById(`error-${fieldName}`);
    const inputEl = document.getElementById(
      `reg-${fieldName === 'selectedEvent' ? 'event' : fieldName === 'fullName' ? 'name' : fieldName}`
    );
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    if (inputEl) {
      inputEl.classList.add('is-invalid');
    }
  }

  function showFormErrors(errors) {
    clearFormErrors();
    for (const [field, message] of Object.entries(errors)) {
      setFieldError(field, message);
    }
  }

  // Real-time input listeners to clear error when user corrects field
  const regNameInput = document.getElementById('reg-name');
  const regEmailInput = document.getElementById('reg-email');
  const regPhoneInput = document.getElementById('reg-phone');

  if (regNameInput) {
    regNameInput.addEventListener('input', () => {
      if (regNameInput.classList.contains('is-invalid')) {
        const res = validateFullName(regNameInput.value);
        if (res.isValid) {
          clearFieldError('fullName');
        }
      }
    });
  }

  if (regEmailInput) {
    regEmailInput.addEventListener('input', () => {
      if (regEmailInput.classList.contains('is-invalid')) {
        const res = validateEmail(regEmailInput.value);
        if (res.isValid) {
          clearFieldError('email');
          const currentEvId = regEventSelect?.value;
          if (currentEvId) {
            const evRes = validateSelectedEvent(currentEvId, allEvents, getStoredRegistrations(), res.value);
            if (evRes.isValid) {
              clearFieldError('selectedEvent');
            }
          }
        }
      }
    });
  }

  if (regPhoneInput) {
    regPhoneInput.addEventListener('input', () => {
      if (regPhoneInput.classList.contains('is-invalid')) {
        const res = validatePhone(regPhoneInput.value);
        if (res.isValid) {
          clearFieldError('phone');
        }
      }
    });
  }

  if (regEventSelect) {
    regEventSelect.addEventListener('change', () => {
      const val = regEventSelect.value;
      const email = regEmailInput?.value || '';
      const res = validateSelectedEvent(val, allEvents, getStoredRegistrations(), email);
      if (res.isValid) {
        clearFieldError('selectedEvent');
      } else {
        setFieldError('selectedEvent', res.message);
      }
    });
  }

  if (regModalClose) regModalClose.addEventListener('click', closeRegistrationModal);
  if (regCancelBtn) regCancelBtn.addEventListener('click', closeRegistrationModal);
  if (successDoneBtn) successDoneBtn.addEventListener('click', closeRegistrationModal);

  if (regModal) {
    regModal.addEventListener('click', (e) => {
      const rect = regModal.getBoundingClientRect();
      const inBox = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!inBox) closeRegistrationModal();
    });
  }

  // Handle Event Registration Form Submission with tactile loading state
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = {
        selectedEvent: regEventSelect ? regEventSelect.value : '',
        fullName: regNameInput ? regNameInput.value : '',
        email: regEmailInput ? regEmailInput.value : '',
        phone: regPhoneInput ? regPhoneInput.value : ''
      };

      const existingRegistrations = getStoredRegistrations();
      const validation = validateRegistrationForm(formData, allEvents, existingRegistrations);

      if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
      }

      clearFormErrors();

      // UI Loading state on submit button
      const submitBtn = document.getElementById('reg-submit-btn');
      const originalSubmitHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-sm" aria-hidden="true"></span>
          <span>Securing Reservation...</span>
        `;
      }

      setTimeout(() => {
        try {
          const result = processRegistration({
            fullName: validation.cleanData.fullName,
            email: validation.cleanData.email,
            phone: validation.cleanData.phone,
            eventId: validation.cleanData.selectedEvent
          }, allEvents);

          // Instantly update UI seat counts in Featured & Upcoming grids
          if (featuredGrid) {
            renderFeaturedGrid(featuredGrid, allEvents);
          }
          refreshUpcomingView();
          updateRegistrationsBadge();
          updateAllCardCountdowns(document);

          // Update dropdown for subsequent selections
          populateEventSelect(regEventSelect, allEvents, result.record.eventId);

          // Display polished digital pass voucher confirmation
          if (regSuccessDetails) {
            regSuccessDetails.innerHTML = createRegistrationSuccessMarkup(result.record);
          }

          // Reset form and transition to success view
          regForm.reset();
          regForm.style.display = 'none';
          if (regSuccessView) {
            regSuccessView.style.display = 'flex';
          }

          showToast(
            `You are registered for "${result.record.eventTitle}"!`,
            'success',
            'Pass Confirmed'
          );

          refreshLucideIcons();
        } catch (err) {
          console.error('Registration processing failed:', err);
          setFieldError('selectedEvent', err.message || 'An error occurred during registration.');
          showToast(err.message || 'Registration failed.', 'error', 'Error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalSubmitHTML;
          }
        }
      }, 300);
    });
  }

  // 9. "My Registrations" Modal Management & Cancellation Flow
  const regListModal = document.getElementById('registrations-modal');
  const regListModalClose = document.getElementById('registrations-modal-close');
  const myRegistrationsBtn = document.getElementById('my-registrations-btn');
  const mobileRegBtn = document.getElementById('mobile-reg-btn');
  const footerRegLink = document.getElementById('footer-my-reg-link');
  const registrationsListContainer = document.getElementById('registrations-list');

  // View Pass Modal
  const viewPassModal = document.getElementById('view-pass-modal');
  const viewPassModalClose = document.getElementById('view-pass-modal-close');
  const viewPassBackBtn = document.getElementById('view-pass-back-btn');
  const viewPassBody = document.getElementById('view-pass-modal-body');

  function openViewPassModal(regId) {
    if (!viewPassModal || !viewPassBody) return;
    const records = getStoredRegistrations();
    const target = records.find(r => r.id === regId || r.registrationId === regId);
    if (!target) {
      showToast('Registration record not found.', 'error', 'Error');
      return;
    }

    viewPassBody.innerHTML = createRegistrationSuccessMarkup(target);
    viewPassModal.showModal();
    refreshLucideIcons();
  }

  function closeViewPassModal() {
    if (viewPassModal && viewPassModal.open) {
      viewPassModal.close();
    }
  }

  if (viewPassModalClose) viewPassModalClose.addEventListener('click', closeViewPassModal);
  if (viewPassBackBtn) viewPassBackBtn.addEventListener('click', closeViewPassModal);

  if (viewPassModal) {
    viewPassModal.addEventListener('click', (e) => {
      const rect = viewPassModal.getBoundingClientRect();
      const inBox = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!inBox) closeViewPassModal();
    });
  }

  // Cancel Confirmation Dialog (Replaces native window.confirm)
  const cancelConfirmModal = document.getElementById('cancel-confirm-modal');
  const cancelConfirmClose = document.getElementById('cancel-confirm-close');
  const cancelConfirmKeepBtn = document.getElementById('cancel-confirm-keep-btn');
  const cancelConfirmProceedBtn = document.getElementById('cancel-confirm-proceed-btn');
  const cancelConfirmText = document.getElementById('cancel-confirm-text');
  let pendingCancelRegId = null;

  function promptCancelRegistration(regId) {
    const records = getStoredRegistrations();
    const target = records.find(r => r.id === regId || r.registrationId === regId);
    if (!target) return;

    pendingCancelRegId = regId;
    if (cancelConfirmText) {
      cancelConfirmText.textContent = `Are you sure you want to cancel your reservation for "${target.eventTitle}"? Your seat will be returned to the event's available inventory.`;
    }
    if (cancelConfirmModal) {
      cancelConfirmModal.showModal();
      refreshLucideIcons();
    }
  }

  function closeCancelConfirmModal() {
    pendingCancelRegId = null;
    if (cancelConfirmModal && cancelConfirmModal.open) {
      cancelConfirmModal.close();
    }
  }

  if (cancelConfirmClose) cancelConfirmClose.addEventListener('click', closeCancelConfirmModal);
  if (cancelConfirmKeepBtn) cancelConfirmKeepBtn.addEventListener('click', closeCancelConfirmModal);

  if (cancelConfirmProceedBtn) {
    cancelConfirmProceedBtn.addEventListener('click', () => {
      if (!pendingCancelRegId) return;

      const regIdToCancel = pendingCancelRegId;
      closeCancelConfirmModal();

      const updatedRecords = cancelRegistration(regIdToCancel, allEvents);
      const cancelledRecord = updatedRecords.cancelledRecord;

      renderRegistrationsList(
        registrationsListContainer,
        updatedRecords,
        promptCancelRegistration,
        openViewPassModal,
        () => {
          closeRegistrationsModal();
          const exploreSec = document.getElementById('explore-events');
          if (exploreSec) exploreSec.scrollIntoView({ behavior: 'smooth' });
        }
      );

      if (featuredGrid) renderFeaturedGrid(featuredGrid, allEvents);
      refreshUpcomingView();
      updateRegistrationsBadge();
      updateAllCardCountdowns(document);
      refreshLucideIcons();

      const eventName = cancelledRecord ? `"${cancelledRecord.eventTitle}"` : 'your event';
      showToast(
        `Reservation for ${eventName} cancelled. 1 seat restored to inventory.`,
        'warning',
        'Registration Cancelled'
      );
    });
  }

  function openRegistrationsModal() {
    if (!regListModal) return;
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    closeEventDetailsModal();
    const records = getStoredRegistrations();
    renderRegistrationsList(
      registrationsListContainer,
      records,
      promptCancelRegistration,
      openViewPassModal,
      () => {
        closeRegistrationsModal();
        const exploreSec = document.getElementById('explore-events');
        if (exploreSec) exploreSec.scrollIntoView({ behavior: 'smooth' });
      }
    );
    regListModal.showModal();
    refreshLucideIcons();
  }

  function closeRegistrationsModal() {
    if (regListModal && regListModal.open) {
      regListModal.close();
    }
  }

  if (myRegistrationsBtn) myRegistrationsBtn.addEventListener('click', openRegistrationsModal);
  if (mobileRegBtn) mobileRegBtn.addEventListener('click', openRegistrationsModal);
  if (footerRegLink) {
    footerRegLink.addEventListener('click', (e) => {
      e.preventDefault();
      openRegistrationsModal();
    });
  }
  if (regListModalClose) regListModalClose.addEventListener('click', closeRegistrationsModal);
  if (successViewRegBtn) {
    successViewRegBtn.addEventListener('click', () => {
      closeRegistrationModal();
      openRegistrationsModal();
    });
  }

  if (regListModal) {
    regListModal.addEventListener('click', (e) => {
      const rect = regListModal.getBoundingClientRect();
      const inBox = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!inBox) closeRegistrationsModal();
    });
  }

  // 10. Host an Event Modal (Submit Proposal to Curation Team)
  const hostModal = document.getElementById('host-modal');
  const hostBtn = document.getElementById('host-event-btn');
  const hostModalClose = document.getElementById('host-modal-close');
  const hostCancelBtn = document.getElementById('host-cancel-btn');
  const hostForm = document.getElementById('host-event-form');
  const hostStatusMsg = document.getElementById('host-status-msg');

  const hostTitleInput = document.getElementById('host-title-input');
  const hostCityInput = document.getElementById('host-city-input');
  const hostEmailInput = document.getElementById('host-email-input');
  const errorHostTitle = document.getElementById('error-host-title');
  const errorHostCity = document.getElementById('error-host-city');
  const errorHostEmail = document.getElementById('error-host-email');

  function clearHostFormErrors() {
    [hostTitleInput, hostCityInput, hostEmailInput].forEach(input => {
      if (input) {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
      }
    });
    [errorHostTitle, errorHostCity, errorHostEmail].forEach(errEl => {
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('visible');
      }
    });
    if (hostStatusMsg) {
      hostStatusMsg.textContent = '';
      hostStatusMsg.style.display = 'none';
    }
  }

  // Real-time input error removal
  if (hostTitleInput) {
    hostTitleInput.addEventListener('input', () => {
      if (hostTitleInput.value.trim().length >= 3) {
        hostTitleInput.classList.remove('is-invalid');
        if (errorHostTitle) errorHostTitle.classList.remove('visible');
      }
    });
  }
  if (hostCityInput) {
    hostCityInput.addEventListener('input', () => {
      if (hostCityInput.value.trim().length >= 3) {
        hostCityInput.classList.remove('is-invalid');
        if (errorHostCity) errorHostCity.classList.remove('visible');
      }
    });
  }
  if (hostEmailInput) {
    hostEmailInput.addEventListener('input', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(hostEmailInput.value.trim())) {
        hostEmailInput.classList.remove('is-invalid');
        if (errorHostEmail) errorHostEmail.classList.remove('visible');
      }
    });
  }

  if (hostBtn && hostModal) {
    hostBtn.addEventListener('click', () => {
      if (hostForm) hostForm.reset();
      clearHostFormErrors();
      closeEventDetailsModal();
      hostModal.showModal();
      refreshLucideIcons();
    });
  }
  if (hostModalClose && hostModal) hostModalClose.addEventListener('click', () => hostModal.close());
  if (hostCancelBtn && hostModal) hostCancelBtn.addEventListener('click', () => hostModal.close());

  if (hostForm) {
    hostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearHostFormErrors();

      const title = hostTitleInput ? hostTitleInput.value.trim() : '';
      const city = hostCityInput ? hostCityInput.value.trim() : '';
      const email = hostEmailInput ? hostEmailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

      let hasErrors = false;
      let firstInvalid = null;

      if (!title || title.length < 3) {
        if (hostTitleInput) hostTitleInput.classList.add('is-invalid');
        if (errorHostTitle) {
          errorHostTitle.textContent = 'Please enter an event name (at least 3 characters).';
          errorHostTitle.classList.add('visible');
        }
        hasErrors = true;
        firstInvalid = firstInvalid || hostTitleInput;
      }

      if (!city || city.length < 3) {
        if (hostCityInput) hostCityInput.classList.add('is-invalid');
        if (errorHostCity) {
          errorHostCity.textContent = 'Please provide the city and venue.';
          errorHostCity.classList.add('visible');
        }
        hasErrors = true;
        firstInvalid = firstInvalid || hostCityInput;
      }

      if (!email || !emailRegex.test(email)) {
        if (hostEmailInput) hostEmailInput.classList.add('is-invalid');
        if (errorHostEmail) {
          errorHostEmail.textContent = 'Please provide a valid organizer email address.';
          errorHostEmail.classList.add('visible');
        }
        hasErrors = true;
        firstInvalid = firstInvalid || hostEmailInput;
      }

      if (hasErrors) {
        if (firstInvalid) firstInvalid.focus();
        showToast('Please fill out all required fields before submitting.', 'error', 'Incomplete Form');
        return;
      }

      // Valid: show curation submission confirmation (does NOT publish event to the website)
      if (hostStatusMsg) {
        hostStatusMsg.textContent = '🎉 Event submission received! Our curation team will review it within 24 hours.';
        hostStatusMsg.style.display = 'block';
        hostStatusMsg.style.color = 'var(--color-accent-green)';
      }
      hostForm.reset();
      showToast('Event proposal submitted to curation team for review!', 'success', 'Proposal Received');

      setTimeout(() => {
        if (hostModal && hostModal.open) hostModal.close();
      }, 2500);
    });
  }

  // 11. Newsletter Form Submission with Basic Email Validation
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterStatus = document.getElementById('newsletter-status');

  if (newsletterForm && newsletterEmail && newsletterStatus) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

      if (!email || !emailRegex.test(email)) {
        newsletterStatus.textContent = '⚠️ Please enter a valid email address (e.g. name@domain.com).';
        newsletterStatus.className = 'newsletter-status-msg error';
        showToast('Please enter a valid email address.', 'error', 'Invalid Email');
        return;
      }

      newsletterStatus.textContent = '✨ You are now subscribed! Welcome to the Eventora community.';
      newsletterStatus.className = 'newsletter-status-msg success';
      newsletterEmail.value = '';
      showToast('Subscribed to Eventora weekly highlights!', 'success', 'Subscribed');

      setTimeout(() => {
        newsletterStatus.textContent = '';
      }, 5000);
    });
  }

  // 12. Contact Form Submission with Comprehensive Validation
  const contactForm = document.getElementById('contact-form');
  const contactFeedback = document.getElementById('contact-feedback');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');
  const contactNameInput = document.getElementById('contact-name');
  const contactEmailInput = document.getElementById('contact-email');
  const contactMessageInput = document.getElementById('contact-message');
  const errorContactName = document.getElementById('error-contact-name');
  const errorContactEmail = document.getElementById('error-contact-email');
  const errorContactMessage = document.getElementById('error-contact-message');

  function validateContactNameField(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { isValid: false, message: 'Please enter your name.' };
    }
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long.' };
    }
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(trimmed)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes.' };
    }
    return { isValid: true, message: '', value: trimmed };
  }

  function validateContactEmailField(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { isValid: false, message: 'Please enter your email address.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Please enter a valid email address (e.g. name@domain.com).' };
    }
    return { isValid: true, message: '', value: trimmed.toLowerCase() };
  }

  function validateContactMessageField(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { isValid: false, message: 'Please enter your message.' };
    }
    if (trimmed.length < 10) {
      return { isValid: false, message: 'Message must be at least 10 characters long.' };
    }
    return { isValid: true, message: '', value: trimmed };
  }

  function setContactFieldError(inputEl, errorEl, message) {
    if (inputEl) {
      inputEl.classList.add('is-invalid');
      inputEl.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearContactFieldError(inputEl, errorEl) {
    if (inputEl) {
      inputEl.classList.remove('is-invalid');
      inputEl.removeAttribute('aria-invalid');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  // Real-time live error removal on user typing
  if (contactNameInput) {
    contactNameInput.addEventListener('input', () => {
      if (contactNameInput.classList.contains('is-invalid')) {
        const res = validateContactNameField(contactNameInput.value);
        if (res.isValid) {
          clearContactFieldError(contactNameInput, errorContactName);
        }
      }
    });
  }

  if (contactEmailInput) {
    contactEmailInput.addEventListener('input', () => {
      if (contactEmailInput.classList.contains('is-invalid')) {
        const res = validateContactEmailField(contactEmailInput.value);
        if (res.isValid) {
          clearContactFieldError(contactEmailInput, errorContactEmail);
        }
      }
    });
  }

  if (contactMessageInput) {
    contactMessageInput.addEventListener('input', () => {
      if (contactMessageInput.classList.contains('is-invalid')) {
        const res = validateContactMessageField(contactMessageInput.value);
        if (res.isValid) {
          clearContactFieldError(contactMessageInput, errorContactMessage);
        }
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = contactNameInput ? contactNameInput.value : '';
      const emailVal = contactEmailInput ? contactEmailInput.value : '';
      const messageVal = contactMessageInput ? contactMessageInput.value : '';

      const nameCheck = validateContactNameField(nameVal);
      const emailCheck = validateContactEmailField(emailVal);
      const messageCheck = validateContactMessageField(messageVal);

      let hasErrors = false;
      let firstInvalidInput = null;

      if (!nameCheck.isValid) {
        setContactFieldError(contactNameInput, errorContactName, nameCheck.message);
        hasErrors = true;
        firstInvalidInput = firstInvalidInput || contactNameInput;
      } else {
        clearContactFieldError(contactNameInput, errorContactName);
      }

      if (!emailCheck.isValid) {
        setContactFieldError(contactEmailInput, errorContactEmail, emailCheck.message);
        hasErrors = true;
        firstInvalidInput = firstInvalidInput || contactEmailInput;
      } else {
        clearContactFieldError(contactEmailInput, errorContactEmail);
      }

      if (!messageCheck.isValid) {
        setContactFieldError(contactMessageInput, errorContactMessage, messageCheck.message);
        hasErrors = true;
        firstInvalidInput = firstInvalidInput || contactMessageInput;
      } else {
        clearContactFieldError(contactMessageInput, errorContactMessage);
      }

      if (hasErrors) {
        if (contactFeedback) contactFeedback.textContent = '';
        if (firstInvalidInput) firstInvalidInput.focus();
        showToast('Please fill out all required fields before sending.', 'error', 'Incomplete Form');
        return;
      }

      // Valid submission with tactile loading feedback
      const originalBtnHTML = contactSubmitBtn ? contactSubmitBtn.innerHTML : '';
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerHTML = `
          <span class="spinner-sm" aria-hidden="true"></span>
          <span>Sending Message...</span>
        `;
      }

      setTimeout(() => {
        if (contactFeedback) {
          contactFeedback.textContent = 'Message sent! A member of our community team will reply shortly.';
        }
        contactForm.reset();
        clearContactFieldError(contactNameInput, errorContactName);
        clearContactFieldError(contactEmailInput, errorContactEmail);
        clearContactFieldError(contactMessageInput, errorContactMessage);

        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.innerHTML = originalBtnHTML || `
            <span>Send Message</span>
            <i data-lucide="send" class="btn-icon" aria-hidden="true"></i>
          `;
          refreshLucideIcons();
        }

        showToast('Your message has been sent to our community team.', 'success', 'Message Sent');

        setTimeout(() => {
          if (contactFeedback) {
            contactFeedback.textContent = '';
          }
        }, 5000);
      }, 400);
    });
  }

  // 13. Global Event Delegation (Register Now, View Details, Category clicks, ID copying)
  document.addEventListener('click', (e) => {
    // "Register" button click
    const registerBtn = e.target.closest('.register-trigger-btn');
    if (registerBtn) {
      const eventId = registerBtn.dataset.registerId;
      openRegistrationModal(eventId);
      return;
    }

    // "View Details" button click
    const detailsBtn = e.target.closest('.view-details-btn');
    if (detailsBtn) {
      const eventId = detailsBtn.dataset.eventId;
      openEventDetailsModal(eventId);
      return;
    }

    // Category click from footer or direct links
    const catLink = e.target.closest('[data-cat-link]');
    if (catLink) {
      const cat = catLink.dataset.catLink;
      filterState.category = cat;
      if (filterContainer) {
        filterContainer.querySelectorAll('.filter-chip').forEach(c => {
          const isActive = c.dataset.category.toLowerCase() === cat.toLowerCase();
          c.classList.toggle('active', isActive);
          c.setAttribute('aria-pressed', isActive.toString());
        });
      }
      refreshUpcomingView();
    }

    // Quick Copy Registration ID to Clipboard
    const highlightVal = e.target.closest('.highlight-val');
    if (highlightVal) {
      const text = highlightVal.textContent.trim();
      if (text && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied ${text} to clipboard!`, 'info', 'Copied');
        }).catch(() => {});
      }
    }
  });

  // Global Escape Key Support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailsModal && detailsModal.open) closeEventDetailsModal();
      if (regModal && regModal.open) closeRegistrationModal();
      if (regListModal && regListModal.open) closeRegistrationsModal();
      if (viewPassModal && viewPassModal.open) closeViewPassModal();
      if (cancelConfirmModal && cancelConfirmModal.open) closeCancelConfirmModal();
      if (hostModal && hostModal.open) hostModal.close();
    }
  });

  // 14. Initial Clocks, Animations & Badge Setup
  updateRegistrationsBadge();
  initScrollAnimations();
  updateAllCardCountdowns(document);

  // Global 1-second interval to tick all card countdowns
  setInterval(() => {
    updateAllCardCountdowns(document);
  }, 1000);

  refreshLucideIcons();

  console.log('✨ Eventora bonus features operational: live card countdowns, toast alerts, theme toggle, and custom modal confirmation.');
}

// Bootstrap once DOM content is parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
