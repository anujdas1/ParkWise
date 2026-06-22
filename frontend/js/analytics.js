/**
 * DarogaDesk — Analytics Charts
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('analytics');

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";

  try {
    const [topResp, forecastResp] = await Promise.all([
      api.getTopHotspots(),
      api.getForecast('limit=5000')
    ]);

    const topZones = topResp.hotspots || [];
    const forecast = forecastResp.forecast || [];

    // 1. Risk Distribution (Histogram)
    const bins = [0, 10, 50, 100, 500, 1000, 5000];
    const counts = new Array(bins.length - 1).fill(0);
    
    topZones.forEach(z => {
      const val = z.predicted_EIS;
      for (let i = 0; i < bins.length - 1; i++) {
        if (val >= bins[i] && val < bins[i+1]) {
          counts[i]++;
          break;
        }
      }
    });

    new Chart(document.getElementById('distChart'), {
      type: 'bar',
      data: {
        labels: ['0-10', '10-50', '50-100', '100-500', '500-1k', '1k+'],
        datasets: [{
          label: 'Number of Zones',
          data: counts,
          backgroundColor: 'rgba(6, 182, 212, 0.4)',
          borderColor: '#06b6d4',
          borderWidth: 1
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } }
      }
    });

    // 2. Time of Day (Average EIS per hour bucket across all zones)
    // Map data by hour
    const hourMap = {};
    forecast.forEach(d => {
      const date = new Date(d.hour_bucket);
      const hour = date.getHours();
      if (!hourMap[hour]) hourMap[hour] = { sum: 0, count: 0 };
      hourMap[hour].sum += d.predicted_EIS;
      hourMap[hour].count += 1;
    });

    const hours = Array.from({length: 24}, (_, i) => i);
    const avgEisByHour = hours.map(h => hourMap[h] ? (hourMap[h].sum / hourMap[h].count) : 0);

    new Chart(document.getElementById('timeChart'), {
      type: 'line',
      data: {
        labels: hours.map(h => `${h}:00`),
        datasets: [{
          label: 'Avg EIS across all zones',
          data: avgEisByHour,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { 
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } 
        }
      }
    });

    // 3. Top 30 High-Risk Zones Bar Chart
    const top30 = topZones.slice(0, 30);
    new Chart(document.getElementById('topZonesChart'), {
      type: 'bar',
      data: {
        labels: top30.map((z, i) => `#${i+1}`),
        datasets: [{
          label: 'Cumulative Predicted EIS',
          data: top30.map(z => z.predicted_EIS),
          backgroundColor: top30.map(z => z.predicted_EIS > 500 ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)'),
          borderColor: top30.map(z => z.predicted_EIS > 500 ? '#ef4444' : '#f59e0b'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: (ctx) => `Rank ${ctx[0].label} — Zone: ${top30[ctx[0].dataIndex].zone_name || top30[ctx[0].dataIndex].zone_id}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });

  } catch (err) {
    console.error('Failed to load analytics', err);
  }
});
