import type { Request, Response } from 'express';
import {
  createCategorySchema,
  createQuestionSchema,
  idParamSchema,
  paginationSchema,
  updateCategorySchema,
  updateQuestionSchema,
} from './admin.schemas';
import {
  createCategory,
  createQuestion,
  getCategoryById,
  getQuestionById,
  listCategories,
  listQuestions,
  softDeleteCategory,
  softDeleteQuestion,
  toggleCategoryActive,
  toggleQuestionActive,
  updateCategory,
  updateQuestion,
} from './admin.service';

export async function listQuestionsController(req: Request, res: Response): Promise<void> {
  const query = paginationSchema.parse(req.query);
  const result = await listQuestions(query);
  res.status(200).json(result);
}

export async function getQuestionController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const result = await getQuestionById(params.id);
  res.status(200).json(result);
}

export async function createQuestionController(req: Request, res: Response): Promise<void> {
  const body = createQuestionSchema.parse(req.body);
  const result = await createQuestion(body as never);
  res.status(201).json(result);
}

export async function updateQuestionController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const body = updateQuestionSchema.parse(req.body);
  const result = await updateQuestion(params.id, body as never);
  res.status(200).json(result);
}

export async function toggleQuestionController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const result = await toggleQuestionActive(params.id);
  res.status(200).json(result);
}

export async function deleteQuestionController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const result = await softDeleteQuestion(params.id);
  res.status(200).json(result);
}

export async function listCategoriesController(_req: Request, res: Response): Promise<void> {
  const result = await listCategories();
  res.status(200).json({ categories: result });
}

export async function getCategoryController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const result = await getCategoryById(params.id);
  res.status(200).json(result);
}

export async function createCategoryController(req: Request, res: Response): Promise<void> {
  const body = createCategorySchema.parse(req.body);
  const result = await createCategory(body);
  res.status(201).json(result);
}

export async function updateCategoryController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const body = updateCategorySchema.parse(req.body);
  const result = await updateCategory(params.id, body);
  res.status(200).json(result);
}

export async function toggleCategoryController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const result = await toggleCategoryActive(params.id);
  res.status(200).json(result);
}

export async function deleteCategoryController(req: Request, res: Response): Promise<void> {
  const params = idParamSchema.parse(req.params);
  const result = await softDeleteCategory(params.id);
  res.status(200).json(result);
}
