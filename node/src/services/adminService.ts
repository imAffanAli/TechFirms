import type { Role } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { isAiEnabled } from './ai.js';

/** Admin dashboard KPIs (docs/12). */
export async function getAdminStats() {
  const [companies, claimed, verified, unclaimed, reviews, countries, services, pendingClaims, queries, flaggedReviews, users, activeSponsorships, pendingOrders, revenue] = await Promise.all([
    prisma.company.count({ where: { deletedAt: null } }),
    prisma.company.count({ where: { deletedAt: null, claimed: true } }),
    prisma.company.count({ where: { deletedAt: null, verified: true } }),
    prisma.company.count({ where: { deletedAt: null, claimed: false } }),
    prisma.customerReview.count({ where: { deletedAt: null } }),
    prisma.country.count(),
    prisma.service.count(),
    prisma.claim.count({ where: { status: 'pending' } }),
    prisma.query.count({ where: { deletedAt: null } }),
    prisma.customerReview.count({ where: { flagged: true, deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.sponsorship.count({ where: { active: true } }),
    prisma.sponsorshipOrder.count({ where: { status: 'pending' } }),
    prisma.sponsorshipOrder.aggregate({ _sum: { amount: true }, where: { status: 'active' } }),
  ]);
  return {
    companies,
    claimed,
    verified,
    unclaimed,
    claimedPct: companies ? Math.round((claimed / companies) * 100) : 0,
    reviews,
    countries,
    services,
    pendingClaims,
    queries,
    flaggedReviews,
    users,
    activeSponsorships,
    pendingOrders,
    sponsorshipRevenue: revenue._sum.amount ?? 0,
    aiEnabled: isAiEnabled(),
  };
}

// ── User management ──
export async function listUsers(search?: string) {
  const rows = await prisma.user.findMany({
    where: search ? { email: { contains: search, mode: 'insensitive' } } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, email: true, fullName: true, role: true, deletedAt: true, createdAt: true, _count: { select: { ownedCompanies: true, memberships: true } } },
  });
  return rows.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role, suspended: !!u.deletedAt, companies: u._count.ownedCompanies + u._count.memberships, createdAt: u.createdAt }));
}

export async function setUserRole(id: string, role: Role) {
  await prisma.user.update({ where: { id }, data: { role } });
  return { ok: true };
}

export async function setUserSuspended(id: string, suspended: boolean) {
  await prisma.user.update({ where: { id }, data: { deletedAt: suspended ? new Date() : null } });
  return { ok: true };
}

// ── Company management ──
export async function listCompaniesAdmin(search?: string) {
  const rows = await prisma.company.findMany({
    where: { deletedAt: null, ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}) },
    orderBy: { name: 'asc' },
    take: 100,
    select: { slug: true, name: true, listingStatus: true, verified: true, claimed: true, source: true, owner: { select: { email: true } }, hqCountry: { select: { name: true } } },
  });
  return rows.map((c) => ({ slug: c.slug, name: c.name, listingStatus: c.listingStatus, verified: c.verified, claimed: c.claimed, source: c.source, ownerEmail: c.owner?.email ?? null, country: c.hqCountry?.name ?? null }));
}

export async function setCompanyVerified(slug: string, verified: boolean) {
  await prisma.company.update({ where: { slug }, data: { verified, ...(verified ? { listingStatus: 'verified' } : {}) } });
  return { ok: true };
}

// ── Audit log ──
export async function listAudit() {
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { actor: { select: { email: true } } } });
  return rows.map((a) => ({ id: a.id, action: a.action, entityType: a.entityType, entityId: a.entityId, actor: a.actor?.email ?? null, createdAt: a.createdAt }));
}
