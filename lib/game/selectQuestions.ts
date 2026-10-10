import { Question } from '@/types/question';
import { QUESTIONS } from './questions';
import { QUESTION_MIX } from './rules';
import { randomizeOptions } from './randomizeOptions';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Her zorluktan QUESTION_MIX kadar soru seçer (ör. 3 kolay + 4 orta + 3 zor),
 * sırayı karıştırır ve her sorunun A/B konumunu rastgele belirler.
 * Bir zorlukta yeterli soru yoksa eksik kalan yer diğer sorulardan doldurulur.
 */
export function selectQuestions(): Question[] {
  const picked: Question[] = [];
  for (const [difficulty, count] of Object.entries(QUESTION_MIX)) {
    picked.push(...shuffle(QUESTIONS.filter((q) => q.difficulty === difficulty)).slice(0, count));
  }
  const wanted = Object.values(QUESTION_MIX).reduce((a, b) => a + b, 0);
  if (picked.length < wanted) {
    const rest = shuffle(QUESTIONS.filter((q) => !picked.includes(q)));
    picked.push(...rest.slice(0, wanted - picked.length));
  }
  return shuffle(picked).map(randomizeOptions);
}
