import { pino } from 'pino';
import { env, isDev } from '../config/env.js';

/**
 * Structured logger. Pretty-prints in development (requires pino-pretty),
 * emits JSON in production for Axiom/observability ingestion.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isDev
    ? { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }
    : {}),
});

export function createLogger(scope: string) {
  return logger.child({ scope });
}
