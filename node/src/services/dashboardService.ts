import { randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';

const INVITE_TTL_DAYS = 30;
function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function listOwnedCompanies(userId: string) {
  const rows = await prisma.company.findMany({
    where: { ownerId: userId, deletedAt: null },
    orderBy: { name: 'asc' },
    include: { intelligenceScore: { select: { cis: true } }, _count: { select: { reviews: true } } },
  });
  return rows.map((c) => ({
    slug: c.slug,
    name: c.name,
    listingStatus: c.listingStatus,
    verified: c.verified,
    tagline: c.tagline,
    description: c.description,
    website: c.website,
    foundedYear: c.foundedYear,
    employeeRangeMin: c.employeeRangeMin,
    employeeRangeMax: c.employeeRangeMax,
    hourlyRateMin: c.hourlyRateMin,
    hourlyRateMax: c.hourlyRateMax,
    rateCurrency: c.rateCurrency,
    minProjectSize: c.minProjectSize,
    cis: c.intelligenceScore?.cis ?? null,
    reviewCount: c._count.reviews,
  }));
}

async function assertOwner(userId: string, slug: string) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) throw httpError(404, 'Company not found');
  if (company.ownerId !== userId) throw httpError(403, 'You do not own this company');
  return company;
}

export interface EditableCompany {
  tagline?: string;
  description?: string;
  website?: string;
  foundedYear?: number;
  employeeRangeMin?: number;
  employeeRangeMax?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  minProjectSize?: number;
}

export async function updateOwnedCompany(userId: string, slug: string, patch: EditableCompany) {
  await assertOwner(userId, slug);
  const data: Prisma.CompanyUpdateInput = {};
  for (const k of ['tagline', 'description', 'website', 'foundedYear', 'employeeRangeMin', 'employeeRangeMax', 'hourlyRateMin', 'hourlyRateMax', 'minProjectSize'] as const) {
    if (patch[k] !== undefined) (data as Record<string, unknown>)[k] = patch[k];
  }
  const updated = await prisma.company.update({ where: { slug }, data });
  return { slug: updated.slug };
}

export async function listDashboardQueries(userId: string) {
  const owned = await prisma.company.findMany({ where: { ownerId: userId }, select: { id: true } });
  const ids = owned.map((o) => o.id);
  if (ids.length === 0) return [];
  const rows = await prisma.query.findMany({
    where: { deletedAt: null, OR: [{ directCompanyId: { in: ids } }, { matches: { some: { companyId: { in: ids } } } }] },
    orderBy: { createdAt: 'desc' },
    include: { directCompany: { select: { slug: true, name: true } } },
  });
  return rows.map((q) => ({
    id: q.id,
    projectType: q.projectType,
    description: q.description,
    budgetMin: q.budgetMin,
    budgetMax: q.budgetMax,
    budgetCurrency: q.budgetCurrency,
    timeline: q.timeline,
    contactName: q.contactName,
    contactEmail: q.contactEmail,
    status: q.status,
    createdAt: q.createdAt,
    kind: q.directCompanyId && ids.includes(q.directCompanyId) ? ('direct' as const) : ('matched' as const),
  }));
}

export async function getDashboardOverview(userId: string) {
  const companies = await prisma.company.findMany({ where: { ownerId: userId }, select: { id: true, intelligenceScore: { select: { cis: true } } } });
  const ids = companies.map((c) => c.id);
  const [reviews, queries] = await Promise.all([
    ids.length ? prisma.customerReview.count({ where: { companyId: { in: ids }, deletedAt: null } }) : Promise.resolve(0),
    ids.length ? prisma.query.count({ where: { deletedAt: null, OR: [{ directCompanyId: { in: ids } }, { matches: { some: { companyId: { in: ids } } } }] } }) : Promise.resolve(0),
  ]);
  const cisVals = companies.map((c) => c.intelligenceScore?.cis).filter((x): x is number => x != null);
  const avgCis = cisVals.length ? Math.round(cisVals.reduce((a, b) => a + b, 0) / cisVals.length) : null;
  return { companies: companies.length, reviews, queries, avgCis };
}

export async function createInvitation(userId: string, slug: string, clientEmail: string, clientName?: string) {
  const company = await assertOwner(userId, slug);
  const token = randomBytes(16).toString('hex');
  await prisma.reviewInvitation.create({ data: { companyId: company.id, token, clientEmail, clientName: clientName ?? null } });
  return { token, link: `/r/${token}` };
}

export async function listInvitations(userId: string, slug: string) {
  const company = await assertOwner(userId, slug);
  const rows = await prisma.reviewInvitation.findMany({ where: { companyId: company.id, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 20 });
  return rows.map((i) => ({ token: i.token, clientEmail: i.clientEmail, clientName: i.clientName, used: !!i.usedAt, createdAt: i.createdAt }));
}

// ── public: invited review submission ──
export async function getInvitation(token: string) {
  const inv = await prisma.reviewInvitation.findUnique({ where: { token }, include: { company: { select: { slug: true, name: true } } } });
  if (!inv) return null;
  const expired = Date.now() - inv.createdAt.getTime() > INVITE_TTL_DAYS * 24 * 3600 * 1000;
  return { company: inv.company, clientName: inv.clientName, used: !!inv.usedAt, expired };
}

export interface InvitedReviewInput {
  reviewerName: string;
  reviewerTitle?: string;
  reviewerCompany?: string;
  ratingQuality: number; // 0–5
  ratingSchedule: number;
  ratingCost: number;
  ratingWillingToRefer: number;
  body: string;
  projectBudget?: number;
  projectDurationMonths?: number;
}

export async function submitInvitedReview(token: string, input: InvitedReviewInput) {
  const inv = await prisma.reviewInvitation.findUnique({ where: { token } });
  if (!inv) throw httpError(404, 'Invalid review link');
  if (inv.usedAt) throw httpError(409, 'This review link has already been used');
  const expired = Date.now() - inv.createdAt.getTime() > INVITE_TTL_DAYS * 24 * 3600 * 1000;
  if (expired) throw httpError(410, 'This review link has expired');

  const four = [input.ratingQuality, input.ratingSchedule, input.ratingCost, input.ratingWillingToRefer];
  const overall = Math.round((four.reduce((a, b) => a + b, 0) / four.length) * 100);

  await prisma.$transaction([
    prisma.customerReview.create({
      data: {
        companyId: inv.companyId,
        invitationId: inv.id,
        reviewerName: input.reviewerName,
        reviewerTitle: input.reviewerTitle ?? null,
        reviewerCompany: input.reviewerCompany ?? null,
        ratingQuality: Math.round(input.ratingQuality * 100),
        ratingSchedule: Math.round(input.ratingSchedule * 100),
        ratingCost: Math.round(input.ratingCost * 100),
        ratingWillingToRefer: Math.round(input.ratingWillingToRefer * 100),
        ratingOverall: overall,
        body: input.body,
        projectBudget: input.projectBudget ?? null,
        projectDurationMonths: input.projectDurationMonths ?? null,
        source: 'native',
        verified: true,
      },
    }),
    prisma.reviewInvitation.update({ where: { id: inv.id }, data: { usedAt: new Date() } }),
  ]);
  return { ok: true };
}
