/**
 * ParkWise — Hotspots Map Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('hotspots');

  const map = L.map('hotspotsMap', {
    zoomControl: true,
    attributionControl: true,
  }).setView([12.97, 77.59], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  let allData = [];
  let markers = [];

  // Controls
  const highRiskToggle = document.getElementById('highRiskOnly');
  const colorBySelect = document.getElementById('colorBy');

  // Draw markers function
  const drawMarkers = () => {
    // Clear existing
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const highRiskOnly = highRiskToggle.checked;
    const colorBy = colorBySelect.value;

    const maxEIS = Math.max(...allData.map(d => d.predicted_EIS), 1);
    const maxProb = Math.max(...allData.map(d => d.p_occur), 1);

    allData.forEach(d => {
      if (highRiskOnly && d.predicted_EIS <= 5) return;

      let intensity, color, valueLabel, value;
      
      if (colorBy === 'eis') {
        intensity = Math.min(d.predicted_EIS / maxEIS, 1);
        value = d.predicted_EIS.toFixed(1);
        valueLabel = 'Predicted EIS';
        color = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : '#10b981';
      } else {
        intensity = Math.min(d.p_occur / maxProb, 1);
        value = (d.p_occur * 100).toFixed(1) + '%';
        valueLabel = 'Occurrence Prob.';
        // Use a blueish scale for probability
        color = intensity > 0.7 ? '#06b6d4' : intensity > 0.4 ? '#3b82f6' : '#6366f1';
      }

      const radius = 5 + intensity * 15;

      const marker = L.circleMarker([d.zone_lat, d.zone_lon], {
        radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.35,
      })
      .bindPopup(`
        <div style="font-family:Inter,sans-serif;font-size:0.8rem">
          <strong style="color:${color}">Zone: ${d.zone_name || d.zone_id}</strong><br>
          <span style="color:#94a3b8">${valueLabel}:</span> <strong>${value}</strong><br>
          <span style="color:#94a3b8">Lat:</span> ${d.zone_lat} &nbsp; <span style="color:#94a3b8">Lon:</span> ${d.zone_lon}
        </div>
      `);
      
      marker.addTo(map);
      markers.push(marker);
    });
  };

  // Event listeners
  highRiskToggle.addEventListener('change', drawMarkers);
  colorBySelect.addEventListener('change', drawMarkers);

  // Load data
  try {
    const resp = await api.getForecast('limit=5000');
    allData = resp.forecast || [];
    drawMarkers();
  } catch (err) {
    console.error('Failed to load hotspots', err);
  }
});
