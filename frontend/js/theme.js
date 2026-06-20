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

// -----------------------------------------------------------------------------
// Intersection Observer for Smooth Scrolling Animations
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Target generic content blocks, cards, and text that should fade in
  const fadeSelectors = '.card, .module-card, .features-overview, .stats-grid > div';
  const fadeElements = document.querySelectorAll(fadeSelectors);

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  };

  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => {
    el.classList.add('scroll-fade');
    fadeObserver.observe(el);
  });
});

function getMapTileUrl(theme) { return theme === 'light' ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; }
