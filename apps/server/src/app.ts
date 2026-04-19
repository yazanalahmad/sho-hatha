import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pkg from '../package.json';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { postRateLimit, globalRateLimit } from './middleware/rate-limit';
import { requestIdMiddleware } from './middleware/request-id';
import { adminRouter } from './modules/admin/admin.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { configRouter } from './modules/config.routes';
import { gamePacksRouter } from './modules/game-packs/game-packs.routes';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = new Set<string>([env.CORS_ORIGIN]);
      if (env.NODE_ENV !== 'production') {
        allowedOrigins.add('http://localhost:5173');
        allowedOrigins.add('http://127.0.0.1:5173');
      }

      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(globalRateLimit);
app.use((req, res, next) => {
  if (req.method === 'POST') {
    postRateLimit(req, res, next);
    return;
  }
  next();
});
app.use(requestIdMiddleware);
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id']?.toString() ?? req.id,
    customSuccessMessage: () => 'request completed',
    customErrorMessage: () => 'request failed',
  }),
);
app.use(express.json({ limit: '1mb' }));

export function buildHealthPayload(): {
  status: 'ok';
  uptime: number;
  version: string;
  timestamp: string;
} {
  return {
    status: 'ok',
    uptime: process.uptime(),
    version: pkg.version,
    timestamp: new Date().toISOString(),
  };
}

app.get('/health', (_req, res) => {
  res.status(200).json(buildHealthPayload());
});

app.use('/api/config', configRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/game-packs', gamePacksRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
