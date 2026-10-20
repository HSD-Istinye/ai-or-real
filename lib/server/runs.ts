import 'server-only';
import { getDb } from './db';
import { scopeSince } from './day';
import { getQuestion, parseSubmitRun } from './validate';
import { checkAnswer } from '@/lib/game/checkAnswer';
import { TIME_GRACE_MS, timeLimitFor } from '@/lib/game/rules';
import { GameMode, LeaderboardResponse, Scope, StatsResponse, SubmitRunResponse } from '@/types/api';
export { scopeSince } from './day';
type ParsedRun = ReturnType<typeof parseSubmitRun>;
interface RunRow {
  id: string; nick: string; nick_key: string; mode: GameMode; score: number;
  correct: number; total: number; avg_ms: number | null; max_streak: number;
  device: string | null; created_at: Date; received_at: Date; hidden: number;
}
export function nickKey(nick: string): string {
  return nick.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
}
export async function isNickTakenToday(nick: string): Promise<boolean> {
  if (nick === '???') return false;
  const sql = getDb();
  const rows = await sql`SELECT 1 FROM game.run WHERE hidden = 0 AND nick_key = ${nickKey(nick)} AND created_at >= ${scopeSince('today')} LIMIT 1`;
  return rows.length > 0;
}
export function scoreRun(run: ParsedRun) {
  let streak = 0;
  let maxStreak = 0;
  let score = 0;
  let correct = 0;
  const correctTimes: number[] = [];

  const answers = run.answers.map((a, idx) => {
    const question = getQuestion(a.questionId)!;
    // İstemcinin "foul" bilgisine güvenilmez; süre sınırı / tahmin kararını sunucu verir.
    // Ağ/ölçüm payı için süre sınırına TIME_GRACE_MS kadar tolerans tanınır.
    const limit = timeLimitFor(question);
    const ms = a.reactionMs;
    const withinGrace = ms !== null && ms > limit && ms <= limit + TIME_GRACE_MS;

    const res = checkAnswer({
      question,
      selectedOption: a.choice,
      timeSpentMs: withinGrace ? limit : ms,
      currentStreak: streak,
    });
    streak = res.streakAtAnswer;
    maxStreak = Math.max(maxStreak, streak);
    score += res.pointsEarned;
    if (res.isCorrect) {
      correct++;
      if (ms !== null) correctTimes.push(Math.min(ms, limit));
    }
    return {
      idx,
      questionId: a.questionId,
      choice: a.choice,
      reactionMs: ms,
      foul: res.foul ?? null,
      correct: res.isCorrect,
      points: res.pointsEarned,
    };
  });

  const avgMs = correctTimes.length
    ? Math.round(correctTimes.reduce((s, t) => s + t, 0) / correctTimes.length)
    : null;

  return { score: Math.max(0, score), correct, total: answers.length, avgMs, maxStreak, answers };
}

async function bestRuns(mode: GameMode, since: string) {
  const sql = getDb();
  return sql<RunRow[]>`
    SELECT DISTINCT ON (CASE WHEN nick = '???' THEN id ELSE nick_key END) *
    FROM game.run WHERE hidden = 0 AND mode = ${mode} AND created_at >= ${since}
    ORDER BY CASE WHEN nick = '???' THEN id ELSE nick_key END,
      score DESC, COALESCE(avg_ms, 999999999), created_at, id`;
}
const average = (r: RunRow) => r.avg_ms ?? 999999999;
const playerKey = (r: RunRow) => r.nick === '???' ? r.id : r.nick_key;

export async function insertRun(body: unknown): Promise<SubmitRunResponse> {
  const run = parseSubmitRun(body);
  const s = scoreRun(run);
  const sql = getDb();
  // ON CONFLICT waits for concurrent inserts. Answers are committed with the run.
  const result = await sql.begin(async tx => {
    const saved = await tx<RunRow[]>`
      INSERT INTO game.run (id, nick, nick_key, mode, score, correct, total, avg_ms, max_streak, device, created_at, received_at)
      VALUES (${run.id}, ${run.nick}, ${nickKey(run.nick)}, ${run.mode}, ${s.score}, ${s.correct}, ${s.total}, ${s.avgMs}, ${s.maxStreak}, ${run.device}, ${run.createdAt}, ${new Date().toISOString()})
      ON CONFLICT (id) DO NOTHING RETURNING *`;
    if (!saved.length) {
      const [existing] = await tx<RunRow[]>`SELECT * FROM game.run WHERE id = ${run.id}`;
      return { row: existing, duplicate: true };
    }
    for (const a of s.answers) {
      await tx`INSERT INTO game.answer (run_id, idx, question_id, choice, correct, reaction_ms, points, foul)
        VALUES (${run.id}, ${a.idx}, ${a.questionId}, ${a.choice}, ${a.correct ? 1 : 0}, ${a.reactionMs}, ${a.points}, ${a.foul})`;
    }
    return { row: saved[0], duplicate: false };
  });
  return buildSubmitResponse(result.row, result.duplicate);
}

