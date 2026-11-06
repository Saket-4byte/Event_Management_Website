/**
 * EVENTORA - Event Catalog & Filter Engine
 * Handles dynamic rendering of event cards, category filtering, search,
 * combined filtering, featured events, and event details modal with live countdown.
 */

import { EVENT_CATEGORIES } from './data.js';

/**
 * Active filter and sorting state
 */
export const filterState = {
  category: 'all',      // 'all' or specific category name (e.g. 'Technology', 'Music')
  searchQuery: '',      // Text query for search
  priceFilter: 'all',   // 'all' | 'free' | 'paid'
  sortBy: 'date-asc'    // 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc'
};

/**
 * Resets the filter state back to default values
 */
export function resetFilterState() {
  filterState.category = 'all';
  filterState.searchQuery = '';
  filterState.priceFilter = 'all';
  filterState.sortBy = 'date-asc';
}

/**
 * Formats an ISO date string into an accessible, readable format.
 * @param {string} dateString - e.g. "2026-11-20"
 * @returns {string} Formatted date e.g. "Thu, Nov 20, 2026"
 */
export function formatDisplayDate(dateString) {
  try {
    const d = new Date(dateString + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Parses event date and start time strings into a valid JavaScript Date.
 * Handles formats like '2026-11-20' and '09:30 AM' or '06:00 PM'.
 * @param {string} dateString - e.g. "2026-11-20"
 * @param {string} timeString - e.g. "09:30 AM"
 * @returns {Date|null}
 */
export function parseEventDateTime(dateString, timeString) {
  if (!dateString) return null;
  let hours = 9;
  let minutes = 0;

  if (timeString) {
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridiem = match[3] ? match[3].toUpperCase() : '';
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
    }
  }

  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, hours, minutes, 0);
}

/**
 * Computes remaining time until target date.
 * Returns days, hours, minutes, seconds and expiration status.
 * @param {Date} targetDate
 * @returns {Object} { isExpired, days, hours, minutes, seconds }
 */
export function calculateTimeRemaining(targetDate) {
  if (!targetDate || isNaN(targetDate.getTime())) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isExpired: false,
    days,
    hours,
    minutes,
    seconds
  };
}

/**
 * Returns a compact formatted string for card-level live countdown badges.
 * @param {string} dateString
 * @param {string} timeString
 * @returns {Object} { text: string, isExpired: boolean, className: string }
 */
export function formatCompactCountdown(dateString, timeString) {
  const target = parseEventDateTime(dateString, timeString);
  const remaining = calculateTimeRemaining(target);

  if (remaining.isExpired) {
    return {
      text: 'Concluded',
      isExpired: true,
      className: 'is-expired'
    };
  }

  const { days, hours, minutes, seconds } = remaining;
  let text = '';
  if (days > 0) {
    text = `Starts in ${days}d ${hours}h`;
  } else if (hours > 0) {
    text = `Starts in ${hours}h ${minutes}m ${seconds}s`;
  } else {
    text = `Starts in ${minutes}m ${seconds}s`;
  }

  return {
    text,
    isExpired: false,
    className: days === 0 ? 'is-imminent' : 'is-upcoming'
  };
}

/**
 * Updates all live countdown pill badges on rendered event cards.
 * @param {HTMLElement|Document} root
 */
export function updateAllCardCountdowns(root = document) {
  const pills = root.querySelectorAll('.card-countdown-pill');
  pills.forEach((pill) => {
    const dateStr = pill.dataset.cdDate;
    const timeStr = pill.dataset.cdTime;
    if (!dateStr) return;

    const result = formatCompactCountdown(dateStr, timeStr);
    const textEl = pill.querySelector('.countdown-pill-text');
    if (textEl && textEl.textContent !== result.text) {
      textEl.textContent = result.text;
    }

    pill.classList.toggle('is-expired', result.isExpired);
    pill.classList.toggle('is-imminent', result.className === 'is-imminent');
  });
}

/**
 * Filters and sorts the events array according to current filterState.
 * Supports combined category + title/venue/category search + price filtering.
 * @param {Array} events - Full list of event objects
 * @returns {Array} Filtered and sorted event objects
 */
