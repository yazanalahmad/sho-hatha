import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../../config/db';
import { AppError } from '../../lib/errors';
import type {
  BoardQuestion,
  Difficulty,
  GameQuestion,
  GenerateBoardGamePackResponse,
  GenerateGamePackResponse,
  TeamDifficultyDistribution,
  TurnOrderItem,
} from './game-packs.types';

const difficultyTargets: Record<Difficulty, number> = {
  easy: 4,
  medium: 3,
  hard: 2,
};

const questionRowSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.union([z.literal(10), z.literal(20), z.literal(30)]),
  question_en: z.string(),
  question_ar: z.string().nullable(),
  image_url: z.string().nullable().optional().default(null),
  options_en: z.array(z.string()).length(4),
  options_ar: z.array(z.string()).length(4).nullable(),
  correct_answer_index: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation_en: z.string().nullable(),
  explanation_ar: z.string().nullable(),
});

type QuestionRow = z.infer<typeof questionRowSchema>;

function parseQuestionRow(row: Record<string, unknown>): QuestionRow {
  try {
    return questionRowSchema.parse(row);
  } catch {
    throw new AppError(422, 'INVALID_QUESTION_DATA', 'Question data is invalid for board generation', []);
  }
}

function mapRowToQuestion(row: QuestionRow): GameQuestion {
  return {
    id: row.id,
    categoryId: row.category_id,
    difficulty: row.difficulty,
    points: row.points,
    question_en: row.question_en,
    question_ar: row.question_ar,
    image_url: row.image_url,
    options_en: row.options_en as [string, string, string, string],
    options_ar: row.options_ar as [string, string, string, string] | null,
    correct_answer_index: row.correct_answer_index,
    explanation_en: row.explanation_en,
    explanation_ar: row.explanation_ar,
  };
}

function mapRowToBoardQuestion(row: QuestionRow): BoardQuestion {
  const pointValue = row.difficulty === 'easy' ? 1 : row.difficulty === 'medium' ? 2 : 3;
  return {
    id: row.id,
    categoryId: row.category_id,
    difficulty: row.difficulty,
    pointValue,
    question_en: row.question_en,
    question_ar: row.question_ar,
    image_url: row.image_url,
    options_en: row.options_en as [string, string, string, string],
    options_ar: row.options_ar as [string, string, string, string] | null,
    correct_answer_index: row.correct_answer_index,
    explanation_en: row.explanation_en,
    explanation_ar: row.explanation_ar,
  };
}

function buildUuidListClause(values: string[]): Prisma.Sql {
  return Prisma.join(values.map((value) => Prisma.sql`CAST(${value} AS uuid)`));
}

function buildExcludeClause(excludeIds: string[]): Prisma.Sql {
  if (excludeIds.length === 0) {
    return Prisma.sql``;
  }

  return Prisma.sql`AND id NOT IN (${buildUuidListClause(excludeIds)})`;
}

async function fetchRandomQuestions(
  categoryIds: string[],
  limit: number,
  excludeIds: string[],
  difficulty?: Difficulty,
): Promise<GameQuestion[]> {
  if (limit <= 0) {
    return [];
  }

  const excludeClause = buildExcludeClause(excludeIds);
  const difficultyClause = difficulty
    ? Prisma.sql`AND difficulty = ${difficulty}`
    : Prisma.sql``;

  const rows = await db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    SELECT
      id,
      category_id,
      difficulty,
      points,
      question_en,
      question_ar,
      image_url,
      options_en,
      options_ar,
      correct_answer_index,
      explanation_en,
      explanation_ar
    FROM questions
    WHERE category_id IN (${buildUuidListClause(categoryIds)})
      AND is_active = true
      ${difficultyClause}
      ${excludeClause}
    ORDER BY random()
    LIMIT ${limit}
  `);

  return rows.map((row) => mapRowToQuestion(parseQuestionRow(row)));
}

async function fetchRandomQuestion(
  categoryId: string,
  difficulty: Difficulty,
  excludeIds: string[],
): Promise<BoardQuestion | null> {
  const excludeClause = buildExcludeClause(excludeIds);
  const rows = await db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    SELECT
      id,
      category_id,
      difficulty,
      points,
      question_en,
      question_ar,
      image_url,
      options_en,
      options_ar,
      correct_answer_index,
      explanation_en,
      explanation_ar
    FROM questions
    WHERE category_id = CAST(${categoryId} AS uuid)
      AND difficulty = ${difficulty}
      AND is_active = true
      ${excludeClause}
    ORDER BY random()
    LIMIT 1
  `);

  const firstRow = rows[0];
  if (!firstRow) return null;
  return mapRowToBoardQuestion(parseQuestionRow(firstRow));
}

