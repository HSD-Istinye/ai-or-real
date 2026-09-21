import { Question } from '@/types/question';
import rawQuestions from '@/data/questions.json';
import { randomizeOptions } from './randomizeOptions';

/**
 * Loads questions from questions.json, shuffles them and randomizes option order.
 */
export function selectQuestions(limit?: number): Question[] {
  const allQuestions = (rawQuestions as Question[]).map(q => randomizeOptions(q));
  
  // Shuffle questions array
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

  if (typeof limit === 'number' && limit > 0) {
    return shuffled.slice(0, limit);
  }

  return shuffled;
}
