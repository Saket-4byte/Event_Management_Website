/**
 * EVENTORA - Theme Controller
 * Manages Dark/Light mode, consistent palettes, system preferences, and LocalStorage persistence.
 */

import { STORAGE_KEYS } from './data.js';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Resolves initial theme based on stored preference or system settings.
 * Defaults to 'dark' (Eventora Dark Navy signature theme).
 * @returns {string} 'dark' | 'light'
 */
export function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === THEME_MODES.LIGHT || savedTheme === THEME_MODES.DARK) {
      return savedTheme;
    }
  } catch (err) {
    console.warn('LocalStorage unavailable for theme lookup:', err);
  }

  // Default to dark navy theme
  return THEME_MODES.DARK;
}

/**
 * Returns currently active theme on document root.
 * @returns {string}
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || THEME_MODES.DARK;
}

/**
 * Applies theme to the document root and persists state to LocalStorage.
 * @param {string} theme - 'dark' | 'light'
 */
export function applyTheme(theme) {
  const targetTheme = theme === THEME_MODES.LIGHT ? THEME_MODES.LIGHT : THEME_MODES.DARK;
  const root = document.documentElement;
  root.setAttribute('data-theme', targetTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    const nextThemeLabel = targetTheme === THEME_MODES.DARK ? 'light' : 'dark';
    toggleBtn.setAttribute('aria-label', `Switch to ${nextThemeLabel} mode`);
    toggleBtn.setAttribute('title', `Switch to ${nextThemeLabel} mode`);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.THEME, targetTheme);
  } catch (err) {
    console.warn('Unable to persist theme to localStorage:', err);
  }
}

/**
 * Toggles between dark and light themes and updates UI trigger buttons.
 * @returns {string} Active theme after toggle
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
  applyTheme(newTheme);
  return newTheme;
}

/**
 * Initializes theme listeners and syncs initial state from LocalStorage.
 * @param {Function} onThemeChange - Optional callback to re-render icons
 */
export function initTheme(onThemeChange) {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  // Watch for system theme changes if user hasn't explicitly set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      try {
        if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
          const systemTheme = e.matches ? THEME_MODES.DARK : THEME_MODES.LIGHT;
          applyTheme(systemTheme);
          if (typeof onThemeChange === 'function') onThemeChange(systemTheme);
        }
      } catch (err) {
        console.warn('Error syncing system theme:', err);
      }
    });
  }
}
