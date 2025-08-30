import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';


const dbFile = path.join(process.cwd(), 'data.sqlite');
const firstInit = !fs.existsSync(dbFile);


const db = new Database(dbFile);


if (firstInit) {
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY,
tg_id INTEGER UNIQUE NOT NULL,
lang TEXT DEFAULT 'ru',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS favorites (
id INTEGER PRIMARY KEY,
user_id INTEGER NOT NULL,
mode TEXT NOT NULL,
line TEXT NOT NULL,
stop TEXT NOT NULL,
dir TEXT NOT NULL,
title TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id, mode, line, stop, dir),
FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS alerts (
id INTEGER PRIMARY KEY,
user_id INTEGER NOT NULL,
mode TEXT NOT NULL,
line TEXT NOT NULL,
stop TEXT NOT NULL,
dir TEXT NOT NULL,
threshold_min INTEGER NOT NULL DEFAULT 5,
is_active INTEGER NOT NULL DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);
}


// Users
export const upsertUser = db.prepare(
`INSERT INTO users (tg_id, lang) VALUES (?, COALESCE(?, 'ru'))
ON CONFLICT(tg_id) DO UPDATE SET lang=COALESCE(excluded.lang, users.lang)
RETURNING *`
);
export const getUserByTgId = db.prepare(`SELECT * FROM users WHERE tg_id = ?`);
export const setUserLang = db.prepare(`UPDATE users SET lang=? WHERE tg_id=?`);


// Favorites
export const listFavorites = db.prepare(`SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC`);
export const addFavorite = db.prepare(`INSERT OR IGNORE INTO favorites (user_id, mode, line, stop, dir, title) VALUES (?, ?, ?, ?, ?, ?)`);
export const removeFavorite = db.prepare(`DELETE FROM favorites WHERE user_id=? AND mode=? AND line=? AND stop=? AND dir=?`);


// Alerts
export const listActiveAlerts = db.prepare(`SELECT * FROM alerts WHERE is_active=1`);
export const addAlert = db.prepare(`INSERT INTO alerts (user_id, mode, line, stop, dir, threshold_min) VALUES (?, ?, ?, ?, ?, ?)`);
export const deactivateAlert = db.prepare(`UPDATE alerts SET is_active=0 WHERE id=?`);


export default db;
