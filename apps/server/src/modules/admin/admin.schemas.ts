import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const baseQuestionSchema = z.object({
  category_id: z.string().uuid(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  question_en: z.string().min(5).max(500),
  question_ar: z.string().min(5).max(500).optional(),
  image_url: z.string().url().nullable().optional(),
  options_en: z.array(z.string().min(1)).length(4),
  options_ar: z.array(z.string().min(1)).length(4).optional(),
  correct_answer_index: z.number().int().min(0).max(3),
  explanation_en: z.string().max(1000).optional(),
  explanation_ar: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
});

export const createQuestionSchema = baseQuestionSchema;
export const updateQuestionSchema = baseQuestionSchema;

const baseCategorySchema = z.object({
  slug: z.string().min(2).max(100),
  name_en: z.string().min(2).max(100),
  name_ar: z.string().min(2).max(100),
  icon: z.string().max(10).optional(),
  description_en: z.string().max(500).optional(),
  description_ar: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

export const createCategorySchema = baseCategorySchema;
export const updateCategorySchema = baseCategorySchema;

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
