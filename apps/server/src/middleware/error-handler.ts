import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError, toErrorBody } from '../lib/errors';

function isJsonSyntaxError(error: unknown): error is SyntaxError & { body: unknown } {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  return typeof (error as { body?: unknown }).body !== 'undefined';
}

function getPrismaErrorMeta(error: unknown): { code: string; message?: string } | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const maybeError = error as { code?: unknown; message?: unknown };
  if (typeof maybeError.code === 'string' && maybeError.code.startsWith('P')) {
    return {
      code: maybeError.code,
      message: typeof maybeError.message === 'string' ? maybeError.message : undefined,
    };
  }

  return null;
}

function isPrismaInitializationError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === 'PrismaClientInitializationError';
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(
    toErrorBody({
      code: 'NOT_FOUND',
      message: 'Route not found',
      details: [],
    }),
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  void next;
  if (isJsonSyntaxError(err)) {
    res.status(400).json(
      toErrorBody({
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON body',
        details: [],
      }),
    );
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json(
      toErrorBody({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues,
      }),
    );
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      toErrorBody({
        code: err.code,
        message: err.message,
        details: err.details,
      }),
    );
    return;
  }

  const prismaErrorMeta = getPrismaErrorMeta(err);
  if (prismaErrorMeta) {
    logger.error({ err }, 'Database error');
    res.status(503).json(
      toErrorBody({
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: env.NODE_ENV === 'development'
          ? [{ code: prismaErrorMeta.code, message: prismaErrorMeta.message ?? 'Unknown database error' }]
          : [],
      }),
    );
    return;
  }

  if (isPrismaInitializationError(err)) {
    logger.error({ err }, 'Database initialization error');
    res.status(503).json(
      toErrorBody({
        code: 'DATABASE_ERROR',
        message: 'Database connection failed',
        details: env.NODE_ENV === 'development'
          ? [{ message: err.message }]
          : [],
      }),
    );
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json(
    toErrorBody({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: env.NODE_ENV === 'development'
        ? [{ message: err instanceof Error ? err.message : 'Unknown unhandled error' }]
        : [],
    }),
  );
}
