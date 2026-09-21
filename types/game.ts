import { Question, OptionType } from './question';

export type GameStatus = 'idle' | 'playing' | 'answered' | 'finished';

export interface PlayerAnswer {
  questionId: string;
  selectedOption: OptionType;
  isCorrect: boolean;
  timeSpentMs: number;
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
}
