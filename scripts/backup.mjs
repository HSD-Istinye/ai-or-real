/**
 * Veritabanının anlık yedeğini alır (sunucu açıkken de güvenli).
 *
 *   npm run backup                 → data/backups/game-2026-10-02_14-30.db
 *   npm run backup -- E:\yedek     → yedeği USB'ye / başka klasöre yazar
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dbPath = process.env.DB_PATH || path.join(root, 'data', 'game.db');
if (!fs.existsSync(dbPath)) {
  console.error(`Veritabanı bulunamadı: ${dbPath}`);
  process.exit(1);
}

const targetDir = process.argv[2] || path.join(root, 'data', 'backups');
fs.mkdirSync(targetDir, { recursive: true });

const d = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
const target = path.join(targetDir, `game-${stamp}.db`);

const db = new Database(dbPath, { readonly: true });
await db.backup(target);
db.close();
console.log(`💾 Yedek alındı → ${target}`);
