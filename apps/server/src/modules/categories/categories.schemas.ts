import { z } from 'zod';

export const randomCategoriesQuerySchema = z.object({
  count: z.coerce.number().int().min(2).max(12).default(6),
});
