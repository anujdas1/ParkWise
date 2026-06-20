/**
 * ParkWise — Priorities Table Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('priorities');

  const shiftSelect = document.getElementById('shiftSelect');
  const tbody = document.getElementById('priorityBody');

  const loadData = async (shiftFilter = '') => {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading priority data…</td></tr>';
    
    try {
      const resp = await api.getPatrolPriority(`shift=${shiftFilter}`);
      const data = resp.patrol_priority || [];

      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No priorities found</td></tr>';
        return;
      }

      if (shiftFilter === '') {
        // Sort globally by EIS descending
        data.sort((a, b) => b.predicted_EIS - a.predicted_EIS);
      }

      // Group by shift to calculate ranks within the shift, if filtered
      let currentShift = '';
      let rank = 1;

      tbody.innerHTML = data.map(d => {
        if (shiftFilter !== '') {
          if (d.shift !== currentShift) {
            currentShift = d.shift;
            rank = 1;
          }
        }

        const isMorning = d.shift.toLowerCase().includes('morning');
        const shiftBadge = isMorning ? 'tag-accent' : 'tag-warning';
        const shiftName = isMorning ? 'Morning' : 'Evening';
        
        const eis = d.predicted_EIS;
        const riskBadge = eis > 100 ? 'danger' : eis > 20 ? 'warning' : 'success';

        const row = `<tr>
          <td class="rank-cell">#${rank}</td>
          <td><span class="tag ${shiftBadge}">${shiftName}</span></td>
          <td><strong>${d.zone_name || '-'}</strong></td>
          <td class="mono" style="font-size:0.8rem;color:#64748b">${d.zone_id}</td>
          <td><span class="tag tag-${riskBadge}">${eis.toFixed(1)}</span></td>
          <td><a href="hotspots.html" style="font-size:0.75rem">View Map &rarr;</a></td>
        </tr>`;
        
        rank++;
        return row;
      }).join('');

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--danger)">Failed to load data</td></tr>';
    }
  };

  shiftSelect.addEventListener('change', (e) => loadData(e.target.value));
  
  // Initial load
  loadData();
});
