import 'server-only';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Tek SQLite bağlantısı.
 * - Dosya: data/game.db (DB_PATH ortam değişkeniyle değiştirilebilir)
 * - Dev modunda hot-reload her seferinde yeni bağlantı açmasın diye globalThis'te saklanır.
 * - İlk çağrıda açılır (build sırasında dosya oluşturmamak için "lazy").
 */

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'game.db');
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'server', 'schema.sql');

const g = globalThis as unknown as { __hsdDb?: Database.Database };

export function getDb(): Database.Database {
  if (g.__hsdDb) return g.__hsdDb;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL'); // okuma/yazma aynı anda, çökmelere dayanıklı
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 3000');
  migrate(db);
  db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

  g.__hsdDb = db;
  return db;
}

/**
 * Eski veritabanı dosyalarını güncel şemaya taşır (veri kaybı olmadan).
 * Yeni bir sütun eklediğinizde buraya bir adım ekleyin.
 */
function migrate(db: Database.Database) {
  const hasRun = db.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'run'`).get();
  if (!hasRun) return; // yeni dosya — schema.sql zaten güncel tabloyu oluşturacak

  const cols = (db.prepare(`PRAGMA table_info(run)`).all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('nick_key')) {
    db.exec(`ALTER TABLE run ADD COLUMN nick_key TEXT NOT NULL DEFAULT ''`);
    db.exec(`UPDATE run SET nick_key = LOWER(nick)`);
  }
}
