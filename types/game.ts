import { Question, OptionType } from './question';
import { Foul } from './api';

export type GameStatus = 'idle' | 'playing' | 'answered' | 'finished';

/**
 * Bir turun aşamaları (süreli mod):
 * loading → görseller arka planda yükleniyor
 * wait    → "Hazır ol…" rastgele bekleme (erken basış = "Çok erken!")
 * live    → görseller göründü, süre akıyor
 * feedback→ sonuç gösteriliyor, kısa süre sonra sonraki tura geçilir
 */
export type RoundPhase = 'loading' | 'wait' | 'live' | 'feedback';

export interface PlayerAnswer {
  questionId: string;
  /** null = süre doldu */
  selectedOption: OptionType | null;
  isCorrect: boolean;
  /** görsellerin belirdiği andan cevaba kadar (ms) */
  timeSpentMs: number;
  /** bu sorunun süre sınırı (ms) */
  timeLimitMs?: number;
  /** null | 'guess' (çok hızlı, tahmin) | 'timeout' (süre doldu) */
  foul?: Foul | null;
  pointsEarned: number;
  streakAtAnswer: number;
}

export interface GameState {
  questions: Question[];
  currentIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  answers: PlayerAnswer[];
  status: GameStatus;
  questionStartTime?: number;
}

export interface GameSummary {
  totalQuestions: number;
  correctCount: number;
  accuracyPercentage: number;
  totalScore: number;
  maxStreak: number;
  rankTitle: string;
  rankBadge: string;
  rankDescription: string;
  answers: PlayerAnswer[];
  /** Leaderboard kaydı için benzersiz oyun kimliği (UUID). Tekrar gönderimde aynı kalır. */
  runId?: string;
  /** Oyuncunun oyuna başlamadan önce girdiği isim. */
  nick?: string;
  /** Oyunun bittiği an (ISO 8601). */
  playedAt?: string;
}
