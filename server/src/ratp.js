// Простые обёртки над публичным RATP API (pierre-grimaud) + fallback на демо-данные
const BASE = 'https://api-ratp.pierre-grimaud.fr/v4';

function demoArrivals() {
  // Демо: имитация трёх ближайших прибытий
  return {
    arrivals: [
      { message: '3 mn',  destination: 'Porte d\'Orléans' },
      { message: '12 mn', destination: 'Porte d\'Orléans' },
      { message: '22 mn', destination: 'Porte d\'Orléans' }
    ]
  };
}

export async function fetchArrivals({ mode, line, stop, dir }) {
  const u = `${BASE}/schedules/${encodeURIComponent(mode)}/${encodeURIComponent(line)}/${encodeURIComponent(stop)}/${encodeURIComponent(dir)}`;
  try {
    const res = await fetch(u);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`RATP schedules HTTP ${res.status}: ${text}`);
    }
    const j = await res.json();
    const raw = j?.result?.schedules || [];
    const arrivals = raw.map(r => ({ message: r.message, destination: r.destination }));
    return { arrivals };
  } catch (e) {
    console.warn('[fetchArrivals] fallback to demo due to error:', e?.message || e);
    return demoArrivals();
  }
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
