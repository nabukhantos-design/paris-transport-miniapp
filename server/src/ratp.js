// Простые обёртки над публичным RATP API (pierre-grimaud)
const BASE = 'https://api-ratp.pierre-grimaud.fr/v4';


export async function fetchArrivals({ mode, line, stop, dir }) {
// mode: 'bus' | 'metros' | 'rers' | 'tramways'
const u = `${BASE}/schedules/${encodeURIComponent(mode)}/${encodeURIComponent(line)}/${encodeURIComponent(stop)}/${encodeURIComponent(dir)}`;
const res = await fetch(u);
if (!res.ok) throw new Error(`RATP schedules HTTP ${res.status}`);
const j = await res.json();
const raw = j?.result?.schedules || [];
const arrivals = raw.map(r => ({ message: r.message, destination: r.destination }));
return { arrivals };
}


export async function fetchLineStatus({ mode, line }) {
try {
const u = `${BASE}/traffic/${encodeURIComponent(mode)}/${encodeURIComponent(line)}`;
const res = await fetch(u);
if (!res.ok) return { lineStatusText: '' };
const j = await res.json();
const s = j?.result?.title || '';
return { lineStatusText: s };
} catch {
return { lineStatusText: '' };
}
}
