const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getHealth() {
  return request("/health");
}

export async function getParcels(bbox = null) {
  if (bbox) {
    const { minX, minY, maxX, maxY } = bbox;
    return request(`/parcels?min_x=${minX}&min_y=${minY}&max_x=${maxX}&max_y=${maxY}`);
  }
  return request("/parcels");
}

export async function getParcelStats() {
  return request("/parcels/stats");
}

export async function analyzeParcels(provider = "ollama") {
  return request("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  });
}

export function getReportUrl() {
  return `${BASE}/report`;
}
