import { AppError } from '../../lib/errors';
import type { CategoryListItem } from './categories.types';
import { countActiveCategories, findAllActiveCategories, findRandomActiveCategories } from './categories.repo';

export async function getRandomCategories(count: number): Promise<CategoryListItem[]> {
  const totalActive = await countActiveCategories();
  if (totalActive < count) {
    throw new AppError(
      500,
      'INSUFFICIENT_CATEGORIES',
      'Not enough active categories',
      [],
    );
  }

  return findRandomActiveCategories(count);
}

export async function getAllCategories(): Promise<CategoryListItem[]> {
  return findAllActiveCategories();
}
