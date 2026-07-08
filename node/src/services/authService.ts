import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Role, User } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';

export type JwtPayload = { sub: string; email: string; role: Role };

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export function signToken(p: JwtPayload): string {
  return jwt.sign(p, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'object' && decoded && 'sub' in decoded) return decoded as JwtPayload;
    return null;
  } catch {
    return null;
  }
}

export async function registerUser(email: string, password: string, fullName?: string): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw httpError(409, 'Email already registered');
  const passwordHash = bcrypt.hashSync(password, 10);
  return prisma.user.create({ data: { email, passwordHash, fullName: fullName ?? null } });
}

export async function loginUser(email: string, password: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
    throw httpError(401, 'Invalid email or password');
  }
  return user;
}

export function publicUser(u: Pick<User, 'id' | 'email' | 'fullName' | 'role'>) {
  return { id: u.id, email: u.email, fullName: u.fullName, role: u.role };
}
