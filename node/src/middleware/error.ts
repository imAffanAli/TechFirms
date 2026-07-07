import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

/** Standard error envelope: { error: { code, message, details? } } */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'not_found', message: 'Resource not found' } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: 'validation_error', message: 'Invalid request', details: err.issues } });
    return;
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: { code: 'internal_error', message } });
}
