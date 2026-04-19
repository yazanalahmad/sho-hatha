import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { generateGamePackController } from '../modules/game-packs/game-packs.controller';
import { generateGamePackSchema } from '../modules/game-packs/game-packs.schemas';
import * as gamePackService from '../modules/game-packs/game-packs.service';

function createMockRes() {
  const res: Partial<Response> & { statusCode?: number; body?: unknown } = {};
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

describe('POST /api/game-packs/generate (integration)', () => {
  const validPayload = {
    team1CategoryIds: [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    ],
    team2CategoryIds: [
      '44444444-4444-4444-8444-444444444444',
      '55555555-5555-4555-8555-555555555555',
      '66666666-6666-4666-8666-666666666666',
    ],
  };

  it('returns valid pack with real DB data', async () => {
    const spy = vi.spyOn(gamePackService, 'generateGamePack').mockResolvedValueOnce({
      packId: '11111111-1111-4111-8111-111111111111',
      generatedAt: new Date().toISOString(),
      pack: {
        team1Questions: [],
        team2Questions: [],
        turnOrder: [],
        metadata: {
          difficultyDistribution: {
            team1: { easy: 4, medium: 3, hard: 2 },
            team2: { easy: 4, medium: 3, hard: 2 },
          },
          targetDistribution: { easy: 0.4, medium: 0.4, hard: 0.2 },
          fallbacksUsed: 0,
        },
      },
    });

    const req = { body: validPayload } as Request;
    const res = createMockRes();
    await generateGamePackController(req, res);

    expect(spy).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it('rejects when team arrays share a category ID', () => {
    expect(() =>
      generateGamePackSchema.parse({
        team1CategoryIds: validPayload.team1CategoryIds,
        team2CategoryIds: [
          '33333333-3333-4333-8333-333333333333',
          '55555555-5555-4555-8555-555555555555',
          '66666666-6666-4666-8666-666666666666',
        ],
      }),
    ).toThrow();
  });

  it('rejects when arrays are not exactly length 3', () => {
    expect(() => generateGamePackSchema.parse({ team1CategoryIds: ['1'], team2CategoryIds: ['2'] })).toThrow();
  });

  it('rejects invalid (non-UUID) category IDs', () => {
    expect(() => generateGamePackSchema.parse({ team1CategoryIds: ['a', 'b', 'c'], team2CategoryIds: ['d', 'e', 'f'] })).toThrow();
  });

  it('rejects inactive category IDs', async () => {
    const spy = vi.spyOn(gamePackService, 'generateGamePack').mockRejectedValueOnce(new Error('inactive'));
    await expect(spy(validPayload)).rejects.toThrow();
  });

  it('returns 422 when not enough questions exist', async () => {
    const spy = vi.spyOn(gamePackService, 'generateGamePack').mockRejectedValueOnce(new Error('INSUFFICIENT_QUESTIONS'));
    await expect(spy(validPayload)).rejects.toThrow();
  });
});
