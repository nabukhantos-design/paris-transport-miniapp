import { Telegraf, Markup } from 'telegraf';
import { T, tr, LANGS } from './i18n.js';
import { upsertUser, getUserByTgId, addFavorite, removeFavorite } from './db.js';
import { fetchArrivals } from './ratp.js';


export function createBot() {
const bot = new Telegraf(process.env.BOT_TOKEN);
const webAppUrl = process.env.WEBAPP_URL;


bot.start((ctx) => {
const tgId = ctx.from.id;
const user = upsertUser.get(tgId, ctx.from.language_code || 'ru');
return ctx.reply(
tr(user, 'start'),
Markup.inlineKeyboard([
Markup.button.webApp(tr(user, 'open_app'), webAppUrl)
])
);
});


bot.hears(/^\/lang\s+(ru|fr|en)$/i, (ctx) => {
const lang = ctx.match[1].toLowerCase();
const tgId = ctx.from.id;
const user = getUserByTgId.get(tgId);
if (!user) upsertUser.get(tgId, lang);
else {
const stmt = require('./db.js');
}
// небольшой хак без циклических импортов:
import('./db.js').then(({ setUserLang, getUserByTgId }) => {
setUserLang.run(lang, tgId);
const u = getUserByTgId.get(tgId);
const map = { ru: T.ru.lang_set, fr: T.fr.lang_set, en: T.en.lang_set };
ctx.reply(map[lang] || 'OK');
});
});


bot.help((ctx) => {
const user = getUserByTgId.get(ctx.from.id);
ctx.reply(tr(user, 'help'));
});


// WebApp sendData handler
bot.on('text', async (ctx, next) => {
const data = ctx.message?.web_app_data?.data;
if (!data) return next();
const payload = JSON.parse(data);
const tgId = ctx.from.id;
const user = getUserByTgId.get(tgId) || upsertUser.get(tgId, ctx.from.language_code || 'ru');


if (payload.action === 'favorite:add') {
const { mode, line, stop, dir, title } = payload;
try {
addFavorite.run(user.id, mode, line, stop, dir, title || null);
await ctx.reply(tr(user, 'fav_added'));
} catch (e) {
await ctx.reply(tr(user, 'fav_exists'));
}
return;
}


if (payload.action === 'favorite:remove') {
const { mode, line, stop, dir } = payload;
removeFavorite.run(user.id, mode, line, stop, dir);
await ctx.reply(tr(user, 'fav_removed'));
return;
}


if (payload.action === 'alert:create') {
// Добавим напоминание через jobs (импорт по месту)
const { mode, line, stop, dir, threshold_min = 5 } = payload;
const { addUserAlert } = await import('./jobs.js');
await addUserAlert(user.id, { mode, line, stop, dir, threshold_min });
await ctx.reply(tr(user, 'alert_created', { min: threshold_min }));
return;
}


if (payload.action === 'debug:now') {
const { mode, line, stop, dir } = payload;
const { arrivals } = await fetchArrivals({ mode, line, stop, dir });
await ctx.reply(JSON.stringify(arrivals.slice(0,3), null, 2));
return;
}
});


return bot;
}
