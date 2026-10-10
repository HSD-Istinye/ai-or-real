import rawQuestions from '@/data/questions.json';
import { Question } from '@/types/question';

/**
 * Soru havuzu. data/questions.json sade biçimde tutulur (Dataset ekibi bunu düzenler):
 *   { id, category, difficulty, realImage, aiImage, explanation }
 * Oyunun kullandığı Question biçimine burada, tek yerde çevrilir (hem tarayıcı hem sunucu).
 */
interface RawQuestion {
  id: string;
  category: string;
  difficulty: Question['difficulty'];
  realImage: string;
  aiImage: string;
  explanation: string;
}

const CATEGORY_TR: Record<string, string> = {
  portrait: 'Portre',
  nature: 'Doğa',
  animal: 'Hayvan',
  city: 'Şehir',
  food: 'Yemek',
  technology: 'Teknoloji',
  architecture: 'Mimari',
  art: 'Sanat',
};

export const QUESTIONS: Question[] = (rawQuestions as RawQuestion[]).map((q) => ({
  id: q.id,
  title: 'Hangisi yapay zekâ?',
  category: CATEGORY_TR[q.category] ?? q.category,
  difficulty: q.difficulty,
  description: '',
  correctAnswer: 'ai',
  options: [
    { id: 'real', imageUrl: q.realImage },
    { id: 'ai', imageUrl: q.aiImage },
  ],
  aiClues: [],
  explanation: q.explanation,
}));
