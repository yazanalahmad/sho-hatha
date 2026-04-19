import type { Request, Response } from 'express';
import { randomCategoriesQuerySchema } from './categories.schemas';
import { getAllCategories, getRandomCategories } from './categories.service';

export async function getAllCategoriesController(_req: Request, res: Response): Promise<void> {
  const categories = await getAllCategories();
  res.status(200).json({ categories });
}

export async function getRandomCategoriesController(req: Request, res: Response): Promise<void> {
  const query = randomCategoriesQuerySchema.parse(req.query);
  const categories = await getRandomCategories(query.count);
  res.status(200).json({ categories });
}
