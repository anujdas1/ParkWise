/**
 * ParkWise Theme Switcher
 * Handles switching between Corporate Trust Dark and Light modes.
 */

const THEMES = ['dark', 'light'];

function initTheme() {
  const savedTheme = localStorage.getItem('parkwise-theme') || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(themeName) {
  if (!THEMES.includes(themeName)) themeName = 'dark';
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('parkwise-theme', themeName);
  
  // Dispatch a custom event in case charts or maps need to redraw
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
}

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

// Execute immediately to prevent flash of wrong theme
initTheme();
