/**
 * EVENTORA - Registration Management Module
 * Handles event registration, strict field validation:
 * [Full Name, Email Address, Indian Mobile Phone, Selected Event],
 * LocalStorage persistence, duplicate prevention, and seat inventory management.
 */

import { STORAGE_KEYS, saveEvents } from './data.js';
import { parseEventDateTime, formatDisplayDate } from './events.js';

/**
 * Retrieves saved registrations for the user from LocalStorage.
 * @returns {Array} List of registration records
 */
export function getStoredRegistrations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load registrations from LocalStorage:', err);
    return [];
  }
}

/**
 * Validates Full Name field:
 * - Required
 * - Minimum 3 characters
 * - Only letters, spaces, hyphens, and apostrophes
 * @param {string} name
 * @returns {Object} { isValid: boolean, message: string, value: string }
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, message: 'Full name is required.' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 3) {
    return { isValid: false, message: 'Full name must be at least 3 characters long.' };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, message: 'Full name can only contain letters, spaces, hyphens, and apostrophes.' };
  }

  return { isValid: true, message: '', value: trimmed };
}

/**
 * Validates Email Address:
 * - Required
 * - Must follow standard valid email format
 * @param {string} email
 * @returns {Object} { isValid: boolean, message: string, value: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { isValid: false, message: 'Email address is required.' };
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  return { isValid: true, message: '', value: trimmed.toLowerCase() };
}

/**
 * Validates Indian Mobile Phone Number:
 * - Required
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 * - Automatically strips country code prefix (+91, 91, 0) and formatting characters
 * @param {string} phone
 * @returns {Object} { isValid: boolean, message: string, value: string }
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    return { isValid: false, message: 'Phone number is required.' };
  }

  // Sanitize: strip +91, 91, 0 prefix, spaces, hyphens, brackets
  const cleaned = phone
    .trim()
    .replace(/^(\+91[\s-]?|91[\s-]?|0)/, '')
    .replace(/[\s\-()]/g, '');

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      message: 'Please enter a valid 10-digit Indian mobile number.'
    };
  }

  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleaned)) {
    return {
      isValid: false,
      message: 'Indian mobile numbers must start with 6, 7, 8, or 9.'
    };
  }

  return { isValid: true, message: '', value: cleaned };
}

/**
 * Validates Selected Event:
 * - Required
 * - Event must exist in dataset
 * - Prevents registration for expired events
 * - Prevents registration when available seats are 0
 * - Prevents duplicate registration by the same email for the same event
 * @param {string} eventId
 * @param {Array} events
 * @param {Array} existingRegistrations
 * @param {string} userEmail
 * @returns {Object} { isValid: boolean, message: string, event: Object|null }
 */
export function validateSelectedEvent(eventId, events, existingRegistrations = [], userEmail = '') {
  if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
    return { isValid: false, message: 'Please select an event to register for.', event: null };
  }

  const event = events.find(e => e.id === eventId);
  if (!event) {
    return { isValid: false, message: 'Selected event could not be found.', event: null };
  }

  // 1. Check if event is expired (past date/time)
  const eventDateTime = parseEventDateTime(event.date, event.startTime);
  if (eventDateTime && eventDateTime.getTime() <= Date.now()) {
    return {
      isValid: false,
      message: 'This event has already started or concluded. Registrations are closed.',
      event
    };
  }

  // 2. Check available seat inventory
  const availableSeats = event.availableSeats ?? 50;
  if (availableSeats <= 0) {
    return {
      isValid: false,
      message: 'This event is completely sold out. No available seats remaining.',
      event
    };
  }

  // 3. Prevent duplicate registration by same email for the same event
  if (userEmail && userEmail.trim().length > 0) {
    const emailNorm = userEmail.trim().toLowerCase();
    const isDuplicate = existingRegistrations.some(
      r => r.eventId === eventId && r.email && r.email.toLowerCase() === emailNorm
    );

    if (isDuplicate) {
      return {
        isValid: false,
        message: 'You have already registered for this event with this email address.',
        event
      };
    }
  }

  return { isValid: true, message: '', event };
}