async function fetchAnyRandomQuestionFromCategory(
  categoryId: string,
  excludeIds: string[],
): Promise<BoardQuestion | null> {
  const excludeClause = buildExcludeClause(excludeIds);
  const rows = await db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    SELECT
      id,
      category_id,
      difficulty,
      points,
      question_en,
      question_ar,
      image_url,
      options_en,
      options_ar,
      correct_answer_index,
      explanation_en,
      explanation_ar
    FROM questions
    WHERE category_id = CAST(${categoryId} AS uuid)
      AND is_active = true
      ${excludeClause}
    ORDER BY random()
    LIMIT 1
  `);

  const firstRow = rows[0];
  if (!firstRow) return null;
  return mapRowToBoardQuestion(parseQuestionRow(firstRow));
}

function calculateDistribution(questions: GameQuestion[]): TeamDifficultyDistribution {
  return questions.reduce<TeamDifficultyDistribution>(
    (acc, question) => {
      acc[question.difficulty] += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 },
  );
}

async function buildTeamQuestions(
  categoryIds: string[],
  usedQuestionIds: Set<string>,
): Promise<{ questions: GameQuestion[]; fallbacksUsed: number }> {
  const selected: GameQuestion[] = [];
  let fallbacksUsed = 0;

  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const target = difficultyTargets[difficulty];
    const questions = await fetchRandomQuestions(
      categoryIds,
      target,
      [...usedQuestionIds, ...selected.map((q) => q.id)],
      difficulty,
    );

    selected.push(...questions);

    if (questions.length < target) {
      fallbacksUsed += target - questions.length;
    }
  }

  const remaining = 9 - selected.length;

  if (remaining > 0) {
    const fallbackQuestions = await fetchRandomQuestions(
      categoryIds,
      remaining,
      [...usedQuestionIds, ...selected.map((q) => q.id)],
    );

    if (fallbackQuestions.length < remaining) {
      throw new AppError(
        422,
        'INSUFFICIENT_QUESTIONS',
        'Not enough active questions to generate a full game pack',
        [],
      );
    }

    selected.push(...fallbackQuestions);
  }

  selected.forEach((question) => usedQuestionIds.add(question.id));

  return { questions: selected, fallbacksUsed };
}

async function assertCategoriesAreActive(categoryIds: string[]): Promise<void> {
  const categories = await db.category.findMany({
    where: {
      id: { in: categoryIds },
      is_active: true,
    },
    select: { id: true },
  });

  if (categories.length !== categoryIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'All category IDs must exist and be active', []);
  }
}

async function getCategoriesByIds(categoryIds: string[]) {
  const categories = await db.category.findMany({
    where: {
      id: { in: categoryIds },
      is_active: true,
    },
    select: {
      id: true,
      slug: true,
      name_en: true,
      name_ar: true,
      icon: true,
    },
  });

  if (categories.length !== categoryIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'All category IDs must exist and be active', []);
  }

  const byId = new Map(categories.map((category) => [category.id, category]));
  return categoryIds.map((id) => byId.get(id)).filter((category): category is NonNullable<typeof category> => Boolean(category));
}

function buildTurnOrder(team1Questions: GameQuestion[], team2Questions: GameQuestion[]): TurnOrderItem[] {
  const turnOrder: TurnOrderItem[] = [];

  for (let i = 0; i < 9; i += 1) {
    const team1Question = team1Questions[i];
    const team2Question = team2Questions[i];

    if (!team1Question || !team2Question) {
      throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Invalid turn generation state', []);
    }

    turnOrder.push(
      { turn: i * 2 + 1, team: 1, questionId: team1Question.id },
      { turn: i * 2 + 2, team: 2, questionId: team2Question.id },
    );
  }

  return turnOrder;
}

export async function generateGamePack(payload: {
  team1CategoryIds: string[];
  team2CategoryIds: string[];
}): Promise<GenerateGamePackResponse> {
  const allCategoryIds = [...payload.team1CategoryIds, ...payload.team2CategoryIds];
  await assertCategoriesAreActive(allCategoryIds);

  const usedQuestionIds = new Set<string>();

  const team1Result = await buildTeamQuestions(payload.team1CategoryIds, usedQuestionIds);
  const team2Result = await buildTeamQuestions(payload.team2CategoryIds, usedQuestionIds);

  const turnOrder = buildTurnOrder(team1Result.questions, team2Result.questions);

  return {
    packId: randomUUID(),
    generatedAt: new Date().toISOString(),
    pack: {
      team1Questions: team1Result.questions,
      team2Questions: team2Result.questions,
      turnOrder,
      metadata: {
        difficultyDistribution: {
          team1: calculateDistribution(team1Result.questions),
          team2: calculateDistribution(team2Result.questions),
        },
        targetDistribution: {
          easy: 0.4,
          medium: 0.4,
          hard: 0.2,
        },
        fallbacksUsed: team1Result.fallbacksUsed + team2Result.fallbacksUsed,
      },
    },
  };
}

export async function generateBoardGamePack(payload: {
  team1CategoryIds: string[];
  team2CategoryIds: string[];
}): Promise<GenerateBoardGamePackResponse> {
  const allCategoryIds = [...payload.team1CategoryIds, ...payload.team2CategoryIds];
  await assertCategoriesAreActive(allCategoryIds);

  const usedQuestionIds = new Set<string>();
  const questions: BoardQuestion[] = [];
  let fallbackCount = 0;

  for (const categoryId of allCategoryIds) {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      let question = await fetchRandomQuestion(categoryId, difficulty, [...usedQuestionIds]);
      if (!question) {
        // If a category lacks one difficulty tier, fallback to any unused question in that category.
        question = await fetchAnyRandomQuestionFromCategory(categoryId, [...usedQuestionIds]);
        fallbackCount += 1;
      }
      if (!question) {
        throw new AppError(
          422,
          'INSUFFICIENT_QUESTIONS',
          `Not enough active questions for category ${categoryId} (${difficulty})`,
          [],
        );
      }
      usedQuestionIds.add(question.id);
      questions.push({
        ...question,
        pointValue: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
      });
    }
  }

  const team1Categories = await getCategoriesByIds(payload.team1CategoryIds);
  const team2Categories = await getCategoriesByIds(payload.team2CategoryIds);

  return {
    packId: randomUUID(),
    generatedAt: new Date().toISOString(),
    pack: {
      team1Categories,
      team2Categories,
      questions,
      metadata: {
        fallbacksUsed: fallbackCount,
      },
    },
  };
}
