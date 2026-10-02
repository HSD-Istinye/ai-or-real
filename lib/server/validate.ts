import 'server-only';
import rawQuestions from '@/data/questions.json';
import { Question } from '@/types/question';
import { Foul, GameMode, SubmitAnswer, SubmitRunRequest } from '@/types/api';
import { isBlockedNick } from './blocklist';

const QUESTIONS = new Map((rawQuestions as Question[]).map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.get(id);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Harf (her dil), rakam, boşluk ve . _ - ' karakterleri. Uzunluk sınırı yok;
// sadece yapıştırılan dev metinler tabloyu bozmasın diye teknik bir üst sınır var.
const NICK_RE = /^[\p{L}\p{N} ._'\-]+$/u;
export const NICK_MAX = 40;
const MODES: GameMode[] = ['solo', 'duel'];
const FOULS: Foul[] = ['early', 'guess', 'timeout'];
const MAX_ANSWERS = 30;
const MAX_REACTION_MS = 120_000;

export class ValidationError extends Error {}

function fail(msg: string): never {
  throw new ValidationError(msg);
}

/** İsmi normalize eder: baştaki/sondaki boşlukları atar, çoklu boşlukları teke indirir. */
export function normalizeNick(raw: unknown): string {
  if (typeof raw !== 'string') fail('isim gerekli');
  const nick = raw.normalize('NFC').trim().replace(/\s+/g, ' ').slice(0, NICK_MAX).trim();
  if (nick === '???') return nick; // isimsiz oyuncu
  if (!nick) fail('isim boş olamaz');
  if (!NICK_RE.test(nick)) fail('isim sadece harf, rakam, boşluk ve . _ - içerebilir');
  if (isBlockedNick(nick)) fail('Bu isim kullanılamaz, başka bir isim dene');
  return nick;
}

/** Gelen gövdeyi doğrular ve temizlenmiş hâlini döner. Hatalıysa ValidationError fırlatır. */
export function parseSubmitRun(body: unknown): Required<Omit<SubmitRunRequest, 'device'>> & {
  device: string | null;
} {
  if (!body || typeof body !== 'object') fail('geçersiz gövde');
  const b = body as Record<string, unknown>;

  if (typeof b.id !== 'string' || !UUID_RE.test(b.id)) fail('id geçerli bir UUID olmalı');
  const nick = normalizeNick(b.nick);

  const mode = (b.mode ?? 'solo') as GameMode;
  if (!MODES.includes(mode)) fail('geçersiz mode');

  const device =
    typeof b.device === 'string' && b.device.length > 0 ? b.device.slice(0, 32) : null;

  // createdAt: istemci saati (offline kuyrukta oynandığı an). Mantıksızsa sunucu saati.
  const now = Date.now();
  let createdAt = new Date(now).toISOString();
  if (typeof b.createdAt === 'string') {
    const t = Date.parse(b.createdAt);
    if (!Number.isNaN(t) && t <= now + 5 * 60_000 && t >= now - 3 * 24 * 3600_000) {
      createdAt = new Date(t).toISOString();
    }
  }

  if (!Array.isArray(b.answers) || b.answers.length === 0) fail('answers boş olamaz');
  if (b.answers.length > MAX_ANSWERS) fail('çok fazla cevap');

  const seen = new Set<string>();
  const answers: SubmitAnswer[] = b.answers.map((a: unknown, i: number) => {
    if (!a || typeof a !== 'object') fail(`answers[${i}] geçersiz`);
    const x = a as Record<string, unknown>;
    if (typeof x.questionId !== 'string' || !QUESTIONS.has(x.questionId)) {
      fail(`answers[${i}].questionId bilinmiyor`);
    }
    if (seen.has(x.questionId)) fail(`answers[${i}] tekrar eden soru`);
    seen.add(x.questionId);

    const choice = x.choice ?? null;
    if (choice !== null && choice !== 'real' && choice !== 'ai') fail(`answers[${i}].choice geçersiz`);

    let reactionMs: number | null = null;
    if (x.reactionMs !== null && x.reactionMs !== undefined) {
      if (typeof x.reactionMs !== 'number' || !Number.isFinite(x.reactionMs)) {
        fail(`answers[${i}].reactionMs sayı olmalı`);
      }
      reactionMs = Math.max(0, Math.min(MAX_REACTION_MS, Math.round(x.reactionMs)));
    }

    const foul = (x.foul ?? null) as Foul | null;
    if (foul !== null && !FOULS.includes(foul)) fail(`answers[${i}].foul geçersiz`);

    return { questionId: x.questionId, choice, reactionMs, foul };
  });

  return { id: b.id.toLowerCase(), nick, mode, device, createdAt, answers };
}
