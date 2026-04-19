import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { getAllCategoriesController, getRandomCategoriesController } from '../modules/categories/categories.controller';
import { randomCategoriesQuerySchema } from '../modules/categories/categories.schemas';
import * as categoriesService from '../modules/categories/categories.service';

function createMockRes() {
  const res: Partial<Response> & {
    statusCode?: number;
    body?: unknown;
  } = {};

  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res as Response;
  });
  res.json = vi.fn((body: unknown) => {
    res.body = body;
    return res as Response;
  });

  return res as Response & { statusCode?: number; body?: unknown };
}

describe('GET /api/categories/random', () => {
  it('returns all active categories from GET /api/categories', async () => {
    const spy = vi
      .spyOn(categoriesService, 'getAllCategories')
      .mockResolvedValueOnce([
        { id: '1', slug: 'history', name_en: 'History', name_ar: 'تاريخ', icon: '📜' },
      ]);

    const req = { query: {} } as unknown as Request;
    const res = createMockRes();

    await getAllCategoriesController(req, res);

    expect(spy).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      categories: [{ id: '1', slug: 'history', name_en: 'History', name_ar: 'تاريخ', icon: '📜' }],
    });
  });

  it('returns 6 by default', async () => {
    const spy = vi
      .spyOn(categoriesService, 'getRandomCategories')
      .mockResolvedValueOnce([]);

    const req = { query: {} } as unknown as Request;
    const res = createMockRes();

    await getRandomCategoriesController(req, res);

    expect(spy).toHaveBeenCalledWith(6);
    expect(res.statusCode).toBe(200);
  });

  it('returns requested count when ?count=3', () => {
    expect(randomCategoriesQuerySchema.parse({ count: 3 }).count).toBe(3);
  });

  it('returns only active categories', async () => {
    const spy = vi
      .spyOn(categoriesService, 'getRandomCategories')
      .mockResolvedValueOnce([
        { id: '1', slug: 'history', name_en: 'History', name_ar: 'تاريخ', icon: '📜' },
      ]);

    const req = { query: { count: '2' } } as unknown as Request;
    const res = createMockRes();

    await getRandomCategoriesController(req, res);

    expect(spy).toHaveBeenCalledWith(2);
    expect(res.statusCode).toBe(200);
  });

  it('returns different sets across calls (randomness)', async () => {
    const spy = vi
      .spyOn(categoriesService, 'getRandomCategories')
      .mockResolvedValueOnce([{ id: '1', slug: 'history', name_en: 'History', name_ar: 'تاريخ', icon: '📜' }])
      .mockResolvedValueOnce([{ id: '2', slug: 'science', name_en: 'Science', name_ar: 'علوم', icon: '🔬' }]);

    const req = { query: { count: '2' } } as unknown as Request;
    const res1 = createMockRes();
    const res2 = createMockRes();

    await getRandomCategoriesController(req, res1);
    await getRandomCategoriesController(req, res2);

    expect(res1.body).not.toEqual(res2.body);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects count < 2 with 400', () => {
    expect(() => randomCategoriesQuerySchema.parse({ count: 1 })).toThrow();
  });

  it('rejects count > 12 with 400', () => {
    expect(() => randomCategoriesQuerySchema.parse({ count: 13 })).toThrow();
  });

  it('rejects non-integer count with 400', () => {
    expect(() => randomCategoriesQuerySchema.parse({ count: '3.5' })).toThrow();
  });
});
