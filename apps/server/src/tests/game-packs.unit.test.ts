import { beforeEach, describe, expect, it, vi } from 'vitest';

const findManyMock = vi.fn();
const queryRawMock = vi.fn();

vi.mock('../config/db', () => ({
  db: {
    category: { findMany: findManyMock },
    $queryRaw: queryRawMock,
  },
}));

type Difficulty = 'easy' | 'medium' | 'hard';

function asUuid(n: number): string {
  const hex = n.toString(16).padStart(12, '0');
  return `11111111-1111-4111-8111-${hex}`;
}

function buildRows(start: number, difficulty: Difficulty, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: asUuid(start + i),
    category_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    difficulty,
    points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
    question_en: `${difficulty} question ${start + i}`,
    question_ar: null,
    options_en: ['A', 'B', 'C', 'D'],
    options_ar: null,
    correct_answer_index: 0,
    explanation_en: null,
    explanation_ar: null,
  }));
}

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

describe('generateGamePack (unit)', () => {
  beforeEach(() => {
    findManyMock.mockReset();
    queryRawMock.mockReset();
    findManyMock.mockResolvedValue(
      [...validPayload.team1CategoryIds, ...validPayload.team2CategoryIds].map((id) => ({ id })),
    );
  });

  it('generates exactly 18 questions (9 per team)', async () => {
    queryRawMock
      .mockResolvedValueOnce(buildRows(1, 'easy', 4))
      .mockResolvedValueOnce(buildRows(10, 'medium', 3))
      .mockResolvedValueOnce(buildRows(20, 'hard', 2))
      .mockResolvedValueOnce(buildRows(30, 'easy', 4))
      .mockResolvedValueOnce(buildRows(40, 'medium', 3))
      .mockResolvedValueOnce(buildRows(50, 'hard', 2));

    const { generateGamePack } = await import('../modules/game-packs/game-packs.service');
    const result = await generateGamePack(validPayload);

    expect(result.pack.team1Questions).toHaveLength(9);
    expect(result.pack.team2Questions).toHaveLength(9);
  });

  it('produces no duplicate question IDs across the pack', async () => {
    queryRawMock
      .mockResolvedValueOnce(buildRows(1, 'easy', 4))
      .mockResolvedValueOnce(buildRows(10, 'medium', 3))
      .mockResolvedValueOnce(buildRows(20, 'hard', 2))
      .mockResolvedValueOnce(buildRows(30, 'easy', 4))
      .mockResolvedValueOnce(buildRows(40, 'medium', 3))
      .mockResolvedValueOnce(buildRows(50, 'hard', 2));

    const { generateGamePack } = await import('../modules/game-packs/game-packs.service');
    const result = await generateGamePack(validPayload);

    const ids = [...result.pack.team1Questions, ...result.pack.team2Questions].map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('targets 40/40/20 difficulty split', async () => {
    queryRawMock
      .mockResolvedValueOnce(buildRows(1, 'easy', 4))
      .mockResolvedValueOnce(buildRows(10, 'medium', 3))
      .mockResolvedValueOnce(buildRows(20, 'hard', 2))
      .mockResolvedValueOnce(buildRows(30, 'easy', 4))
      .mockResolvedValueOnce(buildRows(40, 'medium', 3))
      .mockResolvedValueOnce(buildRows(50, 'hard', 2));

    const { generateGamePack } = await import('../modules/game-packs/game-packs.service');
    const result = await generateGamePack(validPayload);

    expect(result.pack.metadata.difficultyDistribution.team1).toEqual({ easy: 4, medium: 3, hard: 2 });
  });

  it('uses fallback when a difficulty tier is exhausted', async () => {
    queryRawMock
      .mockResolvedValueOnce(buildRows(1, 'easy', 2))
      .mockResolvedValueOnce(buildRows(10, 'medium', 3))
      .mockResolvedValueOnce(buildRows(20, 'hard', 2))
      .mockResolvedValueOnce(buildRows(60, 'easy', 2))
      .mockResolvedValueOnce(buildRows(30, 'easy', 4))
      .mockResolvedValueOnce(buildRows(40, 'medium', 3))
      .mockResolvedValueOnce(buildRows(50, 'hard', 2));

    const { generateGamePack } = await import('../modules/game-packs/game-packs.service');
    const result = await generateGamePack(validPayload);

    expect(result.pack.metadata.fallbacksUsed).toBeGreaterThan(0);
  });

  it('includes metadata with fallbacksUsed count', async () => {
    queryRawMock
      .mockResolvedValueOnce(buildRows(1, 'easy', 4))
      .mockResolvedValueOnce(buildRows(10, 'medium', 3))
      .mockResolvedValueOnce(buildRows(20, 'hard', 2))
      .mockResolvedValueOnce(buildRows(30, 'easy', 4))
      .mockResolvedValueOnce(buildRows(40, 'medium', 3))
      .mockResolvedValueOnce(buildRows(50, 'hard', 2));

    const { generateGamePack } = await import('../modules/game-packs/game-packs.service');
    const result = await generateGamePack(validPayload);

    expect(typeof result.pack.metadata.fallbacksUsed).toBe('number');
  });

  it('turn order alternates team 1 and team 2', async () => {
    queryRawMock
      .mockResolvedValueOnce(buildRows(1, 'easy', 4))
      .mockResolvedValueOnce(buildRows(10, 'medium', 3))
      .mockResolvedValueOnce(buildRows(20, 'hard', 2))
      .mockResolvedValueOnce(buildRows(30, 'easy', 4))
      .mockResolvedValueOnce(buildRows(40, 'medium', 3))
      .mockResolvedValueOnce(buildRows(50, 'hard', 2));

    const { generateGamePack } = await import('../modules/game-packs/game-packs.service');
    const result = await generateGamePack(validPayload);

    result.pack.turnOrder.forEach((turn, index) => {
      expect(turn.team).toBe(index % 2 === 0 ? 1 : 2);
    });
  });
});
