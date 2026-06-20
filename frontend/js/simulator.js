/**
 * ParkWise — Simulator Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('simulator');

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";

  const ctx = document.getElementById('simChart').getContext('2d');
  let simChart;
  let topZones = [];
  let baseTotalEIS = 0;

  // DOM Elements
  const sliderK = document.getElementById('sliderK');
  const valK = document.getElementById('valK');
  const sliderCompliance = document.getElementById('sliderCompliance');
  const valCompliance = document.getElementById('valCompliance');
  
  const valReduction = document.getElementById('valReduction');
  const valBefore = document.getElementById('valBefore');
  const valAfter = document.getElementById('valAfter');
  const barAfter = document.getElementById('barAfter');

  const updateSimulation = () => {
    if (topZones.length === 0) return;

    const k = parseInt(sliderK.value);
    const compliance = parseInt(sliderCompliance.value) / 100;

    valK.textContent = k;
    valCompliance.textContent = (compliance * 100) + '%';

    // Calculate new distribution
    const simulatedData = [...topZones];
    let newTotalEIS = baseTotalEIS;

    for (let i = 0; i < k; i++) {
      const reduction = simulatedData[i].predicted_EIS * compliance;
      newTotalEIS -= reduction;
      simulatedData[i] = {
        ...simulatedData[i],
        simulated_EIS: simulatedData[i].predicted_EIS - reduction
      };
    }

    // Unpatrolled zones remain the same
    for (let i = k; i < simulatedData.length; i++) {
      simulatedData[i] = {
        ...simulatedData[i],
        simulated_EIS: simulatedData[i].predicted_EIS
      };
    }

    // Update stats
    const pctReduction = ((baseTotalEIS - newTotalEIS) / baseTotalEIS) * 100;
    valReduction.textContent = '-' + pctReduction.toFixed(1) + '%';
    valBefore.textContent = Math.round(baseTotalEIS).toLocaleString();
    valAfter.textContent = Math.round(newTotalEIS).toLocaleString();
    barAfter.style.width = (newTotalEIS / baseTotalEIS * 100) + '%';

    // Update Chart
    if (simChart) simChart.destroy();

    simChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: simulatedData.slice(0, 20).map((z, i) => `#${i+1}`),
        datasets: [
          {
            label: 'Original EIS',
            data: simulatedData.slice(0, 20).map(z => z.predicted_EIS),
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
            borderWidth: 1
          },
          {
            label: 'Simulated EIS (After Patrols)',
            data: simulatedData.slice(0, 20).map(z => z.simulated_EIS),
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: (ctx) => `Rank ${ctx[0].label} — ${simulatedData[ctx[0].dataIndex].zone_name || simulatedData[ctx[0].dataIndex].zone_id}`
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  };

  // Event listeners
  sliderK.addEventListener('input', updateSimulation);
  sliderCompliance.addEventListener('input', updateSimulation);

  // Load data
  try {
    const resp = await api.getTopHotspots();
    topZones = resp.hotspots || [];
    baseTotalEIS = topZones.reduce((sum, z) => sum + z.predicted_EIS, 0);
    updateSimulation();
  } catch (err) {
    console.error('Failed to load simulator data', err);
  }
});
