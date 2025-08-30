// Проверка Telegram WebApp initData (HMAC-SHA256)
// Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
import crypto from 'node:crypto';
import process from 'node:process';


export function verifyInitData(initData) {
if (!initData) return null;
const data = new URLSearchParams(initData);
const hash = data.get('hash');
if (!hash) return null;


const fields = [];
for (const [k, v] of data.entries()) {
if (k === 'hash') continue;
fields.push(`${k}=${v}`);
}
fields.sort();
const dataCheckString = fields.join('\n');


const token = process.env.BOT_TOKEN;
const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');


if (hmac !== hash) return null;


const userRaw = data.get('user');
const user = userRaw ? JSON.parse(userRaw) : null;
return { user };
}
