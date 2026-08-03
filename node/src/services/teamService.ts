import { randomBytes } from 'node:crypto';
import type { CompanyRole } from '@prisma/client';
import { prisma } from '../db/prisma.js';

/**
 * Company team accounts (RBAC). CompanyMember is the source of truth for authorization;
 * Company.ownerId stays as a denormalized pointer to the current owner (and a fallback during
 * the transition before memberships are backfilled).
 */

const INVITE_TTL_DAYS = 14;
function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export type Role = CompanyRole;
export const OPERATE: Role[] = ['owner', 'manager']; // run the profile day-to-day
export const OWNER_ONLY: Role[] = ['owner']; // team, billing, transfer, delete

/** A user's effective role on a company, or null if none. */
export async function effectiveRole(userId: string, companyId: string, ownerId: string | null): Promise<Role | null> {
  const m = await prisma.companyMember.findUnique({ where: { companyId_userId: { companyId, userId } } });
  if (m && m.status === 'active') return m.role;
  if (ownerId && ownerId === userId) return 'owner';
  return null;
}

export async function assertCompanyRole(userId: string, slug: string, allowed: Role[]) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) throw httpError(404, 'Company not found');
  const role = await effectiveRole(userId, company.id, company.ownerId);
  if (!role || !allowed.includes(role)) throw httpError(403, 'You do not have permission for this company');
  return { company, role };
}

/** Company ids a user can manage (owner or active member) — for dashboard scoping. */
export async function myCompanyIds(userId: string): Promise<string[]> {
  const [owned, memberships] = await Promise.all([
    prisma.company.findMany({ where: { ownerId: userId, deletedAt: null }, select: { id: true } }),
    prisma.companyMember.findMany({ where: { userId, status: 'active' }, select: { companyId: true } }),
  ]);
  return [...new Set([...owned.map((c) => c.id), ...memberships.map((m) => m.companyId)])];
}

export async function listTeam(userId: string, slug: string) {
  const { company, role } = await assertCompanyRole(userId, slug, OPERATE);
  const [members, invites] = await Promise.all([
    prisma.companyMember.findMany({ where: { companyId: company.id }, include: { user: { select: { email: true, fullName: true } } }, orderBy: { createdAt: 'asc' } }),
    prisma.companyInvitation.findMany({ where: { companyId: company.id, status: 'pending' }, orderBy: { createdAt: 'desc' } }),
  ]);
  return {
    myRole: role,
    members: members.map((m) => ({ id: m.id, email: m.user.email, fullName: m.user.fullName, role: m.role, status: m.status })),
    invitations: invites.map((i) => ({ id: i.id, email: i.email, role: i.role, token: i.token, expiresAt: i.expiresAt })),
  };
}

export async function inviteMember(userId: string, slug: string, email: string, role: Role) {
  const { company } = await assertCompanyRole(userId, slug, OWNER_ONLY);
  if (role === 'owner') throw httpError(400, 'Cannot invite another owner; use ownership transfer');
  const token = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400000);
  const existing = await prisma.companyInvitation.findFirst({ where: { companyId: company.id, email, status: 'pending' } });
  if (existing) {
    await prisma.companyInvitation.update({ where: { id: existing.id }, data: { role, token, expiresAt } });
  } else {
    await prisma.companyInvitation.create({ data: { companyId: company.id, email, role, token, invitedById: userId, expiresAt } });
  }
  return { token, link: `/team/accept/${token}` };
}

export async function getInvitation(token: string) {
  const inv = await prisma.companyInvitation.findUnique({ where: { token }, include: { company: { select: { slug: true, name: true } } } });
  if (!inv) return null;
  const expired = inv.status !== 'pending' || inv.expiresAt.getTime() < Date.now();
  return { company: inv.company, role: inv.role, email: inv.email, expired };
}

export async function acceptInvitation(userId: string, token: string) {
  const inv = await prisma.companyInvitation.findUnique({ where: { token } });
  if (!inv || inv.status !== 'pending') throw httpError(404, 'Invalid or already-used invitation');
  if (inv.expiresAt.getTime() < Date.now()) throw httpError(410, 'This invitation has expired');
  await prisma.$transaction([
    prisma.companyMember.upsert({
      where: { companyId_userId: { companyId: inv.companyId, userId } },
      update: { role: inv.role, status: 'active' },
      create: { companyId: inv.companyId, userId, role: inv.role, status: 'active', invitedById: inv.invitedById },
    }),
    prisma.companyInvitation.update({ where: { id: inv.id }, data: { status: 'accepted', acceptedById: userId } }),
  ]);
  await prisma.user.updateMany({ where: { id: userId, role: 'visitor' }, data: { role: 'business_owner' } });
  const company = await prisma.company.findUnique({ where: { id: inv.companyId }, select: { slug: true, name: true } });
  return { ok: true, company };
}

export async function changeMemberRole(userId: string, slug: string, memberId: string, role: Role) {
  const { company } = await assertCompanyRole(userId, slug, OWNER_ONLY);
  if (role === 'owner') throw httpError(400, 'Use ownership transfer to assign owner');
  const m = await prisma.companyMember.findFirst({ where: { id: memberId, companyId: company.id } });
  if (!m) throw httpError(404, 'Member not found');
  if (m.role === 'owner') throw httpError(400, 'Cannot change the owner’s role here');
  await prisma.companyMember.update({ where: { id: m.id }, data: { role } });
  return { ok: true };
}

export async function removeMember(userId: string, slug: string, memberId: string) {
  const { company } = await assertCompanyRole(userId, slug, OWNER_ONLY);
  const m = await prisma.companyMember.findFirst({ where: { id: memberId, companyId: company.id } });
  if (!m) throw httpError(404, 'Member not found');
  if (m.role === 'owner') throw httpError(400, 'Cannot remove the owner');
  await prisma.companyMember.delete({ where: { id: m.id } });
  return { ok: true };
}

export async function revokeInvitation(userId: string, slug: string, inviteId: string) {
  const { company } = await assertCompanyRole(userId, slug, OWNER_ONLY);
  await prisma.companyInvitation.updateMany({ where: { id: inviteId, companyId: company.id, status: 'pending' }, data: { status: 'revoked' } });
  return { ok: true };
}

export async function replyToReview(userId: string, reviewId: string, reply: string) {
  const review = await prisma.customerReview.findUnique({ where: { id: reviewId }, include: { company: { select: { slug: true } } } });
  if (!review) throw httpError(404, 'Review not found');
  await assertCompanyRole(userId, review.company.slug, OPERATE);
  await prisma.customerReview.update({ where: { id: reviewId }, data: { companyReply: reply, companyReplyAt: new Date(), companyRepliedById: userId } });
  return { ok: true };
}

/** Idempotent: ensure every claimed company has an owner CompanyMember for its ownerId. */
export async function ensureOwnerMemberships() {
  const companies = await prisma.company.findMany({ where: { ownerId: { not: null } }, select: { id: true, ownerId: true } });
  let created = 0;
  for (const c of companies) {
    if (!c.ownerId) continue;
    const existing = await prisma.companyMember.findUnique({ where: { companyId_userId: { companyId: c.id, userId: c.ownerId } } });
    if (!existing) {
      await prisma.companyMember.create({ data: { companyId: c.id, userId: c.ownerId, role: 'owner', status: 'active' } });
      created += 1;
    }
  }
  return created;
}
