import { Router } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, signToken, publicUser } from '../../services/authService.js';
import { COOKIE_NAME } from '../../middleware/auth.js';
import { prisma } from '../../db/prisma.js';
import { isProd } from '../../config/env.js';

export const authRouter = Router();

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProd,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().trim().min(1).optional(),
});
const loginBody = z.object({ email: z.string().email(), password: z.string().min(1) });

// POST /api/v1/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName } = registerBody.parse(req.body);
    const user = await registerUser(email, password, fullName);
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.cookie(COOKIE_NAME, token, cookieOpts).status(201).json({ user: publicUser(user), token });
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginBody.parse(req.body);
    const user = await loginUser(email, password);
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.cookie(COOKIE_NAME, token, cookieOpts).json({ user: publicUser(user), token });
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' }).json({ ok: true });
});

// GET /api/v1/auth/me
authRouter.get('/me', async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: 'unauthorized', message: 'Not signed in' } });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) {
      res.status(401).json({ error: { code: 'unauthorized', message: 'Account not found' } });
      return;
    }
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});
