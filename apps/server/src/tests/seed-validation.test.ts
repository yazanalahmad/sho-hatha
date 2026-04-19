import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type QuestionSeed = {
  category_slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  question_en: string;
  options_en: string[];
  options_ar?: string[];
  correct_answer_index: number;
};

type CategorySeed = { slug: string };

const categories = JSON.parse(
  readFileSync(join(process.cwd(), 'data/categories.seed.json'), 'utf-8'),
) as CategorySeed[];
const questions = JSON.parse(
  readFileSync(join(process.cwd(), 'data/questions.seed.json'), 'utf-8'),
) as QuestionSeed[];

describe('Seed data validation', () => {
  it('all questions have exactly 4 options', () => {
    for (const question of questions) {
      expect(question.options_en).toHaveLength(4);
      if (question.options_ar) {
        expect(question.options_ar).toHaveLength(4);
      }
    }
  });

  it('correct_answer_index is 0–3 for every question', () => {
    for (const question of questions) {
      expect(question.correct_answer_index).toBeGreaterThanOrEqual(0);
      expect(question.correct_answer_index).toBeLessThanOrEqual(3);
    }
  });

  it('all category_slugs exist in categories.seed.json', () => {
    const categorySlugs = new Set(categories.map((category) => category.slug));
    for (const question of questions) {
      expect(categorySlugs.has(question.category_slug)).toBe(true);
    }
  });

  it('points match difficulty for every question', () => {
    const pointsMap = { easy: 10, medium: 20, hard: 30 } as const;
    for (const question of questions) {
      expect(question.points).toBe(pointsMap[question.difficulty]);
    }
  });

  it('no duplicate question_en values', () => {
    const values = questions.map((question) => question.question_en);
    expect(new Set(values).size).toBe(values.length);
  });
});
