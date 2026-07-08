import type { Prisma, QueryStatus } from '@prisma/client';
import { prisma } from '../db/prisma.js';

export interface CreateQueryInput {
  projectType: string;
  serviceSlug?: string;
  countrySlug?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  timeline?: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  directCompanySlug?: string; // (a) direct-to-company entry point
}

/**
 * Create a lead-gen query (docs/14). Direct submissions target one company;
 * otherwise we match up to 5 eligible firms in the (country × service) cohort by CIS.
 * Sponsored placements are excluded from matching (none exist yet).
 */
export async function createQuery(input: CreateQueryInput) {
  const service = input.serviceSlug ? await prisma.service.findUnique({ where: { slug: input.serviceSlug } }) : null;
  const country = input.countrySlug ? await prisma.country.findUnique({ where: { slug: input.countrySlug } }) : null;

  let directCompanyId: string | null = null;
  if (input.directCompanySlug) {
    const c = await prisma.company.findUnique({ where: { slug: input.directCompanySlug }, select: { id: true } });
    directCompanyId = c?.id ?? null;
  }

  const query = await prisma.query.create({
    data: {
      projectType: input.projectType,
      serviceCategory: service?.category ?? null,
      countryId: country?.id ?? null,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      budgetCurrency: input.budgetCurrency ?? 'USD',
      timeline: input.timeline ?? null,
      description: input.description,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone ?? null,
      directCompanyId,
    },
  });

  let matches: { slug: string; name: string; rank: number; cis: number | null }[] = [];
  if (!directCompanyId) {
    const where: Prisma.CompanyWhereInput = {
      deletedAt: null,
      intelligenceScore: { isNot: null },
      ...(country ? { hqCountryId: country.id } : {}),
      ...(service ? { services: { some: { serviceId: service.id } } } : {}),
    };
    const firms = await prisma.company.findMany({
      where,
      include: { intelligenceScore: { select: { cis: true } } },
      orderBy: { intelligenceScore: { cis: 'desc' } },
      take: 5,
    });
    matches = firms.map((f, i) => ({ slug: f.slug, name: f.name, rank: i + 1, cis: f.intelligenceScore?.cis ?? null }));
    for (let i = 0; i < firms.length; i++) {
      await prisma.queryMatch.create({ data: { queryId: query.id, companyId: firms[i]!.id, rank: i + 1 } });
    }
  }

  return { id: query.id, direct: !!directCompanyId, matches };
}

export async function listQueries(status?: QueryStatus) {
  const rows = await prisma.query.findMany({
    where: { deletedAt: null, ...(status ? { status } : {}) },
    orderBy: { createdAt: 'desc' },
    include: {
      directCompany: { select: { slug: true, name: true } },
      matches: { include: { company: { select: { slug: true, name: true } } }, orderBy: { rank: 'asc' } },
    },
  });
  // Query has a countryId scalar (no relation) — resolve names in one lookup.
  const countryIds = [...new Set(rows.map((r) => r.countryId).filter((x): x is string => !!x))];
  const countries = countryIds.length ? await prisma.country.findMany({ where: { id: { in: countryIds } }, select: { id: true, name: true } }) : [];
  const countryName = new Map(countries.map((c) => [c.id, c.name] as const));
  return rows.map((q) => ({
    id: q.id,
    projectType: q.projectType,
    serviceCategory: q.serviceCategory,
    country: q.countryId ? countryName.get(q.countryId) ?? null : null,
    budgetMin: q.budgetMin,
    budgetMax: q.budgetMax,
    budgetCurrency: q.budgetCurrency,
    timeline: q.timeline,
    description: q.description,
    contactName: q.contactName,
    contactEmail: q.contactEmail,
    contactPhone: q.contactPhone,
    status: q.status,
    adminNotes: q.adminNotes,
    createdAt: q.createdAt,
    directCompany: q.directCompany,
    matches: q.matches.map((m) => ({ slug: m.company.slug, name: m.company.name, rank: m.rank, forwarded: m.forwarded })),
  }));
}

export async function updateQuery(id: string, patch: { status?: QueryStatus; adminNotes?: string }) {
  return prisma.query.update({
    where: { id },
    data: { ...(patch.status ? { status: patch.status } : {}), ...(patch.adminNotes !== undefined ? { adminNotes: patch.adminNotes } : {}) },
  });
}
