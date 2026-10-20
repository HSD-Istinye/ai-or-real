import { connect } from './db.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const sql = connect();
try {
  const snapshot = await sql.begin('isolation level repeatable read read only', async tx => ({
    version: 1,
    createdAt: new Date().toISOString(),
    runs: await tx`SELECT * FROM game.run ORDER BY id`,
    answers: await tx`SELECT * FROM game.answer ORDER BY run_id, idx`,
  }));
  const dir = path.resolve(process.argv[2] || 'data/backups');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `game-${Date.now()}.json`);
  await fs.writeFile(file, JSON.stringify(snapshot, null, 2), { flag: 'wx' });
  console.log(`Oyun ve cevap yedeği: ${file}`);
} finally { await sql.end(); }
