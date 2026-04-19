import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  ADMIN_API_TOKEN: z.string().min(32),
  QUESTIONS_PER_GAME: z.coerce.number().default(18),
  CATEGORIES_TO_DISPLAY: z.coerce.number().default(6),
  CATEGORIES_PER_TEAM: z.coerce.number().default(3),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
