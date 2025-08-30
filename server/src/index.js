import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './api.js';
import { createBot } from './bot.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 8080;


// Статика для WebApp
app.use('/webapp', express.static(path.join(__dirname, '../../webapp')));


// API
app.use('/api', createApiRouter());


app.get('/', (req, res) => res.redirect('/webapp'));


app.listen(PORT, () => {
console.log('HTTP server on', PORT);
});


// Bot (long polling)
const bot = createBot();
bot.launch().then(() => console.log('Bot started'));


// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
