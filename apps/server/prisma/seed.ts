import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const categorySeedSchema = z.object({
  slug: z.string().min(2),
  name_en: z.string().min(1),
  name_ar: z.string().min(1),
  icon: z.string().optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  is_active: z.boolean().default(true),
});

const questionSeedSchema = z
  .object({
    category_slug: z.string().min(2),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    points: z.union([z.literal(10), z.literal(20), z.literal(30)]),
    question_en: z.string().min(5),
    question_ar: z.string().optional(),
    image_url: z.string().min(1).optional().nullable(),
    options_en: z.array(z.string().min(1)).length(4),
    options_ar: z.array(z.string().min(1)).length(4).optional(),
    correct_answer_index: z.number().int().min(0).max(3),
    explanation_en: z.string().optional(),
    explanation_ar: z.string().optional(),
    is_active: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    const pointsMap = { easy: 10, medium: 20, hard: 30 } as const;
    if (pointsMap[value.difficulty] !== value.points) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `points must match difficulty (${value.difficulty} => ${pointsMap[value.difficulty]})`,
        path: ['points'],
      });
    }
  });

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

async function main(): Promise<void> {
  const rootDir = process.cwd();

  const categoriesPath = path.join(rootDir, 'data', 'categories.seed.json');
  const questionsPath = path.join(rootDir, 'data', 'questions.seed.json');

  const categoriesRaw = await readJsonFile<unknown[]>(categoriesPath);
  const questionsRaw = await readJsonFile<unknown[]>(questionsPath);

  const categories = z.array(categorySeedSchema).parse(categoriesRaw);
  const questions = z.array(questionSeedSchema).parse(questionsRaw);

  const categorySlugSet = new Set(categories.map((category) => category.slug));

  for (const question of questions) {
    if (!categorySlugSet.has(question.category_slug)) {
      throw new Error(`Unknown category_slug in questions seed: ${question.category_slug}`);
    }
  }

  const uniqueQuestions = new Set<string>();
  for (const question of questions) {
    if (uniqueQuestions.has(question.question_en)) {
      throw new Error(`Duplicate question_en found: ${question.question_en}`);
    }
    uniqueQuestions.add(question.question_en);
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: {
        name_en: category.name_en,
        name_ar: category.name_ar,
        icon: category.icon,
        description_en: category.description_en,
        description_ar: category.description_ar,
        is_active: category.is_active,
      },
    });
  }

  const dbCategories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(dbCategories.map((category) => [category.slug, category.id]));

  for (const question of questions) {
    const categoryId = categoryIdBySlug.get(question.category_slug);
    if (!categoryId) {
      throw new Error(`Category not found after upsert: ${question.category_slug}`);
    }

    await prisma.question.upsert({
      where: { question_en: question.question_en },
      create: {
        category_id: categoryId,
        difficulty: question.difficulty,
        points: question.points,
        question_en: question.question_en,
        question_ar: question.question_ar,
        image_url: question.image_url ?? null,
        options_en: question.options_en,
        options_ar: question.options_ar,
        correct_answer_index: question.correct_answer_index,
        explanation_en: question.explanation_en,
        explanation_ar: question.explanation_ar,
        is_active: question.is_active,
      },
      update: {
        category_id: categoryId,
        difficulty: question.difficulty,
        points: question.points,
        question_ar: question.question_ar,
        image_url: question.image_url ?? null,
        options_en: question.options_en,
        options_ar: question.options_ar,
        correct_answer_index: question.correct_answer_index,
        explanation_en: question.explanation_en,
        explanation_ar: question.explanation_ar,
        is_active: question.is_active,
      },
    });
  }

  const [categoryCount, questionCount] = await Promise.all([
    prisma.category.count(),
    prisma.question.count(),
  ]);

  console.log(`✅ Seeded ${categoryCount} categories, ${questionCount} questions`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
