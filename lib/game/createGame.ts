import { GameState } from '@/types/game';
import { selectQuestions } from './selectQuestions';

export function createGame(questionLimit?: number): GameState {
  const questions = selectQuestions(questionLimit);

  return {
    questions,
    currentIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    answers: [],
    status: questions.length > 0 ? 'playing' : 'idle',
    questionStartTime: Date.now(),
  };
}
