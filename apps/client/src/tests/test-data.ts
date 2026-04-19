import type { GamePack } from '../state/types';

function mkQuestion(id: string, points: 10 | 20 | 30 = 10) {
  const difficulty: 'easy' | 'medium' | 'hard' =
    points === 10 ? 'easy' : points === 20 ? 'medium' : 'hard';
  return {
    id,
    categoryId: '11111111-1111-4111-8111-111111111111',
    difficulty,
    points,
    question_en: `Question ${id}`,
    question_ar: null,
    options_en: ['A1', 'B1', 'C1', 'D1'],
    options_ar: null,
    correct_answer_index: 1,
    explanation_en: 'Explanation',
    explanation_ar: null,
  };
}

export function buildPack(): GamePack {
  return {
    packId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    generatedAt: new Date().toISOString(),
    pack: {
      team1Questions: Array.from({ length: 9 }, (_, i) => mkQuestion(`t1-${i}`)),
      team2Questions: Array.from({ length: 9 }, (_, i) => mkQuestion(`t2-${i}`)),
      turnOrder: Array.from({ length: 18 }, (_, i) => ({
        turn: i + 1,
        team: (i % 2 === 0 ? 1 : 2) as 1 | 2,
        questionId: i % 2 === 0 ? `t1-${Math.floor(i / 2)}` : `t2-${Math.floor(i / 2)}`,
      })),
    },
  };
}
