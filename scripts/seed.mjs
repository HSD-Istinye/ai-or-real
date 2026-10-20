import { connect } from './db.mjs';
import { randomUUID } from 'node:crypto';
const sql = connect();
try {
  if (process.argv.includes('--clear')) {
    const result = await sql`DELETE FROM game.run WHERE device = 'seed'`;
    console.log(`${result.count} deneme oyunu silindi.`);
  } else {
    const count = Number(process.argv[2] || 200);
    if (!Number.isInteger(count) || count < 1 || count > 10000) throw new Error('Adet 1–10000 arasında olmalı.');
    await sql.begin(async tx => {
      for (let i = 0; i < count; i++) {
        const nick = `Demo ${i + 1}`;
        const at = new Date();
        await tx`INSERT INTO game.run (id, nick, nick_key, mode, score, correct, total, avg_ms, max_streak, device, created_at, received_at)
          VALUES (${randomUUID()}, ${nick}, ${nick.toLocaleLowerCase('tr-TR')}, 'solo', ${Math.floor(Math.random() * 10000)}, 5, 10, 2000, 3, 'seed', ${at}, ${at})`;
      }
    });
    console.log(`${count} sıralama deneme kaydı eklendi (cevap verisi içermez).`);
  }
} finally { await sql.end(); }
