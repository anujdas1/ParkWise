// zone_summary.js – Handles Zone EIS Summary UI interactions

document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('zone_summary');

  // ── Zone EIS Summary Table ──────────────────────────────────────────
  try {
    const resp = await api.getCongestionZoneSummary();
    const data = resp.zone_summary || [];
    const tbody = document.querySelector('#zoneSummaryTable tbody');
    const thead = document.querySelector('#zoneSummaryTable thead tr');
    if (thead) {
      thead.innerHTML = `
        <th>Rank</th>
        <th>Zone ID</th>
        <th>Total EIS</th>
        <th>Violations</th>
        <th>Dominant Violation</th>
        <th>Primary Vehicle</th>
        <th>Nearest Junction</th>
      `;
    }

    if (tbody) {
      tbody.innerHTML = '';
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No data available</td></tr>';
      } else {
        data.forEach(zone => {
          const tr = document.createElement('tr');
          const eis = zone.total_eis ?? zone.predicted_EIS ?? zone.EIS ?? '';
          const eisFormatted = typeof eis === 'number' ? eis.toLocaleString(undefined, {maximumFractionDigits: 1}) : eis;
          tr.innerHTML = `
            <td style="color:var(--accent);font-weight:600">${zone.eis_rank ?? ''}</td>
            <td class="mono">${zone.zone_name || zone.zone_id || ''}</td>
            <td style="color:#06b6d4;font-weight:600">${eisFormatted}</td>
            <td>${zone.violation_count?.toLocaleString() ?? ''}</td>
            <td>${zone.dominant_violation_type ?? ''}</td>
            <td>${zone.primary_vehicle_type ?? ''}</td>
            <td style="color:var(--text-muted);font-size:0.85em">${zone.nearest_junction ?? ''}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  } catch (e) {
    console.error('Failed to load congestion zone summary:', e);
  }

});

