/**
 * ParkWise — API Helper
 * All fetch calls to the Flask backend go through here.
 */

const API_BASE = window.location.origin;

async function apiFetch(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!resp.ok) throw new Error(`API ${resp.status}: ${resp.statusText}`);
    return await resp.json();
  } catch (err) {
    console.error(`[API] ${endpoint} failed:`, err);
    throw err;
  }
}

/* ---- GET helpers ---- */
const api = {
  // Core endpoints
  getStats: () => apiFetch('/stats'),
  getTopHotspots: () => apiFetch('/top-hotspots'),
  getModelReport: () => apiFetch('/model-report'),
  getForecast: (params = '') => apiFetch(`/forecast${params ? '?' + params : ''}`),
  getPatrolPriority: (params = '') => apiFetch(`/patrol-priority${params ? '?' + params : ''}`),
  getHotspots: (limit = 20) => apiFetch(`/hotspots?limit=${limit}`),

  // Congestion model helpers
  getCongestionHeatmap: () => fetch(`${API_BASE}/congestion/heatmap`).then(r => r.text()),
  getCongestionZoneSummary: (params = '') => apiFetch(`/congestion/zone-summary${params ? '?' + params : ''}`),
  getCongestionTopHotspots: () => fetch(`${API_BASE}/congestion/top-hotspots`).then(r => r.text()),

  // POST helpers
  computeCRI: (data) => apiFetch('/cri', { method: 'POST', body: JSON.stringify(data) }),
  computeIPS: (data) => apiFetch('/ips', { method: 'POST', body: JSON.stringify(data) }),
  computeEIS: (data) => apiFetch('/eis', { method: 'POST', body: JSON.stringify(data) }),
};
