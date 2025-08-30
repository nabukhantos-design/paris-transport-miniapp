import express from 'express';
import cors from 'cors';
import { fetchArrivals, fetchLineStatus } from './ratp.js';
import { verifyInitData } from './verifyInitData.js';
import { getUserByTgId, upsertUser, listFavorites, addFavorite, removeFavorite } from './db.js';


export function createApiRouter() {
const router = express.Router();


router.use(cors());
router.use(express.json());


// Health
router.get('/health', (req, res) => res.json({ ok: true }));


// Arrivals proxy
router.get('/arrivals', async (req, res) => {
try {
const { mode = 'bus', line = '38', stop = 'gare du nord', dir = 'A' } = req.query;
const [{ arrivals }, { lineStatusText }] = await Promise.all([
fetchArrivals({ mode, line, stop, dir }),
fetchLineStatus({ mode, line })
]);


// сгруппируем первые 6 и построим "next"
const enriched = arrivals.slice(0, 6).map((a, i, arr) => ({
message: a.message,
destination: a.destination,
next: i === 0 ? arr.slice(1, 4).map(x => x.message) : undefined
}));


res.json({ lineStatusText, arrivals: enriched });
} catch (e) {
res.status(500).json({ error: e.message });
}
});


// Auth via Telegram initData for WebApp
function getAuthedUser(req) {
const initData = req.header('X-Telegram-Init-Data');
const verified = verifyInitData(initData);
if (!verified?.user) return null;
const tgId = verified.user.id;
let user = getUserByTgId.get(tgId);
if (!user) user = upsertUser.get(tgId, verified.user.language_code || 'ru');
return user;
}


// Favorites (list)
router.get('/me/favorites', (req, res) => {
const user = getAuthedUser(req);
if (!user) return res.status(401).json({ error: 'unauthorized' });
const items = listFavorites.all(user.id);
res.json({ items });
});


// Favorites (add/remove) — можно вызывать и из WebApp
router.post('/favorites', (req, res) => {
const user = getAuthedUser(req);
if (!user) return res.status(401).json({ error: 'unauthorized' });


const { mode, line, stop, dir, title } = req.body || {};
if (!mode || !line || !stop || !dir) return res.status(400).json({ error: 'bad_request' });


addFavorite.run(user.id, mode, line, stop, dir, title || null);
res.json({ ok: true });
});


router.delete('/favorites', (req, res) => {
const user = getAuthedUser(req);
if (!user) return res.status(401).json({ error: 'unauthorized' });


const { mode, line, stop, dir } = req.body || {};
if (!mode || !line || !stop || !dir) return res.status(400).json({ error: 'bad_request' });


removeFavorite.run(user.id, mode, line, stop, dir);
res.json({ ok: true });
});


return router;
}
