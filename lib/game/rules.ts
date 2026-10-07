/**
 * Süreli / refleks modunun kuralları.
 * Bu dosya hem tarayıcıda hem sunucuda kullanılır (puanı sunucu da aynı kurallarla hesaplar).
 * Sayıları değiştirmek için sadece burayı düzenleyin.
 */
import { Question } from '@/types/question';

/** Zorluğa göre cevap süresi (ms). */
export const TIME_LIMIT_MS: Record<Question['difficulty'], number> = {
  easy: 5000,
  medium: 6000,
  hard: 8000,
};

/** Görseller belirmeden önceki rastgele bekleme (ms) — ritim ezberlenemesin diye. */
export const WAIT_MIN_MS = 800;
export const WAIT_MAX_MS = 2000;

/** Bundan hızlı cevap "tahmin" sayılır (görseli görmeden basılmış) → 0 puan. */
export const GUESS_MS = 250; // insan tepki süresinin alt sınırı (~0.2–0.25 sn)

/** Cevaptan sonra sonucun ekranda kalma süresi (ms); sonra otomatik geçilir. */
export const FEEDBACK_MS = 1800;

/** Sunucu tarafında ağ/ölçüm payı: süre sınırı + bu kadarına kadar kabul edilir. */
export const TIME_GRACE_MS = 500;

/** Puan: doğru cevap 500 taban + hıza göre 0–500 bonus; seri çarpanı en fazla ×1.5. */
export const BASE_POINTS = 500;
export const SPEED_POINTS = 500;
export const STREAK_STEP = 0.1;
export const STREAK_MAX = 1.5;

export function timeLimitFor(q: Pick<Question, 'difficulty'>): number {
  return TIME_LIMIT_MS[q.difficulty] ?? TIME_LIMIT_MS.medium;
}

export function randomWaitMs(): number {
  return WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
}
