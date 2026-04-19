import { z } from 'zod';

export const generateGamePackSchema = z
  .object({
    team1CategoryIds: z.array(z.string().uuid()).length(3),
    team2CategoryIds: z.array(z.string().uuid()).length(3),
  })
  .superRefine((value, ctx) => {
    const allIds = [...value.team1CategoryIds, ...value.team2CategoryIds];
    const uniqueIds = new Set(allIds);
    if (uniqueIds.size !== allIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'All 6 category IDs must be unique across both teams',
        path: ['team2CategoryIds'],
      });
    }
  });

export const generateBoardGamePackSchema = z
  .object({
    team1CategoryIds: z.array(z.string().uuid()).min(2).max(5),
    team2CategoryIds: z.array(z.string().uuid()).min(2).max(5),
  })
  .superRefine((value, ctx) => {
    if (value.team1CategoryIds.length !== value.team2CategoryIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Both teams must have the same number of categories',
        path: ['team2CategoryIds'],
      });
    }

    const allIds = [...value.team1CategoryIds, ...value.team2CategoryIds];
    const uniqueIds = new Set(allIds);
    if (uniqueIds.size !== allIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category IDs must be unique across both teams',
        path: ['team2CategoryIds'],
      });
    }
  });
