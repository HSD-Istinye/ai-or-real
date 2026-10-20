import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { scopeSince } from '../lib/server/day';

test('Istanbul midnight is independent of the server timezone', () => {
  assert.equal(scopeSince('today', new Date('2026-10-20T20:59:59Z')), '2026-10-19T21:00:00.000Z');
  assert.equal(scopeSince('today', new Date('2026-10-20T21:00:00Z')), '2026-10-20T21:00:00.000Z');
});

test('PostgreSQL schema, scoring, duplicate submission, ranking, stats and admin operations', async () => {
  const db = new PGlite();
  // Executes application SQL in a real embedded PostgreSQL engine.
  // Only the transport is adapted; production uses Postgres.js over TLS.
  const adapter = (connection: Pick<PGlite, 'query'>) => {
    const query = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const text = strings.reduce((result, part, i) => result + (i ? `$${i}` : '') + part, '');
      const result = await connection.query(text, values);
      return Object.assign(result.rows, { count: result.affectedRows ?? result.rows.length });
    };
    return query;
  };
  const sql = Object.assign(adapter(db), {
    begin: (callback: (tx: ReturnType<typeof adapter>) => Promise<unknown>) =>
      db.transaction(tx => callback(adapter(tx))),
  });
  const globals = globalThis as unknown as { __hsdPostgres?: unknown };
  globals.__hsdPostgres = sql;
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
    const schema = readFileSync('lib/server/schema.sql', 'utf8');
    await db.exec(schema);
    await db.exec(schema); // Safe to reapply without losing data.
    const api = await import('../lib/server/runs');
    const questions = JSON.parse(readFileSync('data/questions.json', 'utf8'));
    const payload = (nick: string, ms = 1200) => ({
      id: randomUUID(), nick, mode: 'solo', createdAt: new Date().toISOString(),
      answers: [{ questionId: questions[0].id, choice: 'ai', reactionMs: ms }],
    });
    const first = payload('Ali');
    const saved = await api.insertRun(first);
    assert.equal(saved.duplicate, false);
    assert.ok(saved.score > 0);
    const duplicate = await api.insertRun(first);
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.score, saved.score);
    assert.equal((await db.query('SELECT * FROM game.answer')).rows.length, 1);
    await api.insertRun(payload('ALİ', 2000));
    await api.insertRun(payload('Ece', 2300));
    await api.insertRun(payload('???'));
    await api.insertRun(payload('???'));
    assert.equal(await api.isNickTakenToday('ali'), true);
    assert.equal(await api.isNickTakenToday('Can'), false);
    const board = await api.getLeaderboard({ scope: 'today', mode: 'solo', limit: 10 });
    assert.equal(board.rows.length, 4); // Ali/ALİ group together, anonymous players do not.
    assert.equal(board.totalPlayers, 5);
    assert.ok(board.rows.every(r => typeof r.createdAt === 'string'));
    const stats = await api.getStats({ scope: 'today', mode: 'solo', score: saved.score });
    assert.equal(stats.total, 5);
    assert.equal(stats.questions[0].attempts, 5);
    assert.equal(stats.avgAccuracy, 100);
    assert.equal((await api.getStats({ scope: 'today', mode: 'duel' })).median, null);
    assert.equal(await api.setHidden(first.id, true), true);
    assert.equal((await api.listRuns()).find(r => r.id === first.id)?.hidden, 1);
    assert.equal(await api.setHidden(first.id, false), true);
    assert.equal(await api.setHidden(randomUUID(), true), false);
    assert.match(await api.exportCsv(), /id,nick,mode,score/);
    // Force an answer failure and verify the parent run rolls back too.
    await db.exec('ALTER TABLE game.answer ADD CONSTRAINT test_failure CHECK (points < 0) NOT VALID');
    const failed = payload('Can');
    await assert.rejects(() => api.insertRun(failed));
    assert.equal((await db.query('SELECT id FROM game.run WHERE id = $1', [failed.id])).rows.length, 0);
    await db.exec('ALTER TABLE game.answer DROP CONSTRAINT test_failure');
    assert.equal(await api.hideToday(), 5);
    assert.equal((await api.getLeaderboard({ scope: 'today', mode: 'solo', limit: 10 })).rows.length, 0);
    await db.exec('SET ROLE anon');
    await assert.rejects(() => db.query('SELECT * FROM game.run'), /permission denied/);
    await db.exec('RESET ROLE');
    await db.exec(readFileSync('lib/server/access-schema.sql', 'utf8'));
    const gate = await import('../lib/server/access');
    const firstAccess = await gate.createAccess();
    const otherAccess = await gate.createAccess();
    assert.equal((await gate.accessStatus(firstAccess.session)).unlocked, false);
    assert.equal(await gate.unlockAccess(firstAccess.session), false); // Cookie cannot stand in for QR.
    assert.equal(await gate.unlockAccess('invalid'), false);
    assert.equal(await gate.unlockAccess(firstAccess.scan), true);
    assert.equal((await gate.accessStatus(firstAccess.session)).unlocked, true);
    assert.equal((await gate.accessStatus(otherAccess.session)).unlocked, false);
    const renewed = await gate.createAccess(otherAccess.session);
    assert.equal(await gate.unlockAccess(otherAccess.scan), false);
    assert.equal(await gate.unlockAccess(renewed.scan), true);
    await db.exec("UPDATE game.access_session SET expires_at = now() - interval '1 second'");
    assert.equal((await gate.accessStatus(firstAccess.session)).unlocked, false);
    assert.equal(await gate.unlockAccess(firstAccess.scan), false);
    await db.exec('SET ROLE anon');
    await assert.rejects(() => db.query('SELECT * FROM game.access_session'), /permission denied/);
    await db.exec('RESET ROLE');
  } finally {
    delete globals.__hsdPostgres;
    await db.close();
  }
});
