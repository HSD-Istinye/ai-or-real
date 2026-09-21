import { Question, QuestionOption } from '@/types/question';

/**
 * Shuffles the options of a question so that AI is not always in the same position (A or B).
 */
export function randomizeOptions(question: Question): Question {
  const shuffled: QuestionOption[] = [...question.options].sort(() => Math.random() - 0.5);

  const labeledOptions = shuffled.map((opt, index) => ({
    ...opt,
    label: index === 0 ? 'Seçenek A' : 'Seçenek B',
  }));

  return {
    ...question,
    options: labeledOptions,
  };
}
