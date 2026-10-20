// Optional one-time import. Requires Python 3; the original SQLite file stays untouched.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { connect } from './db.mjs';
const source = path.resolve(process.argv[2] || 'data/game.db');
const snapshot = spawnSync('python', [fileURLToPath(new URL('./read-sqlite.py', import.meta.url)), source], {
  encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
});
if (snapshot.error || snapshot.status !== 0) {
  throw new Error('SQLite okunamadı. Python 3 kurulu olmalı ve kaynak dosya mevcut olmalı.');
}
const data = JSON.parse(snapshot.stdout);
const byRun = new Map();
for (const a of data.answers) {
  if (!byRun.has(a.run_id)) byRun.set(a.run_id, []);
  byRun.get(a.run_id).push(a);
}
const sql = connect();
try {
  const imported = await sql.begin(async tx => {
    let count = 0;
    for (const r of data.runs) {
      const rows = await tx`INSERT INTO game.run (id, nick, nick_key, mode, score, correct, total, avg_ms, max_streak, device, created_at, received_at, hidden)
        VALUES (${r.id}, ${r.nick}, ${r.nick.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim()}, ${r.mode}, ${r.score}, ${r.correct}, ${r.total}, ${r.avg_ms}, ${r.max_streak}, ${r.device}, ${r.created_at}, ${r.received_at}, ${r.hidden})
        ON CONFLICT (id) DO NOTHING RETURNING id`;
      if (!rows.length) continue;
      for (const a of byRun.get(r.id) || []) {
        await tx`INSERT INTO game.answer (run_id, idx, question_id, choice, correct, reaction_ms, points, foul)
          VALUES (${a.run_id}, ${a.idx}, ${a.question_id}, ${a.choice}, ${a.correct}, ${a.reaction_ms}, ${a.points}, ${a.foul ?? null})`;
      }
      count++;
    }
    return count;
  });
  console.log(`${imported} oyun cevaplarıyla aktarıldı. Mevcut ID'ler atlandı. Kaynak dosya değişmedi.`);
} finally { await sql.end(); }