export function getFilteredEvents(events) {
  if (!Array.isArray(events)) return [];

  const query = filterState.searchQuery.trim().toLowerCase();
  const selectedCat = filterState.category.toLowerCase();

  return events
    .filter((event) => {
      // 1. Category Matching (Case-insensitive, supports 'all', aliases 'arts' -> 'art & culture')
      const catNorm = (event.category || '').toLowerCase();
      const isArtsMatch =
        (selectedCat === 'arts' || selectedCat === 'art') &&
        (catNorm.includes('art') || catNorm.includes('culture'));
      const matchesCategory =
        selectedCat === 'all' ||
        catNorm === selectedCat ||
        isArtsMatch;

      // 2. Search Matching (Case-insensitive across Title, Venue, City, Category, and Description)
      const titleMatch = event.title && event.title.toLowerCase().includes(query);
      const venueMatch = event.venue && event.venue.toLowerCase().includes(query);
      const categoryMatch =
        event.category &&
        (event.category.toLowerCase().includes(query) ||
         (query === 'arts' && event.category.toLowerCase().includes('art')));
      const cityMatch = event.city && event.city.toLowerCase().includes(query);
      const descMatch =
        (event.shortDescription && event.shortDescription.toLowerCase().includes(query)) ||
        (event.fullDescription && event.fullDescription.toLowerCase().includes(query));

      const matchesSearch =
        !query || titleMatch || venueMatch || categoryMatch || cityMatch || descMatch;

      // 3. Price Filter Matching
      const price = Number(event.price) || 0;
      const matchesPrice =
        filterState.priceFilter === 'all' ||
        (filterState.priceFilter === 'free' && price === 0) ||
        (filterState.priceFilter === 'paid' && price > 0);

      // Combined search and category filtering
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (filterState.sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (filterState.sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (filterState.sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (filterState.sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });
}

/**
 * Generates semantic HTML markup for an event card in the main directory.
 * @param {Object} event
 * @returns {string} HTML markup string
 */
export function createEventCardMarkup(event) {
  const isFree = Number(event.price) === 0;
  const priceDisplay = isFree ? 'Free Admission' : `$${event.price}`;
  const formattedDate = formatDisplayDate(event.date);
  const seatsLeft = event.availableSeats ?? 50;

  return `
    <article class="event-card" data-event-id="${event.id}">
      <div class="card-media">
        <img
          src="${event.image}"
          alt="${event.title}"
          loading="lazy"
          class="card-img"
        />
        ${event.featured ? `
          <span class="card-badge featured-tag">
            <i data-lucide="sparkles" class="badge-icon-inline" aria-hidden="true"></i>
            Featured
          </span>
        ` : `
          <span class="card-badge">${seatsLeft < 20 ? 'Limited Spots' : 'Open'}</span>
        `}
        <span class="card-category-badge">${event.category}</span>
      </div>

      <div class="card-content">
        <div class="card-meta">
          <span class="meta-item">
            <i data-lucide="calendar" class="meta-icon" aria-hidden="true"></i>
            <time datetime="${event.date}">${formattedDate}</time>
          </span>
          <span class="meta-item">
            <i data-lucide="clock" class="meta-icon" aria-hidden="true"></i>
            <span>${event.startTime || 'TBA'}</span>
          </span>
          <span
            class="card-countdown-pill"
            data-cd-date="${event.date}"
            data-cd-time="${event.startTime || '09:00 AM'}"
            title="Time remaining until event start"
          >
            <i data-lucide="timer" class="countdown-pill-icon" aria-hidden="true"></i>
            <span class="countdown-pill-text">Calculating...</span>
          </span>
        </div>

        <h3 class="card-title">${event.title}</h3>
        <p class="card-tagline">${event.shortDescription || ''}</p>

        <div class="card-location">
          <i data-lucide="map-pin" class="location-icon" aria-hidden="true"></i>
          <span>${event.venue}, ${event.city}</span>
        </div>

        <div class="card-footer">
          <div class="card-pricing">
            <span class="price-label">${seatsLeft} seats left</span>
            <span class="price-value ${isFree ? 'price-free' : ''}">${priceDisplay}</span>
          </div>
          <div class="card-actions-group">
            <button
              type="button"
              class="btn btn-ghost btn-sm view-details-btn"
              data-event-id="${event.id}"
              aria-label="View details for ${event.title}"
            >
              <span>View Details</span>
              <i data-lucide="arrow-up-right" class="btn-icon-xs" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm register-trigger-btn"
              data-register-id="${event.id}"
              aria-label="Register for ${event.title}"
            >
              <span>Register</span>
              <i data-lucide="clipboard-pen" class="btn-icon-xs" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Generates semantic HTML markup for a spotlight card in the FEATURED section.
 * @param {Object} event
 * @returns {string} HTML markup string
 */
export function createFeaturedCardMarkup(event) {
  const isFree = Number(event.price) === 0;
  const priceDisplay = isFree ? 'Free Admission' : `$${event.price}`;
  const formattedDate = formatDisplayDate(event.date);

  return `
    <article class="featured-card" data-event-id="${event.id}">
      <div class="card-media">
        <img
          src="${event.image}"
          alt="${event.title}"
          loading="lazy"
          class="card-img"
        />
        <div class="featured-spotlight-ribbon">
          <i data-lucide="sparkles" aria-hidden="true"></i>
          <span>Spotlight Selection</span>
        </div>
        <span class="card-category-badge">${event.category}</span>
      </div>

      <div class="card-content">
        <div class="card-meta">
          <span class="meta-item">
            <i data-lucide="calendar" class="meta-icon" aria-hidden="true"></i>
            <time datetime="${event.date}">${formattedDate}</time>
          </span>
          <span class="meta-item">
            <i data-lucide="clock" class="meta-icon" aria-hidden="true"></i>
            <span>${event.startTime || 'TBA'}</span>
          </span>
          <span
            class="card-countdown-pill"
            data-cd-date="${event.date}"
            data-cd-time="${event.startTime || '09:00 AM'}"
            title="Time remaining until event start"
          >
            <i data-lucide="timer" class="countdown-pill-icon" aria-hidden="true"></i>
            <span class="countdown-pill-text">Calculating...</span>
          </span>
        </div>

        <h3 class="card-title">${event.title}</h3>
        <p class="card-tagline">${event.shortDescription || ''}</p>

        <div class="card-location">
          <i data-lucide="map-pin" class="location-icon" aria-hidden="true"></i>
          <span>${event.venue}, ${event.city}</span>
        </div>

        <div class="card-footer">
          <div class="card-pricing">
            <span class="price-label">Admission</span>
            <span class="price-value ${isFree ? 'price-free' : ''}">${priceDisplay}</span>
          </div>
          <div class="card-actions-group">
            <button
              type="button"
              class="btn btn-ghost btn-sm view-details-btn"
              data-event-id="${event.id}"
              aria-label="View details for ${event.title}"
            >
              <span>View Details</span>
              <i data-lucide="arrow-up-right" class="btn-icon-xs" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm register-trigger-btn"
              data-register-id="${event.id}"
              aria-label="Register for ${event.title}"
            >
              <span>Register</span>
              <i data-lucide="clipboard-pen" class="btn-icon-xs" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Generates the complete HTML for the Event Details modal.
 * Displays:
 * - Large cover image
 * - Title
 * - Category badge
 * - Full description
 * - Date & start time
 * - Venue and city
 * - Organizer information
 * - Ticket price
 * - Available seats
 * - Countdown timer (Days, Hours, Minutes, Seconds)
 * - Prominent "Register Now" button
 * @param {Object} event
 * @returns {string} HTML markup string
 */
export function createEventDetailsMarkup(event) {
  const isFree = Number(event.price) === 0;
  const priceDisplay = isFree ? 'Free Admission' : `$${event.price}`;
  const formattedDate = formatDisplayDate(event.date);
  const seatsRemaining = event.availableSeats ?? 50;

  return `
    <article class="event-details-layout" data-event-id="${event.id}">
      <!-- Large Event Cover Image & Header Badges -->
      <div class="details-hero-media">
        <img
          src="${event.image}"
          alt="${event.title}"
          class="details-cover-image"
        />
        <div class="details-media-badges">
          <span class="card-category-badge">${event.category}</span>
          ${event.featured ? `
            <span class="card-badge featured-tag">
              <i data-lucide="sparkles" class="badge-icon-inline" aria-hidden="true"></i>
              Featured Event
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Main Event Info -->
      <div class="details-main-body">
        <div class="details-title-row">
          <h2 class="details-heading">${event.title}</h2>
          <p class="details-subtitle">${event.shortDescription || ''}</p>
        </div>

        <!-- Live Countdown Timer Section -->
        <div class="details-countdown-wrapper" id="details-countdown-box">
          <div class="countdown-heading-bar">
            <div class="countdown-title-group">
              <span class="pulse-indicator" aria-hidden="true"></span>
              <i data-lucide="timer" class="countdown-icon orange-text" aria-hidden="true"></i>
              <span class="countdown-heading-text">Event Starts In</span>
            </div>
            <span class="countdown-date-hint">${formattedDate} • ${event.startTime || 'TBA'}</span>
          </div>

          <!-- Countdown Grid (Live updated every second) -->
          <div class="countdown-tiles-grid" id="countdown-tiles">
            <div class="countdown-tile">
              <span class="countdown-num" id="cd-days">--</span>
              <span class="countdown-label">Days</span>
            </div>
            <span class="countdown-separator" aria-hidden="true">:</span>
            <div class="countdown-tile">
              <span class="countdown-num" id="cd-hours">--</span>
              <span class="countdown-label">Hours</span>
            </div>
            <span class="countdown-separator" aria-hidden="true">:</span>
            <div class="countdown-tile">
              <span class="countdown-num" id="cd-minutes">--</span>
              <span class="countdown-label">Minutes</span>
            </div>
            <span class="countdown-separator" aria-hidden="true">:</span>
            <div class="countdown-tile">
              <span class="countdown-num" id="cd-seconds">--</span>
              <span class="countdown-label">Seconds</span>
            </div>
          </div>

          <!-- Expired / In-Progress Notice (Shown when event date has arrived or passed) -->
          <div class="countdown-expired-banner" id="countdown-expired-banner" style="display: none;">
            <i data-lucide="alert-triangle" class="expired-icon" aria-hidden="true"></i>
            <div class="expired-text-group">
              <strong>Event Started or Concluded</strong>
              <p>This event is either in progress or has ended. Live reservations may be closed.</p>
            </div>
          </div>
        </div>

        <!-- Key Event Attributes Grid -->
        <div class="details-meta-grid">
          <div class="details-meta-card">
            <div class="meta-icon-bubble orange-bg">
              <i data-lucide="calendar" class="meta-bubble-icon" aria-hidden="true"></i>
            </div>
            <div class="meta-details">
              <span class="meta-label">Date & Time</span>
              <p class="meta-value">${formattedDate} • ${event.startTime || 'TBA'}</p>
            </div>
          </div>

          <div class="details-meta-card">
            <div class="meta-icon-bubble purple-bg">
              <i data-lucide="map-pin" class="meta-bubble-icon" aria-hidden="true"></i>
            </div>
            <div class="meta-details">
              <span class="meta-label">Venue & City</span>
              <p class="meta-value">${event.venue}, ${event.city}</p>
            </div>
          </div>

          <div class="details-meta-card">
            <div class="meta-icon-bubble green-bg">
              <i data-lucide="ticket" class="meta-bubble-icon" aria-hidden="true"></i>
            </div>
            <div class="meta-details">
              <span class="meta-label">Ticket Admission</span>
              <p class="meta-value ${isFree ? 'price-free' : ''}">${priceDisplay}</p>
            </div>
          </div>

          <div class="details-meta-card">
            <div class="meta-icon-bubble cyan-bg">
              <i data-lucide="users" class="meta-bubble-icon" aria-hidden="true"></i>
            </div>
            <div class="meta-details">
              <span class="meta-label">Available Seats</span>
              <p class="meta-value">${seatsRemaining} spots remaining</p>
            </div>
          </div>

          <div class="details-meta-card">
            <div class="meta-icon-bubble amber-bg">
              <i data-lucide="award" class="meta-bubble-icon" aria-hidden="true"></i>
            </div>
            <div class="meta-details">
              <span class="meta-label">Organizer & Host</span>
              <p class="meta-value">${event.organizer || 'Eventora Verified Organizer'}</p>
            </div>
          </div>

          <div class="details-meta-card">
            <div class="meta-icon-bubble purple-bg">
              <i data-lucide="shield-check" class="meta-bubble-icon" aria-hidden="true"></i>
            </div>
            <div class="meta-details">
              <span class="meta-label">Reservation Guarantee</span>
              <p class="meta-value">Instant Local Confirmation</p>
            </div>
          </div>
        </div>

        <!-- Full Event Description -->
        <div class="details-full-description">
          <h3 class="description-heading">
            <i data-lucide="align-left" class="section-icon" aria-hidden="true"></i>
            About This Event
          </h3>
          <p class="description-text">
            ${event.fullDescription || event.shortDescription || 'No description provided.'}
          </p>
        </div>

        <!-- Prominent Call-to-Action Bar -->
        <div class="details-footer-bar">
          <div class="details-price-badge">
            <span class="price-hint">Total Admission</span>
            <span class="price-figure ${isFree ? 'price-free' : ''}">${priceDisplay}</span>
          </div>

          <div class="details-cta-actions">
            <button type="button" class="btn btn-ghost" id="details-close-modal-btn">
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary btn-lg prominent-register-btn"
              id="details-register-now-btn"
              data-event-id="${event.id}"
            >
              <span>Register Now</span>
              <i data-lucide="arrow-right" class="btn-icon" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders the Featured Events section grid.
 * Prevents duplicate rendering by clearing container first.
 * @param {HTMLElement} gridContainer
 * @param {Array} events
 */
export function renderFeaturedGrid(gridContainer, events) {
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  const featured = events.filter(e => Boolean(e.featured));
  const itemsToRender = featured.length > 0 ? featured : events.slice(0, 3);
  gridContainer.innerHTML = itemsToRender.map(createFeaturedCardMarkup).join('');
}

/**
 * Renders the Upcoming / Explore Events section grid.
 * Prevents duplicate rendering and displays a rich empty state when no events match.
 * @param {HTMLElement} gridContainer
 * @param {Array} events - Filtered event objects
 * @param {Function} onClearFilters - Callback when user clicks "Clear All Filters"
 */
export function renderUpcomingGrid(gridContainer, events, onClearFilters) {
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  if (events.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state" role="status">
        <i data-lucide="calendar-x-2" class="empty-icon" aria-hidden="true"></i>
        <h3>No matching events found</h3>
        <p>
          We couldn't find any events matching your selected criteria.
          Try clearing your search query or choosing another category.
        </p>
        <button type="button" class="btn btn-primary btn-sm empty-reset-btn" id="empty-state-reset-btn">
          <i data-lucide="rotate-ccw" class="btn-icon-xs" aria-hidden="true"></i>
          <span>Clear All Filters</span>
        </button>
      </div>
    `;

    const emptyResetBtn = gridContainer.querySelector('#empty-state-reset-btn');
    if (emptyResetBtn && typeof onClearFilters === 'function') {
      emptyResetBtn.addEventListener('click', onClearFilters);
    }
    return;
  }

  gridContainer.innerHTML = events.map(createEventCardMarkup).join('');
}

/**
 * Renders category navigation filter buttons.
 * @param {HTMLElement} container
 * @param {Function} onSelectCategory - Callback receiving selected categoryId
 */
export function renderCategoryFilters(container, onSelectCategory) {
  if (!container) return;

  container.innerHTML = EVENT_CATEGORIES.map(cat => {
    const isSelected =
      filterState.category.toLowerCase() === cat.id.toLowerCase() ||
      (filterState.category === 'all' && cat.id === 'all');

    return `
      <button
        type="button"
        class="filter-chip ${isSelected ? 'active' : ''}"
        data-category="${cat.id}"
        aria-pressed="${isSelected}"
      >
        <i data-lucide="${cat.icon}" class="chip-icon" aria-hidden="true"></i>
        <span>${cat.label}</span>
      </button>
    `;
  }).join('');

  if (!container.dataset.hasCategoryListener) {
    container.dataset.hasCategoryListener = 'true';
    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      const categoryId = chip.dataset.category;
      filterState.category = categoryId;

      container.querySelectorAll('.filter-chip').forEach(c => {
        const active = c.dataset.category.toLowerCase() === categoryId.toLowerCase();
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', active.toString());
      });

      if (typeof onSelectCategory === 'function') {
        onSelectCategory(categoryId);
      }
    });
  }
}

/**
 * Updates the total number of matching events counter display.
 * @param {HTMLElement} counterElement
 * @param {number} matchingCount - Number of filtered events
 * @param {number} totalCount - Total events available in the collection
 */
export function updateResultsCounterDisplay(counterElement, matchingCount, totalCount) {
  if (!counterElement) return;

  const hasFilter =
    filterState.category !== 'all' ||
    filterState.searchQuery.trim() !== '' ||
    filterState.priceFilter !== 'all';

  if (hasFilter) {
    counterElement.textContent = `Showing ${matchingCount} of ${totalCount} events`;
  } else {
    counterElement.textContent = `Showing all ${totalCount} upcoming events`;
  }
}
