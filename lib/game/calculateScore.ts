import { GameState, GameSummary, PlayerAnswer } from '@/types/game';

interface ScoreCalculationParams {
  isCorrect: boolean;
  timeSpentMs: number;
  currentStreak: number;
}

export function calculateQuestionScore({
  isCorrect,
  timeSpentMs,
  currentStreak,
}: ScoreCalculationParams): number {
  if (!isCorrect) return 0;

  const basePoints = 100;

  // Streak Multiplier: 1x, 1.25x, 1.5x, up to 2.5x
  const streakMultiplier = Math.min(1 + currentStreak * 0.25, 2.5);

  // Speed Bonus: Up to 50 points if answered within 15 seconds
  const maxTimeForBonus = 15000;
  const timeBonus = Math.max(0, Math.round((1 - Math.min(timeSpentMs, maxTimeForBonus) / maxTimeForBonus) * 50));

  const total = Math.round(basePoints * streakMultiplier) + timeBonus;
  return total;
}

export function generateGameSummary(state: GameState): GameSummary {
  const totalQuestions = state.questions.length;
  const correctCount = state.answers.filter((a) => a.isCorrect).length;
  const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let rankTitle = 'Acemi Meraklı';
  let rankBadge = '🌱';
  let rankDescription = 'Yapay zekâ ve gerçek fotoğraflar arasındaki çizgiyi keşfetmeye yeni başladın.';

  if (accuracyPercentage === 100) {
    rankTitle = 'Turing Dedektifi';
    rankBadge = '👑';
    rankDescription = 'Kusursuz gözlem yeteneği! Hiçbir yapay zekâ halüsinasyonu gözünden kaçmadı.';
  } else if (accuracyPercentage >= 70) {
    rankTitle = 'Siber Gözlemci';
    rankBadge = '⚡';
    rankDescription = 'Harika bir algı! AI detaylarını ve ışık tutarsızlıklarını ustaca fark ediyorsun.';
  } else if (accuracyPercentage >= 40) {
    rankTitle = 'Gelişen Araştırmacı';
    rankBadge = '🔍';
    rankDescription = 'İyi bir deneme! Birkaç küçük detaya daha dikkat ederek skoru zirveye taşıyabilirsin.';
  }

  return {
    totalQuestions,
    correctCount,
    accuracyPercentage,
    totalScore: state.score,
    maxStreak: state.maxStreak,
    rankTitle,
    rankBadge,
    rankDescription,
    answers: state.answers,
  };
}
