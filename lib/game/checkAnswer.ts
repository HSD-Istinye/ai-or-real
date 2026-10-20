import { Question, OptionType } from '@/types/question';
import { PlayerAnswer } from '@/types/game';
import { Foul } from '@/types/api';
import { calculateQuestionScore } from './calculateScore';
import { GUESS_MS, timeLimitFor } from './rules';

export interface CheckAnswerInput {
  question: Question;
  /** null = süre doldu, cevap verilmedi */
  selectedOption: OptionType | null;
  /** görsellerin belirdiği andan cevaba kadar geçen süre (ms) */
  timeSpentMs: number | null;
  currentStreak: number;
}

/**
 * Bir cevabı değerlendirir. Hem oyunda hem sunucuda (skor doğrulama) kullanılır,
 * bu yüzden "tahmin" ve "süre doldu" kararı da burada verilir.
 */
export function checkAnswer({
  question,
  selectedOption,
  timeSpentMs,
  currentStreak,
}: CheckAnswerInput): PlayerAnswer {
  const timeLimitMs = timeLimitFor(question);

  let foul: Foul | null = null;
  if (selectedOption === null || timeSpentMs === null || timeSpentMs > timeLimitMs) foul = 'timeout';
  else if (timeSpentMs < GUESS_MS) foul = 'guess';

  const isCorrect = foul === null && selectedOption === question.correctAnswer;
  const pointsEarned = calculateQuestionScore({
    isCorrect,
    timeSpentMs: timeSpentMs ?? timeLimitMs,
    timeLimitMs,
    currentStreak,
    foul,
  });

  return {
    questionId: question.id,
    selectedOption,
    isCorrect,
    timeSpentMs: foul === 'timeout' ? timeLimitMs : (timeSpentMs as number),
    timeLimitMs,
    foul,
    pointsEarned,
    streakAtAnswer: isCorrect ? currentStreak + 1 : 0,
  };
}
