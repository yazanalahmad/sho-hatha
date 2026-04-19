import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { toErrorBody } from '../lib/errors';

export function requireAdminToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.header('x-admin-token');
  if (!token || token !== env.ADMIN_API_TOKEN) {
    res.status(401).json(
      toErrorBody({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing admin token',
        details: [],
      }),
    );
    return;
  }

  next();
}
