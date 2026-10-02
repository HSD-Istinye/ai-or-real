/**
 * Sahte leaderboard verisi üretir (tablo tasarımını boş ekranla yapmamak için).
 *
 *   npm run seed              → 200 sahte oyun ekler (bugün)
 *   npm run seed -- 50        → 50 sahte oyun ekler
 *   npm run seed -- --clear   → SADECE sahte kayıtları siler (device = 'seed')
 *
 * Gerçek kayıtlara dokunmaz. Sunucu açıkken de çalıştırılabilir.
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dbPath = process.env.DB_PATH || path.join(root, 'data', 'game.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
// Eski dosyalar için: nick_key sütunu yoksa ekle (lib/server/db.ts → migrate ile aynı)
const hasRun = db.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'run'`).get();
if (hasRun && !db.prepare(`PRAGMA table_info(run)`).all().some((c) => c.name === 'nick_key')) {
  db.exec(`ALTER TABLE run ADD COLUMN nick_key TEXT NOT NULL DEFAULT ''`);
  db.exec(`UPDATE run SET nick_key = LOWER(nick)`);
}
db.exec(fs.readFileSync(path.join(root, 'lib', 'server', 'schema.sql'), 'utf8'));

if (process.argv.includes('--clear')) {
  const n = db.transaction(() => {
    db.prepare(`DELETE FROM answer WHERE run_id IN (SELECT id FROM run WHERE device = 'seed')`).run();
    return db.prepare(`DELETE FROM run WHERE device = 'seed'`).run().changes;
  })();
  console.log(`🧹 ${n} sahte kayıt silindi.`);
  process.exit(0);
}

const count = Number(process.argv.find((a) => /^\d+$/.test(a))) || 200;
const questions = JSON.parse(fs.readFileSync(path.join(root, 'data', 'questions.json'), 'utf8'));
const NAMES = ['Ali', 'Ayşe', 'Mehmet', 'Zeynep', 'Can', 'Elif', 'Emre', 'Selin', 'Burak', 'Deniz', 'Mert',
  'Ece', 'Kaan', 'İrem', 'Oğuz', 'Şule', 'Barış', 'Gökçe', 'Tuna', 'Büşra', 'Yusuf', 'Melis', 'Arda', 'Nehir'];
const SURNAMES = ['Y.', 'K.', 'A.', 'Ş.', 'Ö.', 'T.', 'D.', 'Ç.', 'Kaya', 'Demir', 'Çelik', 'Aydın'];

// lib/game/calculateScore.ts ile aynı formül (sahte veri için kopyası)
function points(correct, ms, streak) {
  if (!correct) return 0;
  const mult = Math.min(1 + streak * 0.25, 2.5);
  const bonus = Math.max(0, Math.round((1 - Math.min(ms, 15000) / 15000) * 50));
  return Math.round(100 * mult) + bonus;
}

const insertRun = db.prepare(`
  INSERT INTO run (id, nick, nick_key, mode, score, correct, total, avg_ms, max_streak, device, created_at, received_at)
  VALUES (?, ?, ?, 'solo', ?, ?, ?, ?, ?, 'seed', ?, ?)`);
const insertAnswer = db.prepare(`
  INSERT INTO answer (run_id, idx, question_id, choice, correct, reaction_ms, points, foul)
  VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`);

const start = new Date();
start.setHours(9, 0, 0, 0);
const span = Math.max(60_000, Date.now() - start.getTime());

db.transaction(() => {
  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const nick = `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`;
    const skill = 0.35 + Math.random() * 0.6; // oyuncunun doğru bilme olasılığı
    const qs = [...questions].sort(() => Math.random() - 0.5);
    let streak = 0, maxStreak = 0, score = 0, correct = 0;
    const times = [];
    const answers = qs.map((q, idx) => {
      const ok = Math.random() < skill;
      const ms = Math.round(1200 + Math.random() * 9000);
      const p = points(ok, ms, streak);
      streak = ok ? streak + 1 : 0;
      maxStreak = Math.max(maxStreak, streak);
      score += p;
      if (ok) { correct++; times.push(ms); }
      return [idx, q.id, ok ? q.correctAnswer : q.correctAnswer === 'ai' ? 'real' : 'ai', ok ? 1 : 0, ms, p];
    });
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
    const at = new Date(start.getTime() + Math.random() * span).toISOString();
    insertRun.run(id, nick, nick.toLocaleLowerCase('tr-TR'), score, correct, qs.length, avg, maxStreak, at, at);
    for (const a of answers) insertAnswer.run(id, ...a);
  }
})();

console.log(`🌱 ${count} sahte oyun eklendi → ${dbPath}`);
console.log(`   Silmek için: npm run seed -- --clear`);
