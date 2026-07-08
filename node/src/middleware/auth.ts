import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken, type JwtPayload } from '../services/authService.js';
import { prisma } from '../db/prisma.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const COOKIE_NAME = 'tf_token';

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const fromCookie = req.cookies?.[COOKIE_NAME];
  return typeof fromCookie === 'string' ? fromCookie : null;
}

/** Populates req.user when a valid token is present. Applied globally; never blocks. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}

/**
 * Guards a route: requires a signed-in user, optionally with one of the given roles.
 * Reads the CURRENT role from the DB so promotions/demotions take effect without re-login.
 */
export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'unauthorized', message: 'Sign in required' } });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.sub }, select: { role: true } });
    if (!user) {
      res.status(401).json({ error: { code: 'unauthorized', message: 'Account not found' } });
      return;
    }
    req.user.role = user.role; // refresh from DB
    if (roles.length > 0 && !roles.includes(user.role)) {
      res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
      return;
    }
    next();
  };
}

export { COOKIE_NAME };
