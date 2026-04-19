import api from './api-client';
import type { CategoryData } from '../state/types';

export async function getAllCategories(): Promise<CategoryData[]> {
  const res = await api.get<{ categories?: CategoryData[] }>('/api/categories');
  if (!Array.isArray(res.data?.categories)) {
    throw new Error('Invalid categories response');
  }
  return res.data.categories;
}

export async function getRandomCategories(count = 6): Promise<CategoryData[]> {
  const res = await api.get<{ categories?: CategoryData[] }>('/api/categories/random', {
    params: { count },
  });
  if (!Array.isArray(res.data?.categories)) {
    throw new Error('Invalid categories response');
  }
  return res.data.categories;
}
