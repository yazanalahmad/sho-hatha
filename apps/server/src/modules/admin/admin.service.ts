import type { Prisma } from '@prisma/client';
import { db } from '../../config/db';
import { AppError } from '../../lib/errors';
import type { CategoryInput, PaginationQuery, QuestionInput } from './admin.types';

const pointsMap: Record<QuestionInput['difficulty'], 10 | 20 | 30> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

async function ensureQuestionExists(id: string): Promise<void> {
  const existing = await db.question.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Question not found', []);
  }
}

async function ensureCategoryExists(id: string): Promise<void> {
  const existing = await db.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Category not found', []);
  }
}

export async function listQuestions(query: PaginationQuery) {
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    db.question.findMany({
      skip,
      take: query.limit,
      orderBy: { created_at: 'desc' },
    }),
    db.question.count(),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function getQuestionById(id: string) {
  await ensureQuestionExists(id);
  return db.question.findUniqueOrThrow({ where: { id } });
}

export async function createQuestion(input: QuestionInput) {
  const data: Prisma.QuestionCreateInput = {
    category: { connect: { id: input.category_id } },
    difficulty: input.difficulty,
    points: pointsMap[input.difficulty],
    question_en: input.question_en,
    question_ar: input.question_ar,
    image_url: input.image_url ?? null,
    options_en: input.options_en,
    options_ar: input.options_ar,
    correct_answer_index: input.correct_answer_index,
    explanation_en: input.explanation_en,
    explanation_ar: input.explanation_ar,
    is_active: input.is_active ?? true,
  };

  return db.question.create({ data });
}

export async function updateQuestion(id: string, input: QuestionInput) {
  await ensureQuestionExists(id);
  return db.question.update({
    where: { id },
    data: {
      category_id: input.category_id,
      difficulty: input.difficulty,
      points: pointsMap[input.difficulty],
      question_en: input.question_en,
      question_ar: input.question_ar,
      image_url: input.image_url ?? null,
      options_en: input.options_en,
      options_ar: input.options_ar,
      correct_answer_index: input.correct_answer_index,
      explanation_en: input.explanation_en,
      explanation_ar: input.explanation_ar,
      is_active: input.is_active ?? true,
    },
  });
}

export async function toggleQuestionActive(id: string) {
  const current = await db.question.findUnique({ where: { id }, select: { is_active: true } });
  if (!current) {
    throw new AppError(404, 'NOT_FOUND', 'Question not found', []);
  }

  return db.question.update({ where: { id }, data: { is_active: !current.is_active } });
}

export async function softDeleteQuestion(id: string) {
  await ensureQuestionExists(id);
  return db.question.update({ where: { id }, data: { is_active: false } });
}

export async function listCategories() {
  return db.category.findMany({ orderBy: { created_at: 'desc' } });
}

export async function getCategoryById(id: string) {
  await ensureCategoryExists(id);
  return db.category.findUniqueOrThrow({ where: { id } });
}

export async function createCategory(input: CategoryInput) {
  return db.category.create({
    data: {
      slug: input.slug,
      name_en: input.name_en,
      name_ar: input.name_ar,
      icon: input.icon,
      description_en: input.description_en,
      description_ar: input.description_ar,
      is_active: input.is_active ?? true,
    },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  await ensureCategoryExists(id);
  return db.category.update({
    where: { id },
    data: {
      slug: input.slug,
      name_en: input.name_en,
      name_ar: input.name_ar,
      icon: input.icon,
      description_en: input.description_en,
      description_ar: input.description_ar,
      is_active: input.is_active ?? true,
    },
  });
}

export async function toggleCategoryActive(id: string) {
  const current = await db.category.findUnique({ where: { id }, select: { is_active: true } });
  if (!current) {
    throw new AppError(404, 'NOT_FOUND', 'Category not found', []);
  }

  return db.category.update({ where: { id }, data: { is_active: !current.is_active } });
}

export async function softDeleteCategory(id: string) {
  await ensureCategoryExists(id);
  return db.category.update({ where: { id }, data: { is_active: false } });
}
