const tg = window.Telegram?.WebApp;


async function load() {
const dict = window.I18N[state.lang] || window.I18N.en;
$('#status').textContent = dict.updating;
$('#list').innerHTML = '';
try {
const url = `/api/arrivals?mode=${encodeURIComponent(state.mode)}&line=${encodeURIComponent(state.line)}&stop=${encodeURIComponent(state.stop)}&dir=${encodeURIComponent(state.dir)}`;
const res = await fetch(url, { headers: tg?.initData ? { 'X-Telegram-Init-Data': tg.initData } : {} });
if (!res.ok) throw new Error('HTTP '+res.status);
const data = await res.json();
$('#status').textContent = data.lineStatusText || '';


if (!data.arrivals?.length) {
$('#list').innerHTML = `<div class="row"><div class="dest">${dict.empty}</div></div>`;
return;
}


for (const a of data.arrivals) {
const row = document.createElement('div');
row.className = 'row';
row.innerHTML = `
<div class="time">${a.message || '—'}</div>
<div class="dest">${a.destination || ''}</div>
${a.next ? `<div class="next">${a.next.join(' • ')}</div>` : ''}
`;
$('#list').appendChild(row);
}
} catch (e) {
$('#status').textContent = '';
const dict = window.I18N[state.lang] || window.I18N.en;
$('#list').innerHTML = `<div class="row"><div class="dest">${dict.error}</div><div class="next small">${e.message}</div></div>`;
}
}


async function saveFavorite() {
const dict = window.I18N[state.lang] || window.I18N.en;
if (tg) {
tg.MainButton?.setText('★');
tg.MainButton?.show();
tg.sendData(JSON.stringify({
action: 'favorite:add',
title: `${state.mode.toUpperCase()} ${state.line} → ${state.stop} (${state.dir})`,
mode: state.mode,
line: state.line,
stop: state.stop,
dir: state.dir
}));
}
try {
// Параллельно сохраним через REST (если доступна подпись initData)
await fetch('/api/favorites', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
...(tg?.initData ? { 'X-Telegram-Init-Data': tg.initData } : {})
},
body: JSON.stringify({
title: `${state.mode.toUpperCase()} ${state.line} → ${state.stop} (${state.dir})`,
mode: state.mode, line: state.line, stop: state.stop, dir: state.dir
})
});
toast(dict.saved);
} catch {}
}


function toast(text) {
if (tg?.showPopup) return tg.showPopup({ title: 'OK', message: text });
const d = document.createElement('div');
d.textContent = text; d.style.position='fixed'; d.style.bottom='16px'; d.style.left='50%'; d.style.transform='translateX(-50%)'; d.style.padding='8px 12px'; d.style.background='var(--card)'; d.style.borderRadius='12px'; d.style.boxShadow='0 2px 8px rgba(0,0,0,.1)';
document.body.appendChild(d); setTimeout(()=>d.remove(), 1500);
}


load(); startAuto();
