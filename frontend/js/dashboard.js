/**
 * ParkWise — Dashboard Page Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('dashboard');

  // Fetch all data in parallel
  const [hotspotsResp, reportResp] = await Promise.all([
    api.getTopHotspots().catch(() => ({ hotspots: [] })),
    api.getModelReport().catch(() => ({ model_evaluation: {} })),
  ]);

  // Try stats (may fail if MongoDB not connected)
  let statsResp = { total_records: '—', unique_locations: '—' };
  try { statsResp = await api.getStats(); } catch {}

  const hotspots = hotspotsResp.hotspots || [];
  const report = reportResp.model_evaluation || {};

  // ---- Populate stats ----
  document.getElementById('statRecords').textContent =
    typeof statsResp.total_records === 'number' ? statsResp.total_records.toLocaleString() : '—';
  document.getElementById('statLocations').textContent =
    typeof statsResp.unique_locations === 'number' ? statsResp.unique_locations.toLocaleString() : '—';
  document.getElementById('statTopEIS').textContent =
    hotspots.length ? hotspots[0].predicted_EIS.toFixed(1) : '—';
  document.getElementById('statAUC').textContent =
    report.occurrence_auc ? report.occurrence_auc.toFixed(4) : '—';

  // ---- Populate table ----
  const tbody = document.getElementById('hotspotsBody');
  if (hotspots.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No data available</td></tr>';
  } else {
    tbody.innerHTML = hotspots.map((h, i) => {
      const risk = h.predicted_EIS > 800 ? 'danger' : h.predicted_EIS > 500 ? 'warning' : 'success';
      return `<tr>
        <td class="rank-cell">${i + 1}</td>
        <td class="mono">${h.zone_id}</td>
        <td>${h.zone_lat}</td>
        <td>${h.zone_lon}</td>
        <td><span class="tag tag-${risk}">${h.predicted_EIS.toFixed(1)}</span></td>
      </tr>`;
    }).join('');
  }

  // ---- Map ----
  const map = L.map('dashboardMap', {
    zoomControl: true,
    attributionControl: true,
  }).setView([12.97, 77.59], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  // Add hotspot markers
  const maxEIS = Math.max(...hotspots.map(h => h.predicted_EIS), 1);
  hotspots.forEach((h, i) => {
    const intensity = Math.min(h.predicted_EIS / maxEIS, 1);
    const radius = 6 + intensity * 18;
    const color = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : '#10b981';

    L.circleMarker([h.zone_lat, h.zone_lon], {
      radius,
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.35,
    })
    .bindPopup(`
      <div style="font-family:Inter,sans-serif;font-size:0.8rem">
        <strong style="color:${color}">#${i+1} — ${h.zone_id}</strong><br>
        <span style="color:#94a3b8">Predicted EIS:</span> <strong>${h.predicted_EIS.toFixed(1)}</strong><br>
        <span style="color:#94a3b8">Lat:</span> ${h.zone_lat} &nbsp; <span style="color:#94a3b8">Lon:</span> ${h.zone_lon}
      </div>
    `)
    .addTo(map);
  });
});
