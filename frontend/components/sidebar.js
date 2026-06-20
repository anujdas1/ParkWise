/**
 * ParkWise — Sidebar Component (injected into every page)
 */

const SIDEBAR_HTML = `
<aside class="sidebar">
  <div class="sidebar-brand">
    <span class="brand-sub">Impact Matrix</span>
    <div class="brand-name">Park<span>Wise</span></div>
  </div>
  <ul class="sidebar-nav">
    <li>
      <a href="dashboard.html" data-page="dashboard">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
        Dashboard
      </a>
    </li>
    <li>
      <a href="hotspots.html" data-page="hotspots">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
        Hotspots
      </a>
    </li>
    <li>
      <a href="forecast.html" data-page="forecast">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
        Forecast
      </a>
    </li>
    <li>
      <a href="priorities.html" data-page="priorities">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        Priority Zones
      </a>
    </li>
    <li>
      <a href="simulator.html" data-page="simulator">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.25.023.5.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
        Simulator
      </a>
    </li>
    <li>
      <a href="analytics.html" data-page="analytics">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
        Analytics
      </a>
    </li>
        <li>
          <a href="congestion.html" data-page="congestion">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
            Congestion
          </a>
        </li>
        <li>
          <a href="zone_summary.html" data-page="zone_summary">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3h5.25m-5.25 3h5.25" /></svg>
            Zone Summary
          </a>
        </li>
      </ul>
      
      <div style="padding: 1.5rem 1.25rem; margin-top: auto; border-top: 1px solid var(--sidebar-border);">
        <label for="themeSwitcher" style="font-size: 0.75rem; color: var(--sidebar-text-secondary); display: block; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Theme</label>
        <select id="themeSwitcher" style="width: 100%; background: var(--sidebar-theme-bg, var(--bg-surface-2)); border: 1px solid var(--sidebar-border); color: var(--sidebar-text-primary); border-radius: var(--radius-sm); padding: 0.5rem; font-size: 0.8rem;">
          <option value="dark">Dark Mode</option>
          <option value="light">Light Mode</option>
        </select>
      </div>
</aside>`;

function initSidebar(activePage) {
  document.body.insertAdjacentHTML('afterbegin',
    '<div class="app-layout">' + SIDEBAR_HTML + '<main class="main-content fade-in">'
  );

  // Move all existing body children (except the layout wrapper) into main-content
  const mainContent = document.querySelector('.main-content');
  const appLayout = document.querySelector('.app-layout');
  const children = Array.from(document.body.children).filter(el => el !== appLayout);
  children.forEach(child => mainContent.appendChild(child));

  // Close the layout wrapper
  document.body.appendChild(document.createTextNode(''));

  // Mark active page
  const activeLink = document.querySelector(`[data-page="${activePage}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Setup theme switcher
  const themeSelect = document.getElementById('themeSwitcher');
  if (themeSelect && typeof getTheme === 'function') {
    themeSelect.value = getTheme();
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }
}
