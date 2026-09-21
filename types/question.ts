export type OptionType = 'real' | 'ai';

export interface QuestionOption {
  id: OptionType;
  imageUrl: string;
  label?: string;
  sourceDescription?: string;
}

export interface Question {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  correctAnswer: OptionType;
  options: QuestionOption[];
  aiClues: string[];
  explanation: string;
}
