/**
 * API sözleşmesi — istemci ve sunucu bu tipleri ORTAK kullanır.
 * Değiştirmeden önce takımla konuşun (docs: README → "Backend & Leaderboard").
 */
import { OptionType } from './question';

export type GameMode = 'solo' | 'duel';
export type Foul = 'early' | 'guess' | 'timeout';
export type Scope = 'today' | 'alltime';

/** Oyun sonunda sunucuya gönderilen tek bir cevap. Skor GÖNDERİLMEZ, sunucu hesaplar. */
export interface SubmitAnswer {
  questionId: string;
  choice: OptionType | null; // null = süre doldu / cevap yok
  reactionMs: number | null;
  foul?: Foul | null;
}

/** POST /api/runs gövdesi */
export interface SubmitRunRequest {
  id: string; // UUID — istemci üretir, tekrar gönderimde aynı kalır
  nick: string; // 1–3 karakter
  mode?: GameMode;
  device?: string;
  createdAt: string; // ISO 8601
  answers: SubmitAnswer[];
}

/** POST /api/runs cevabı */
export interface SubmitRunResponse {
  ok: true;
  id: string;
  duplicate: boolean; // aynı id daha önce kaydedilmişse true
  nick: string;
  score: number;
  correct: number;
  total: number;
  avgMs: number | null;
  rankToday: number;
  percentile: number; // bugün oynayanların yüzde kaçından iyi (0–100)
  beatenToday: number; // bugün daha düşük skor yapan oyun sayısı
  totalToday: number; // bu oyun dahil bugünkü toplam oyun
}

export interface LeaderboardRow {
  rank: number;
  id: string;
  nick: string;
  score: number;
  correct: number;
  total: number;
  avgMs: number | null;
  createdAt: string;
}

/** GET /api/leaderboard cevabı */
export interface LeaderboardResponse {
  scope: Scope;
  mode: GameMode;
  rows: LeaderboardRow[];
  totalPlayers: number;
  generatedAt: string;
}

/** GET /api/stats cevabı */
export interface StatsResponse {
  scope: Scope;
  total: number;
  percentile: number | null; // ?score= verilmişse
  median: number | null;
  best: number | null;
  avgAccuracy: number | null; // 0–100
  questions: QuestionStat[];
}

export interface QuestionStat {
  questionId: string;
  attempts: number;
  correctRate: number; // 0–100
  avgMs: number | null;
}

export interface ApiError {
  ok: false;
  error: string;
}