async function buildSubmitResponse(r: RunRow, duplicate: boolean): Promise<SubmitRunResponse> {
  const rows = await bestRuns(r.mode, scopeSince('today'));
  const key = playerKey(r);
  const previous = rows.find(row => playerKey(row) === key);
  const best = previous && (previous.score > r.score || (previous.score === r.score && average(previous) < average(r))) ? previous : r;
  const others = rows.filter(row => playerKey(row) !== key);
  const rank = (candidate: RunRow) => 1 + others.filter(row => row.score > candidate.score || (row.score === candidate.score && average(row) < average(candidate))).length;
  const beaten = others.filter(row => row.score < best.score).length;
  return {
    ok: true, id: r.id, duplicate, nick: r.nick, score: r.score, correct: r.correct,
    total: r.total, avgMs: r.avg_ms, rankToday: rank(best), rankThisRun: rank(r),
    bestToday: { id: best.id, score: best.score, correct: best.correct, total: best.total, avgMs: best.avg_ms },
    percentile: others.length ? Math.round(100 * beaten / others.length) : 100,
    beatenToday: beaten, totalToday: others.length + 1,
  };
}

export async function getLeaderboard(opts: { scope: Scope; mode: GameMode; limit: number }): Promise<LeaderboardResponse> {
  const sql = getDb();
  const since = scopeSince(opts.scope);
  const rows = await sql<RunRow[]>`
    WITH best AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY CASE WHEN nick = '???' THEN id ELSE nick_key END
        ORDER BY score DESC, COALESCE(avg_ms, 999999999), created_at, id) AS rn
      FROM game.run WHERE hidden = 0 AND mode = ${opts.mode} AND created_at >= ${since}
    ) SELECT * FROM best WHERE rn = 1
    ORDER BY score DESC, COALESCE(avg_ms, 999999999), created_at, id LIMIT ${Math.floor(opts.limit)}`;
  const [count] = await sql`SELECT COUNT(*)::int AS n FROM game.run WHERE hidden = 0 AND mode = ${opts.mode} AND created_at >= ${since}`;
  return {
    scope: opts.scope, mode: opts.mode, totalPlayers: count.n, generatedAt: new Date().toISOString(),
    rows: rows.map((r, i) => ({ rank: i + 1, id: r.id, nick: r.nick, score: r.score,
      correct: r.correct, total: r.total, avgMs: r.avg_ms, createdAt: r.created_at.toISOString() })),
  };
}

export async function getStats(opts: { scope: Scope; mode: GameMode; score?: number }): Promise<StatsResponse> {
  const sql = getDb();
  const since = scopeSince(opts.scope);
  const [summary] = await sql`
    SELECT COUNT(*)::int AS total, MAX(score) AS best,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY score) AS median,
      AVG(100.0 * correct / NULLIF(total, 0)) AS accuracy,
      COUNT(*) FILTER (WHERE score < ${opts.score ?? null})::int AS lower
    FROM game.run WHERE hidden = 0 AND mode = ${opts.mode} AND created_at >= ${since}`;
  const questions = await sql`
    SELECT a.question_id AS "questionId", COUNT(*)::int AS attempts,
      ROUND(100.0 * AVG(a.correct))::int AS "correctRate",
      ROUND(AVG(CASE WHEN a.correct = 1 THEN a.reaction_ms END))::int AS "avgMs"
    FROM game.answer a JOIN game.run r ON r.id = a.run_id
    WHERE r.hidden = 0 AND r.mode = ${opts.mode} AND r.created_at >= ${since}
    GROUP BY a.question_id ORDER BY "correctRate" ASC`;
  return {
    scope: opts.scope, total: summary.total, best: summary.best,
    median: summary.median === null ? null : Math.round(Number(summary.median)),
    avgAccuracy: summary.accuracy === null ? null : Math.round(Number(summary.accuracy)),
    percentile: opts.score !== undefined && summary.total ? Math.round(100 * summary.lower / summary.total) : null,
    questions: questions.map(q => ({ questionId: q.questionId, attempts: q.attempts, correctRate: q.correctRate, avgMs: q.avgMs })),
  };
}

export async function listRuns(limit = 100) {
  const sql = getDb();
  return sql`SELECT id, nick, mode, score, correct, total, avg_ms AS "avgMs", device, created_at AS "createdAt", hidden
    FROM game.run ORDER BY created_at DESC, id LIMIT ${Math.floor(limit)}`;
}
export async function setHidden(id: string, hidden: boolean): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`UPDATE game.run SET hidden = ${hidden ? 1 : 0} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
export async function hideToday(): Promise<number> {
  const sql = getDb();
  const rows = await sql`UPDATE game.run SET hidden = 1 WHERE created_at >= ${scopeSince('today')} AND hidden = 0`;
  return rows.count;
}
export async function exportCsv(): Promise<string> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM game.run ORDER BY created_at, id`;
  const cols = ['id', 'nick', 'mode', 'score', 'correct', 'total', 'avg_ms', 'max_streak', 'device', 'created_at', 'received_at', 'hidden'];
  const esc = (v: unknown) => {
    const s = v instanceof Date ? v.toISOString() : v == null ? '' : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
}
