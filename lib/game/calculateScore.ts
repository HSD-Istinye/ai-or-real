import { GameState, GameSummary, RankKey } from '@/types/game';
import { Foul } from '@/types/api';
import { BASE_POINTS, SPEED_POINTS, STREAK_MAX, STREAK_STEP } from './rules';

interface ScoreCalculationParams {
  isCorrect: boolean;
  timeSpentMs: number;
  timeLimitMs: number;
  currentStreak: number;
  foul?: Foul | null;
}

/**
 * Süreli mod puanı:
 *   doğru  → (500 + 500 × (1 − süre/süreSınırı)) × seri çarpanı   [500–1500]
 *   yanlış / süre doldu / tahmin → 0  (ceza yok)
 * Seri çarpanı: 1.0, 1.1, 1.2 … en fazla 1.5
 */
export function calculateQuestionScore({
  isCorrect,
  timeSpentMs,
  timeLimitMs,
  currentStreak,
  foul,
}: ScoreCalculationParams): number {
  if (!isCorrect || foul) return 0;

  const t = Math.min(Math.max(timeSpentMs, 0), timeLimitMs);
  const speed = 1 - t / timeLimitMs; // 1 = anında, 0 = son saniyede
  const raw = BASE_POINTS + SPEED_POINTS * speed;
  const streakMultiplier = Math.min(1 + currentStreak * STREAK_STEP, STREAK_MAX);

  return Math.round(raw * streakMultiplier);
}
export function generateGameSummary(state: GameState): GameSummary {
  const totalQuestions = state.questions.length;
  const correctCount = state.answers.filter((a) => a.isCorrect).length;
  const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let rankKey: RankKey = 'novice';
  if (accuracyPercentage === 100) rankKey = 'detective';
  else if (accuracyPercentage >= 70) rankKey = 'observer';
  else if (accuracyPercentage >= 40) rankKey = 'developing';

  return {
    totalQuestions,
    correctCount,
    accuracyPercentage,
    totalScore: state.score,
    maxStreak: state.maxStreak,
    rankKey,
    answers: state.answers,
    layouts: Object.fromEntries(state.questions.map((q) => [q.id, q.options.map((o) => o.id)])),
  };
}
