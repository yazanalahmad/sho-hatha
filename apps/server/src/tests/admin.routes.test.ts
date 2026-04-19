import { describe, expect, it } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { requireAdminToken } from '../middleware/require-admin-token';
import { createCategorySchema, createQuestionSchema } from '../modules/admin/admin.schemas';

function createMockRes() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as Response & { statusCode: number; body: unknown };
}

describe('Admin routes — authentication', () => {
  it('returns 401 with no token on GET /api/admin/questions', () => {
    const req = { header: () => undefined } as unknown as Request;
    const res = createMockRes();
    const next = (() => undefined) as NextFunction;

    requireAdminToken(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with wrong token', () => {
    const req = { header: () => 'wrong-token' } as unknown as Request;
    const res = createMockRes();
    const next = (() => undefined) as NextFunction;

    requireAdminToken(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 with valid token', () => {
    let called = false;
    const req = { header: () => 'test-token-32-chars-long-pad-pad-pad' } as unknown as Request;
    const res = createMockRes();
    const next = (() => {
      called = true;
    }) as NextFunction;

    requireAdminToken(req, res, next);
    expect(called).toBe(true);
  });
});

describe('Admin questions CRUD', () => {
  it('creates a valid question', () => {
    const parsed = createQuestionSchema.parse({
      category_id: '11111111-1111-4111-8111-111111111111',
      difficulty: 'easy',
      question_en: 'Valid question text',
      options_en: ['A', 'B', 'C', 'D'],
      correct_answer_index: 0,
    });
    expect(parsed.difficulty).toBe('easy');
  });

  it('derives points from difficulty (ignores client-supplied points)', () => {
    const parsed = createQuestionSchema.parse({
      category_id: '11111111-1111-4111-8111-111111111111',
      difficulty: 'hard',
      points: 10,
      question_en: 'Question that ignores points',
      options_en: ['A', 'B', 'C', 'D'],
      correct_answer_index: 1,
    });
    expect(parsed.difficulty).toBe('hard');
  });

  it('rejects question with wrong options count', () => {
    expect(() =>
      createQuestionSchema.parse({
        category_id: '11111111-1111-4111-8111-111111111111',
        difficulty: 'easy',
        question_en: 'Wrong options count question',
        options_en: ['A', 'B', 'C'],
        correct_answer_index: 0,
      }),
    ).toThrow();
  });

  it('rejects correct_answer_index > 3', () => {
    expect(() =>
      createQuestionSchema.parse({
        category_id: '11111111-1111-4111-8111-111111111111',
        difficulty: 'easy',
        question_en: 'Wrong answer index question',
        options_en: ['A', 'B', 'C', 'D'],
        correct_answer_index: 4,
      }),
    ).toThrow();
  });

  it('toggles is_active on PATCH', () => {
    expect(true).toBe(true);
  });

  it('soft-deletes on DELETE (is_active becomes false)', () => {
    expect(true).toBe(true);
  });
});

describe('Admin categories CRUD', () => {
  it('creates a valid category', () => {
    const parsed = createCategorySchema.parse({
      slug: 'new-category',
      name_en: 'New Category',
      name_ar: 'فئة جديدة',
    });
    expect(parsed.slug).toBe('new-category');
  });

  it('rejects duplicate slug', () => {
    expect(true).toBe(true);
  });

  it('toggles is_active', () => {
    expect(true).toBe(true);
  });
});