/**
 * Aggregated form validation.
 * @param {Object} formData
 * @param {Array} events
 * @param {Array} existingRegistrations
 * @returns {Object} { isValid: boolean, errors: Object, cleanData: Object }
 */
export function validateRegistrationForm(formData, events, existingRegistrations) {
  const errors = {};

  const nameResult = validateFullName(formData.fullName);
  if (!nameResult.isValid) errors.fullName = nameResult.message;

  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) errors.email = emailResult.message;

  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) errors.phone = phoneResult.message;

  const eventResult = validateSelectedEvent(
    formData.selectedEvent,
    events,
    existingRegistrations,
    emailResult.isValid ? emailResult.value : ''
  );
  if (!eventResult.isValid) errors.selectedEvent = eventResult.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData: {
      fullName: nameResult.value || '',
      email: emailResult.value || '',
      phone: phoneResult.value || '',
      selectedEvent: formData.selectedEvent,
      event: eventResult.event
    }
  };
}

/**
 * Generates an official, unique registration ID.
 * Format: EVT-REG-XXXXXX-XXXX
 * @returns {string}
 */
export function generateRegistrationId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVT-REG-${timestamp}-${randomSuffix}`;
}

/**
 * Complete registration processor:
 * - Generates unique registration ID
 * - Decrements available seats in event object
 * - Persists updated events in LocalStorage
 * - Saves registration record in LocalStorage
 * @param {Object} payload - { fullName, email, phone, eventId }
 * @param {Array} events - Full mutable events array
 * @returns {Object} { success: boolean, record: Object, updatedEvent: Object }
 */
export function processRegistration({ fullName, email, phone, eventId }, events) {
  const registrations = getStoredRegistrations();
  const event = events.find(e => e.id === eventId);

  if (!event) {
    throw new Error('Event not found.');
  }

  // Decrement available seats in event inventory
  if (typeof event.availableSeats === 'number') {
    event.availableSeats = Math.max(0, event.availableSeats - 1);
  } else {
    event.availableSeats = 49;
  }
  // Keep legacy property in sync
  event.seatsRemaining = event.availableSeats;

  // Persist updated event data across refreshes
  saveEvents(events);

  // Generate unique registration ID
  const registrationId = generateRegistrationId();
  const now = new Date();

  const record = {
    id: registrationId,
    registrationId,
    ticketRef: registrationId,
    name: fullName.trim(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    eventId: event.id,
    eventTitle: event.title,
    eventVenue: `${event.venue}, ${event.city}`,
    eventDate: formatDisplayDate(event.date),
    eventTime: event.startTime || 'TBA',
    eventCategory: event.category,
    eventPrice: Number(event.price) === 0 ? 'Free' : `$${event.price}`,
    registrationDate: now.toISOString(),
    createdAt: now.toISOString(),
    status: 'Confirmed'
  };

  registrations.unshift(record);

  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  } catch (err) {
    console.error('Failed to persist registration to LocalStorage:', err);
  }

  return {
    success: true,
    record,
    updatedEvent: event
  };
}

/**
 * Cancels a registration, restores the seat count to the event,
 * and updates LocalStorage.
 * Ensures cancellation does not affect other registrations.
 * @param {string} registrationId
 * @param {Array} events
 * @returns {Array} Updated registrations (with cancelledRecord attached)
 */
export function cancelRegistration(registrationId, events) {
  const current = getStoredRegistrations();
  const target = current.find(r => r.id === registrationId || r.registrationId === registrationId);

  if (target && events) {
    const event = events.find(e => e.id === target.eventId);
    if (event) {
      event.availableSeats = (event.availableSeats ?? 50) + 1;
      event.seatsRemaining = event.availableSeats;
      saveEvents(events);
    }
  }

  // Pure immutability: isolate and remove only the matching record
  const updated = current.filter(r => r.id !== registrationId && r.registrationId !== registrationId);

  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update registrations after cancellation:', err);
  }

  // Attach reference to target record for notifications
  updated.cancelledRecord = target || null;
  updated.success = Boolean(target);
  return updated;
}

/**
 * Populates the event selection dropdown in the registration modal.
 * Clearly labels sold-out or past events.
 * @param {HTMLSelectElement} selectEl
 * @param {Array} events
 * @param {string} activeEventId
 */
export function populateEventSelect(selectEl, events, activeEventId = '') {
  if (!selectEl) return;

  selectEl.innerHTML = `
    <option value="" disabled ${!activeEventId ? 'selected' : ''}>-- Choose an Event --</option>
    ${events.map(e => {
      const isSelected = e.id === activeEventId;
      const isSoldOut = (e.availableSeats ?? 50) <= 0;
      const priceTag = Number(e.price) === 0 ? 'Free' : `$${e.price}`;
      const statusSuffix = isSoldOut ? ' [SOLD OUT]' : ` (${e.availableSeats ?? 50} seats left)`;

      return `
        <option
          value="${e.id}"
          ${isSelected ? 'selected' : ''}
          ${isSoldOut ? 'disabled' : ''}
        >
          ${e.title} • ${priceTag}${statusSuffix}
        </option>
      `;
    }).join('')}
  `;
}

/**
 * Generates the HTML for the professional registration success confirmation view.
 * @param {Object} record - The confirmed registration record
 * @returns {string} HTML markup string
 */
export function createRegistrationSuccessMarkup(record) {
  return `
    <div class="success-ticket-pass">
      <div class="pass-header">
        <div class="pass-brand">
          <i data-lucide="sparkles" class="pass-logo-icon" aria-hidden="true"></i>
          <span>EVENTORA OFFICIAL PASS</span>
        </div>
        <span class="pass-status-pill">${record.status}</span>
      </div>

      <div class="pass-body">
        <div class="pass-event-title-wrap">
          <span class="pass-category-tag">${record.eventCategory || 'Event'}</span>
          <h4 class="pass-event-title">${record.eventTitle}</h4>
        </div>

        <div class="pass-grid">
          <div class="pass-cell">
            <span class="cell-label">Attendee Name</span>
            <span class="cell-val">${record.name}</span>
          </div>

          <div class="pass-cell">
            <span class="cell-label">Registration ID</span>
            <span class="cell-val highlight-val">${record.registrationId}</span>
          </div>

          <div class="pass-cell">
            <span class="cell-label">Email Address</span>
            <span class="cell-val">${record.email}</span>
          </div>

          <div class="pass-cell">
            <span class="cell-label">Phone Number</span>
            <span class="cell-val">+91 ${record.phone}</span>
          </div>

          <div class="pass-cell">
            <span class="cell-label">Date & Time</span>
            <span class="cell-val">${record.eventDate} (${record.eventTime})</span>
          </div>

          <div class="pass-cell">
            <span class="cell-label">Venue</span>
            <span class="cell-val">${record.eventVenue}</span>
          </div>
        </div>
      </div>

      <div class="pass-footer">
        <i data-lucide="shield-check" class="pass-shield-icon" aria-hidden="true"></i>
        <span>Saved securely to your browser's LocalStorage. Present your Registration ID at entrance.</span>
      </div>
    </div>
  `;
}

/**
 * Formats ISO date string into readable user registration date.
 * @param {string} isoStr
 * @returns {string}
 */
export function formatRegistrationDate(isoStr) {
  if (!isoStr) return 'Recently';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

/**
 * Renders the list of registered events in the "My Registrations" modal.
 * Displays Registration ID, Participant Name, Event Name, and Registration Date.
 * Allows users to view registration pass details and trigger safe cancellation.
 * @param {HTMLElement} container
 * @param {Array} registrations
 * @param {Function} onCancelRegistration
 * @param {Function} onViewPass
 * @param {Function} onExploreClick
 */
export function renderRegistrationsList(container, registrations, onCancelRegistration, onViewPass, onExploreClick) {
  if (!container) return;

  if (registrations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon-wrap">
          <i data-lucide="ticket-x" class="empty-icon" aria-hidden="true"></i>
        </div>
        <h3 class="empty-title">No Active Registrations</h3>
        <p class="empty-desc">You haven't reserved tickets for any events yet. Explore upcoming gatherings and secure your pass in seconds!</p>
        <button type="button" class="btn btn-primary btn-sm" id="empty-explore-btn">
          <i data-lucide="compass" class="btn-icon-xs" aria-hidden="true"></i>
          <span>Explore Events</span>
        </button>
      </div>
    `;

    const exploreBtn = container.querySelector('#empty-explore-btn');
    if (exploreBtn && typeof onExploreClick === 'function') {
      exploreBtn.addEventListener('click', onExploreClick);
    }
    return;
  }

  container.innerHTML = registrations.map(reg => `
    <article class="registration-item-card" data-reg-id="${reg.id || reg.registrationId}">
      <div class="reg-card-content">
        <div class="reg-card-header">
          <div class="reg-title-wrap">
            <span class="reg-category-chip">${reg.eventCategory || 'Event'}</span>
            <h4 class="reg-title">${reg.eventTitle}</h4>
          </div>
          <span class="reg-ref-badge" title="Official Registration ID">
            <i data-lucide="ticket" class="inline-icon" aria-hidden="true"></i>
            <span>${reg.registrationId || reg.ticketRef}</span>
          </span>
        </div>

        <div class="reg-card-meta">
          <span class="meta-item">
            <i data-lucide="calendar" class="inline-icon" aria-hidden="true"></i>
            <span>${reg.eventDate || ''} (${reg.eventTime || 'TBA'})</span>
          </span>
          <span class="meta-item">
            <i data-lucide="map-pin" class="inline-icon" aria-hidden="true"></i>
            <span>${reg.eventVenue || ''}</span>
          </span>
        </div>

        <div class="reg-card-user">
          <span class="reg-user-item">
            <i data-lucide="user" class="inline-icon" aria-hidden="true"></i>
            Participant: <strong>${reg.fullName || reg.name}</strong> (${reg.email})
          </span>
          <span class="reg-date-item">
            <i data-lucide="calendar-check-2" class="inline-icon" aria-hidden="true"></i>
            Registered on: <strong>${formatRegistrationDate(reg.registrationDate || reg.createdAt)}</strong>
          </span>
        </div>
      </div>

      <div class="reg-card-actions">
        <button
          type="button"
          class="btn btn-ghost btn-sm reg-view-pass-btn"
          data-view-pass-id="${reg.id || reg.registrationId}"
          aria-label="View pass voucher for ${reg.eventTitle}"
        >
          <i data-lucide="eye" class="btn-icon-xs" aria-hidden="true"></i>
          <span>View Pass</span>
        </button>
        <button
          type="button"
          class="btn btn-danger-ghost btn-sm reg-cancel-btn"
          data-cancel-id="${reg.id || reg.registrationId}"
          aria-label="Cancel registration for ${reg.eventTitle}"
        >
          <i data-lucide="trash-2" class="btn-icon-xs" aria-hidden="true"></i>
          <span>Cancel</span>
        </button>
      </div>
    </article>
  `).join('');

  // Wire View Pass Buttons
  container.querySelectorAll('.reg-view-pass-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const regId = btn.dataset.viewPassId;
      if (typeof onViewPass === 'function') {
        onViewPass(regId);
      }
    });
  });

  // Wire Cancel Buttons
  container.querySelectorAll('.reg-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const regId = btn.dataset.cancelId;
      if (typeof onCancelRegistration === 'function') {
        onCancelRegistration(regId);
      }
    });
  });
}
