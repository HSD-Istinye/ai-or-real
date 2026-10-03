import 'server-only';
import { getDb } from './db';
import { getQuestion, parseSubmitRun } from './validate';
import { checkAnswer } from '@/lib/game/checkAnswer';
import { TIME_GRACE_MS, timeLimitFor } from '@/lib/game/rules';
import {
  GameMode,
  LeaderboardResponse,
  LeaderboardRow,
  QuestionStat,
  Scope,
  StatsResponse,
  SubmitRunResponse,
} from '@/types/api';

type ParsedRun = ReturnType<typeof parseSubmitRun>;

interface RunRow {
  id: string;
  nick: string;
  mode: GameMode;
  score: number;
  correct: number;
  total: number;
  avg_ms: number | null;
  max_streak: number;
  device: string | null;
  created_at: string;
  received_at: string;
  hidden: number;
}

/* ─────────────────────────── yardımcılar ─────────────────────────── */

/** "Bugün" = sunucu bilgisayarının yerel saatine göre gece yarısından beri. */
export function scopeSince(scope: Scope): string {
  if (scope === 'alltime') return '';
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Aynı isim (büyük/küçük harf fark etmez) tabloda bir kez görünsün; '???' (isimsiz) oyuncular ayrı sayılır. */
const PKEY = `CASE WHEN nick = '???' THEN id ELSE nick_key END`;
const AVG = `COALESCE(avg_ms, 999999999)`;

const BEST_CTE = `
  WITH best AS (
    SELECT *, ${PKEY} AS pkey,
           ROW_NUMBER() OVER (PARTITION BY ${PKEY} ORDER BY score DESC, ${AVG} ASC, created_at ASC) AS rn
    FROM run
    WHERE hidden = 0 AND mode = @mode AND created_at >= @since
  )`;

/** Gruplama anahtarı: "Ali", "ALİ", "ali " aynı kişi sayılır. */
export function nickKey(nick: string): string {
  return nick.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
}

/* ───────────────────────── skor hesaplama ───────────────────────── */

/**
 * Skoru SUNUCU hesaplar — istemcideki ile aynı fonksiyon (lib/game/checkAnswer.ts) kullanılır,
 * böylece puan formülü tek yerde durur. Refleks puanlamasına geçince sadece
 * lib/game/calculateScore.ts değişir.
 */
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

/* ───────────────────────────── yazma ───────────────────────────── */

export function insertRun(body: unknown): SubmitRunResponse {
  const run = parseSubmitRun(body);
  const db = getDb();

  const existing = db.prepare('SELECT * FROM run WHERE id = ?').get(run.id) as RunRow | undefined;
  if (existing) {
    // Aynı id ikinci kez geldi (ağ koptu, kuyruk tekrar gönderdi) → yeni kayıt açma.
    return buildSubmitResponse(existing, true);
  }

  const s = scoreRun(run);
  const receivedAt = new Date().toISOString();

  const insertRunStmt = db.prepare(`
    INSERT OR IGNORE INTO run (id, nick, nick_key, mode, score, correct, total, avg_ms, max_streak, device, created_at, received_at)
    VALUES (@id, @nick, @nickKey, @mode, @score, @correct, @total, @avgMs, @maxStreak, @device, @createdAt, @receivedAt)
  `);
  const insertAnswerStmt = db.prepare(`
    INSERT INTO answer (run_id, idx, question_id, choice, correct, reaction_ms, points, foul)
    VALUES (@runId, @idx, @questionId, @choice, @correct, @reactionMs, @points, @foul)
  `);

  db.transaction(() => {
    const info = insertRunStmt.run({
      id: run.id,
      nick: run.nick,
      nickKey: nickKey(run.nick),
      mode: run.mode,
      score: s.score,
      correct: s.correct,
      total: s.total,
      avgMs: s.avgMs,
      maxStreak: s.maxStreak,
      device: run.device,
      createdAt: run.createdAt,
      receivedAt,
    });
    if (info.changes === 0) return; // eşzamanlı çift istek — diğeri zaten yazdı
    for (const a of s.answers) {
      insertAnswerStmt.run({
        runId: run.id,
        idx: a.idx,
        questionId: a.questionId,
        choice: a.choice,
        correct: a.correct ? 1 : 0,
        reactionMs: a.reactionMs,
        points: a.points,
        foul: a.foul ?? null,
      });
    }
  })();

  const saved = db.prepare('SELECT * FROM run WHERE id = ?').get(run.id) as RunRow;
  return buildSubmitResponse(saved, false);
}

function buildSubmitResponse(r: RunRow, duplicate: boolean): SubmitRunResponse {
  const db = getDb();
  const since = scopeSince('today');
  const pkey = r.nick === '???' ? r.id : nickKey(r.nick);

  const better = db
    .prepare(
      `${BEST_CTE}
       SELECT COUNT(*) AS n FROM best
       WHERE rn = 1 AND pkey != @pkey
         AND (score > @score OR (score = @score AND ${AVG} < COALESCE(@avgMs, 999999999)))`,
    )
    .get({ mode: r.mode, since, pkey, score: r.score, avgMs: r.avg_ms }) as { n: number };

  const counts = db
    .prepare(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN score < @score THEN 1 ELSE 0 END) AS lower
       FROM run WHERE hidden = 0 AND mode = @mode AND created_at >= @since AND id != @id`,
    )
    .get({ mode: r.mode, since, score: r.score, id: r.id }) as { total: number; lower: number | null };

  const percentile = counts.total > 0 ? Math.round((100 * (counts.lower ?? 0)) / counts.total) : 100;

  return {
    ok: true,
    id: r.id,
    duplicate,
    nick: r.nick,
    score: r.score,
    correct: r.correct,
    total: r.total,
    avgMs: r.avg_ms,
    rankToday: better.n + 1,
    percentile,
    beatenToday: counts.lower ?? 0,
    totalToday: counts.total + 1,
  };
}

/* ───────────────────────────── okuma ───────────────────────────── */

export function getLeaderboard(opts: { scope: Scope; mode: GameMode; limit: number }): LeaderboardResponse {
  const db = getDb();
  const since = scopeSince(opts.scope);

  const rows = db
    .prepare(
      `${BEST_CTE}
       SELECT id, nick, score, correct, total, avg_ms, created_at FROM best
       WHERE rn = 1
       ORDER BY score DESC, ${AVG} ASC, created_at ASC
       LIMIT @limit`,
    )
    .all({ mode: opts.mode, since, limit: opts.limit }) as Pick<
    RunRow,
    'id' | 'nick' | 'score' | 'correct' | 'total' | 'avg_ms' | 'created_at'
  >[];

  const { n } = db
    .prepare(`SELECT COUNT(*) AS n FROM run WHERE hidden = 0 AND mode = @mode AND created_at >= @since`)
    .get({ mode: opts.mode, since }) as { n: number };

  return {
    scope: opts.scope,
    mode: opts.mode,
    rows: rows.map<LeaderboardRow>((r, i) => ({
      rank: i + 1,
      id: r.id,
      nick: r.nick,
      score: r.score,
      correct: r.correct,
      total: r.total,
      avgMs: r.avg_ms,
      createdAt: r.created_at,
    })),
    totalPlayers: n,
    generatedAt: new Date().toISOString(),
  };
}

export function getStats(opts: { scope: Scope; mode: GameMode; score?: number }): StatsResponse {
  const db = getDb();
  const since = scopeSince(opts.scope);
  const p = { mode: opts.mode, since };

  const scores = (
    db
      .prepare(`SELECT score FROM run WHERE hidden = 0 AND mode = @mode AND created_at >= @since ORDER BY score`)
      .all(p) as { score: number }[]
  ).map((r) => r.score);

  const total = scores.length;
  const median =
    total === 0 ? null : total % 2 ? scores[(total - 1) / 2] : Math.round((scores[total / 2 - 1] + scores[total / 2]) / 2);

  let percentile: number | null = null;
  if (opts.score !== undefined && total > 0) {
    const lower = scores.filter((s) => s < opts.score!).length;
    percentile = Math.round((100 * lower) / total);
  }

  const acc = db
    .prepare(
      `SELECT AVG(100.0 * correct / total) AS a FROM run
       WHERE hidden = 0 AND mode = @mode AND created_at >= @since AND total > 0`,
    )
    .get(p) as { a: number | null };

  const questions = (
    db
      .prepare(
        `SELECT a.question_id AS questionId, COUNT(*) AS attempts,
                ROUND(100.0 * AVG(a.correct)) AS correctRate,
                ROUND(AVG(CASE WHEN a.correct = 1 THEN a.reaction_ms END)) AS avgMs
         FROM answer a JOIN run r ON r.id = a.run_id
         WHERE r.hidden = 0 AND r.mode = @mode AND r.created_at >= @since
         GROUP BY a.question_id
         ORDER BY correctRate ASC`,
      )
      .all(p) as QuestionStat[]
  ).map((q) => ({ ...q, correctRate: Number(q.correctRate), avgMs: q.avgMs === null ? null : Number(q.avgMs) }));

  return {
    scope: opts.scope,
    total,
    percentile,
    median,
    best: total ? scores[total - 1] : null,
    avgAccuracy: acc.a === null ? null : Math.round(acc.a),
    questions,
  };
}

/* ───────────────────────────── admin ───────────────────────────── */

export function listRuns(limit = 100) {
  return getDb()
    .prepare(
      `SELECT id, nick, mode, score, correct, total, avg_ms AS avgMs, device, created_at AS createdAt, hidden
       FROM run ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit);
}

export function setHidden(id: string, hidden: boolean): boolean {
  const info = getDb().prepare('UPDATE run SET hidden = ? WHERE id = ?').run(hidden ? 1 : 0, id);
  return info.changes > 0;
}

/** Günü sıfırla: bugünkü kayıtları SİLMEZ, gizler (geri alınabilir). */
export function hideToday(): number {
  return getDb()
    .prepare('UPDATE run SET hidden = 1 WHERE created_at >= ? AND hidden = 0')
    .run(scopeSince('today')).changes;
}

export function exportCsv(): string {
  const rows = getDb()
    .prepare(
      `SELECT id, nick, mode, score, correct, total, avg_ms, max_streak, device, created_at, received_at, hidden
       FROM run ORDER BY created_at`,
    )
    .all() as Record<string, unknown>[];
  const cols = ['id', 'nick', 'mode', 'score', 'correct', 'total', 'avg_ms', 'max_streak', 'device', 'created_at', 'received_at', 'hidden'];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}
