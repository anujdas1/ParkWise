// quality.js - Handles Enforcement Quality page logic

document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('quality');

  const tbody = document.getElementById('qualityBody');

  try {
    // Fetch data from our new endpoint
    const response = await api.getEnforcementQuality();
    
    if (!response.data || response.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading">No quality data available.</td></tr>';
      return;
    }

    // Populate table
    tbody.innerHTML = '';
    response.data.forEach(zone => {
      const isHighRisk = zone.rejection_rate >= 30.0;
      const isMediumRisk = zone.rejection_rate >= 20.0 && zone.rejection_rate < 30.0;
      
      let colorCode = '#10b981'; // Green
      let bgCode = 'rgba(16, 185, 129, 0.1)';
      if (isHighRisk) {
        colorCode = '#ef4444'; // Red
        bgCode = 'rgba(239, 68, 68, 0.1)';
      } else if (isMediumRisk) {
        colorCode = '#f59e0b'; // Amber/Yellow
        bgCode = 'rgba(245, 158, 11, 0.1)';
      }
      
      const tr = document.createElement('tr');
      tr.style.animation = 'fadeInUp 0.3s ease-out both';
      
      tr.innerHTML = `
        <td style="font-weight: 600;">${zone.zone_name}</td>
        <td>${zone.total_violations}</td>
        <td style="color: ${colorCode}; font-weight: 600;">
          ${zone.rejection_rate}%
        </td>
        <td>
          <div style="display:flex; align-items:center; gap: 0.5rem;">
            <div style="flex:1; background: var(--bg-surface-2); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="width: ${zone.quality_score}%; background: ${colorCode}; height: 100%;"></div>
            </div>
            <span style="font-size:0.85rem; font-weight:600;">${zone.quality_score.toFixed(1)}</span>
          </div>
        </td>
        <td>
          <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; 
            background: ${bgCode};
            color: ${colorCode};">
            ${zone.action}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Failed to load quality metrics:', error);
    tbody.innerHTML = '<tr><td colspan="5" style="color:#ef4444; padding:1rem;">Error loading data.</td></tr>';
  }
});
