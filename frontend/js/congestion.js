// congestion.js – Handles Congestion model UI interactions

document.addEventListener('DOMContentLoaded', async () => {
  initSidebar('congestion');

  // ── 1. Congestion Heatmap ──────────────────────────────────────────────
  try {
    const heatmapHTML = await api.getCongestionHeatmap();
    const heatmapContainer = document.getElementById('heatmapContainer');
    if (heatmapContainer) {
      if (heatmapHTML && heatmapHTML.trim().length > 0) {
        // FIX: inject HTML into an iframe so scripts/styles inside it work correctly
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        heatmapContainer.appendChild(iframe);
        // Write the full HTML document into the iframe
        iframe.contentDocument.open();
        iframe.contentDocument.write(heatmapHTML);
        iframe.contentDocument.close();
      } else {
        heatmapContainer.innerHTML = '<p style="color:var(--text-muted);padding:1rem">No heatmap data available.</p>';
      }
    }
  } catch (e) {
    console.error('Failed to load congestion heatmap:', e);
  }



  // ── 3. Top 20 Congestion Hotspots HTML ────────────────────────────────
  try {
    const hotspotsHTML = await api.getCongestionTopHotspots();
    const hotspotsContainer = document.getElementById('topHotspotsContainer');
    if (hotspotsContainer) {
      if (hotspotsHTML && hotspotsHTML.trim().length > 0) {
        // FIX: also use iframe here so embedded styles/scripts render properly
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        hotspotsContainer.appendChild(iframe);
        iframe.contentDocument.open();
        iframe.contentDocument.write(hotspotsHTML);
        iframe.contentDocument.close();
      } else {
        hotspotsContainer.innerHTML = '<p style="color:var(--text-muted);padding:1rem">No hotspot data available.</p>';
      }
    }
  } catch (e) {
    console.error('Failed to load congestion top hotspots:', e);
  }

}); // end of DOMContentLoaded
