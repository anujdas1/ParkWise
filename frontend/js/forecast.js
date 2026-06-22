/**
 * DarogaDesk — Forecast Chart Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('forecast');

  // Chart setup
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";

  const ctx = document.getElementById('forecastChart').getContext('2d');
  let forecastChart;

  const renderChart = (data) => {
    if (forecastChart) forecastChart.destroy();

    const labels = data.map(d => new Date(d.hour_bucket).toLocaleTimeString([], {hour: '2-digit'}));
    const eisValues = data.map(d => d.predicted_EIS);
    const probValues = data.map(d => d.p_occur * 100);

    forecastChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Predicted EIS',
            data: eisValues,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Occurrence Prob (%)',
            data: probValues,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { 
            type: 'linear', display: true, position: 'left',
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y1: {
            type: 'linear', display: true, position: 'right',
            grid: { drawOnChartArea: false },
            suggestedMin: 0, suggestedMax: 100
          }
        }
      }
    });
  };

  // Load Data
  try {
    const [reportResp, topResp] = await Promise.all([
      api.getModelReport(),
      api.getTopHotspots()
    ]);

    const report = reportResp.model_evaluation || {};
    
    // Update metrics
    document.getElementById('valMAE').textContent = report.hurdle_model_mae != null ? report.hurdle_model_mae.toFixed(3) : '—';
    document.getElementById('valRMSE').textContent = report.hurdle_model_rmse != null ? report.hurdle_model_rmse.toFixed(3) : '—';
    document.getElementById('valMAEImp').textContent = report.mae_improvement_vs_naive_pct != null ? report.mae_improvement_vs_naive_pct.toFixed(1) + '%' : '—';
    document.getElementById('valRMSEImp').textContent = report.rmse_improvement_vs_naive_pct != null ? report.rmse_improvement_vs_naive_pct.toFixed(1) + '%' : '—';

    // Populate zone select
    const topZones = topResp.hotspots || [];
    const select = document.getElementById('zoneSelect');
    
    if (topZones.length > 0) {
      select.innerHTML = topZones.slice(0, 20).map(z => 
        `<option value="${z.zone_id}">${z.zone_name || z.zone_id} (EIS: ${z.predicted_EIS.toFixed(0)})</option>`
      ).join('');

      // Load initial zone
      const loadZoneForecast = async (zoneId) => {
        const fResp = await api.getForecast(`zone_id=${zoneId}`);
        renderChart(fResp.forecast || []);
      };

      select.addEventListener('change', (e) => loadZoneForecast(e.target.value));
      loadZoneForecast(topZones[0].zone_id); // Load #1 automatically
    } else {
      select.innerHTML = '<option>No zones found</option>';
    }

  } catch (err) {
    console.error('Failed to load forecast data', err);
  }
});

