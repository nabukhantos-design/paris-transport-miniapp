export const LANGS = ['ru', 'fr', 'en'];


export const T = {
ru: {
start: 'Привет! Открой мини-приложение, чтобы смотреть прибытия транспорта в реальном времени.',
open_app: 'Открыть мини‑приложение',
choose_lang: 'Выберите язык: /lang ru | /lang fr | /lang en',
lang_set: 'Язык установлен: Русский',
fav_added: 'Добавлено в избранное ✅',
fav_exists: 'Уже в избранном',
fav_removed: 'Удалено из избранного',
alert_created: 'Напоминание создано. Сообщу за {{min}} мин до прибытия 🚍',
alert_fired: (title, msg) => `⏰ ${title}\n${msg}`,
help: 'Команды: /start, /lang ru|fr|en — переключить язык'
},
fr: {
start: "Salut ! Ouvre la mini‑appli pour voir les arrivées en temps réel.",
open_app: "Ouvrir la mini‑appli",
choose_lang: "Choisis la langue : /lang ru | /lang fr | /lang en",
lang_set: "Langue définie : Français",
fav_added: "Ajouté aux favoris ✅",
fav_exists: "Déjà dans les favoris",
fav_removed: "Supprimé des favoris",
alert_created: "Rappel créé. Je te préviens {{min}} min avant l'arrivée 🚍",
alert_fired: (title, msg) => `⏰ ${title}\n${msg}`,
help: "Commandes : /start, /lang ru|fr|en — changer la langue"
},
en: {
start: "Hi! Open the mini app to see real‑time arrivals.",
open_app: "Open mini app",
choose_lang: "Choose language: /lang ru | /lang fr | /lang en",
lang_set: "Language set: English",
fav_added: "Added to favorites ✅",
fav_exists: "Already in favorites",
fav_removed: "Removed from favorites",
alert_created: "Reminder created. I'll notify you {{min}} min before arrival 🚍",
alert_fired: (title, msg) => `⏰ ${title}\n${msg}`,
help: "Commands: /start, /lang ru|fr|en — change language"
}
};


export function tr(user, key, vars = {}) {
const lang = (user?.lang || 'ru');
let s = T[lang][key] || T['en'][key] || key;
for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{{${k}}}`, String(v));
return s;
}
