import cron from 'node-cron';
import { listActiveAlerts, addAlert, deactivateAlert, getUserByTgId } from './db.js';
import db, { getUserByTgId as getUserByTgIdStmt } from './db.js';
import { fetchArrivals } from './ratp.js';
import { T } from './i18n.js';
import { Telegraf } from 'telegraf';


const bot = new Telegraf(process.env.BOT_TOKEN);


export async function addUserAlert(userId, { mode, line, stop, dir, threshold_min }) {
addAlert.run(userId, mode, line, stop, dir, threshold_min);
}


// Каждую минуту проверяем активные напоминания
cron.schedule('* * * * *', async () => {
try {
const alerts = listActiveAlerts.all();
for (const a of alerts) {
try {
const { arrivals } = await fetchArrivals({ mode: a.mode, line: a.line, stop: a.stop, dir: a.dir });
if (!arrivals?.length) continue;
const first = arrivals[0]?.message || '';
const mins = parseFirstMinutes(first); // '3 mn' -> 3
if (mins !== null && mins <= a.threshold_min) {
// Уведомляем и деактивируем
const user = db.prepare('SELECT * FROM users WHERE id=?').get(a.user_id);
const title = `${a.mode.toUpperCase()} ${a.line} • ${a.stop} (${a.dir})`;
const msg = first + (arrivals[1]?.message ? `, next: ${arrivals[1].message}` : '');
const lang = user?.lang || 'en';
const text = (T[lang].alert_fired?.(title, msg)) || `⏰ ${title}\n${msg}`;
await bot.telegram.sendMessage(user.tg_id, text);
deactivateAlert.run(a.id);
}
} catch (e) {
// глотаем ошибки по отдельным алертам
}
}
} catch (e) {
// noop
}
});


function parseFirstMinutes(s) {
if (!s) return null;
const m = /^(\d+)\s*mn/i.exec(s);
if (m) return parseInt(m[1], 10);
if (/^(a|à)\s*l'approche|approche|imm\.?/i.test(s)) return 0; // на подходе
return null;
}
