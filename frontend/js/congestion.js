// congestion.js – Handles Congestion model UI interactions

// Ensure the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize sidebar navigation (existing helper)
  initSidebar('congestion');

  // Load and inject the heatmap HTML
  try {
    const heatmapHTML = await api.getCongestionHeatmap();
    const heatmapContainer = document.getElementById('heatmapContainer');
    if (heatmapContainer) {
      heatmapContainer.innerHTML = heatmapHTML;
    }
  } catch (e) {
    console.error('Failed to load congestion heatmap:', e);
  }

  // Load zone summary JSON and populate the table
  try {
    const resp = await api.getCongestionZoneSummary();
    // The API returns { zone_summary: [...] }
    const data = resp.zone_summary || [];
    const tbody = document.querySelector('#zoneSummaryTable tbody');
    if (tbody) {
      tbody.innerHTML = '';
      data.forEach(zone => {
        const tr = document.createElement('tr');
        const tdId = document.createElement('td');
        tdId.textContent = zone.zone_id ?? zone.zoneId ?? '';
        const tdEIS = document.createElement('td');
        tdEIS.textContent = zone.predicted_EIS ?? zone.EIS ?? '';
        const tdInfo = document.createElement('td');
        // Include any additional fields (e.g., latitude/longitude)
        const extra = [];
        if (zone.zone_lat) extra.push(`Lat: ${zone.zone_lat}`);
        if (zone.zone_lon) extra.push(`Lon: ${zone.zone_lon}`);
        tdInfo.textContent = extra.join(' | ');
        tr.appendChild(tdId);
        tr.appendChild(tdEIS);
        tr.appendChild(tdInfo);
        tbody.appendChild(tr);
      });
    }
  } catch (e) {
    console.error('Failed to load congestion zone summary:', e);
  }
  // Load top 20 congestion hotspots HTML
  try {
    const hotspotsHTML = await api.getCongestionTopHotspots();
    const hotspotsContainer = document.getElementById('topHotspotsContainer');
    if (hotspotsContainer) {
      hotspotsContainer.innerHTML = hotspotsHTML;
    }
  } catch (e) {
    console.error('Failed to load congestion top hotspots:', e);
  }
}); // end of DOMContentLoaded
