import { Question, OptionType } from '@/types/question';
import { PlayerAnswer } from '@/types/game';
import { calculateQuestionScore } from './calculateScore';

export interface CheckAnswerInput {
  question: Question;
  selectedOption: OptionType;
  timeSpentMs: number;
  currentStreak: number;
}

export function checkAnswer({
  question,
  selectedOption,
  timeSpentMs,
  currentStreak,
}: CheckAnswerInput): PlayerAnswer {
  // Spot the AI means the user is identifying the AI image
  const isCorrect = selectedOption === question.correctAnswer;
  const newStreak = isCorrect ? currentStreak + 1 : 0;
  const pointsEarned = calculateQuestionScore({
    isCorrect,
    timeSpentMs,
    currentStreak,
  });

  return {
    questionId: question.id,
    selectedOption,
    isCorrect,
    timeSpentMs,
    pointsEarned,
    streakAtAnswer: newStreak,
  };
}
