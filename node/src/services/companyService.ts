import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { aggregateExternalRatings } from './ratingsService.js';
import { buildEditorialSummary } from './editorialSummary.js';

// ── helpers ──────────────────────────────────────────────
const dec = (v: Prisma.Decimal | null | undefined): number | null => (v == null ? null : Number(v));
const stars = (ratingOverallInt: number): number => Math.round((ratingOverallInt / 100) * 10) / 10;

function ratingFromReviews(reviews: { ratingOverall: number }[]): { rating: number | null; reviewCount: number } {
  if (!reviews.length) return { rating: null, reviewCount: 0 };
  const avg = reviews.reduce((a, r) => a + r.ratingOverall, 0) / reviews.length;
  return { rating: stars(avg), reviewCount: reviews.length };
}

const companyListInclude = {
  hqCountry: true,
  hqCity: true,
  services: { include: { service: true }, orderBy: { focusPct: 'desc' as const } },
  intelligenceScore: true,
  reviews: { where: { deletedAt: null }, select: { ratingOverall: true } },
  sponsorships: { where: { active: true }, select: { tier: true } },
} satisfies Prisma.CompanyInclude;

const tierBadge = (tier: string): string | null => (tier === 'featured' ? 'Featured' : tier === 'verified_plus' ? 'Verified-Plus' : null);

function mapCard(c: Prisma.CompanyGetPayload<{ include: typeof companyListInclude }>) {
  const { rating, reviewCount } = ratingFromReviews(c.reviews);
  return {
    slug: c.slug,
    name: c.name,
    logoUrl: c.logoUrl,
    tagline: c.tagline,
    website: c.website,
    listingStatus: c.listingStatus,
    verified: c.verified,
    claimed: c.claimed,
    hqCountry: c.hqCountry ? { slug: c.hqCountry.slug, name: c.hqCountry.name } : null,
    hqCity: c.hqCity ? { slug: c.hqCity.slug, name: c.hqCity.name } : null,
    hourlyRateMin: c.hourlyRateMin,
    hourlyRateMax: c.hourlyRateMax,
    rateCurrency: c.rateCurrency,
    minProjectSize: c.minProjectSize,
    employeeRangeMin: c.employeeRangeMin,
    employeeRangeMax: c.employeeRangeMax,
    foundedYear: c.foundedYear,
    rating,
    reviewCount,
    cis: c.intelligenceScore?.cis ?? null,
    quadrant: c.intelligenceScore?.quadrant ?? null,
    tier: c.intelligenceScore?.tier ?? null,
    badges: [...new Set(c.sponsorships.map((s) => tierBadge(s.tier)).filter((b): b is string => !!b))],
    services: c.services.map((s) => ({ slug: s.service.slug, name: s.service.name, focusPct: s.focusPct })),
  };
}

/** Company cards for a set of ids, preserving the input order (used for sponsored slots). */
export async function getCardsByIds(ids: string[]): Promise<CompanyCard[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.company.findMany({ where: { id: { in: ids }, deletedAt: null }, include: companyListInclude });
  const byId = new Map(rows.map((r) => [r.id, mapCard(r)]));
  return ids.map((id) => byId.get(id)).filter((c): c is CompanyCard => !!c);
}

export type CompanyCard = ReturnType<typeof mapCard>;

// ── list / directory ─────────────────────────────────────
export type ListParams = {
  q?: string;
  service?: string;
  country?: string;
  city?: string;
  sort?: 'cis' | 'rating' | 'reviews' | 'name';
  page?: number;
  pageSize?: number;
};

export async function listCompanies(params: ListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, params.pageSize ?? 12));

  const where: Prisma.CompanyWhereInput = {
    deletedAt: null,
    ...(params.country ? { hqCountry: { slug: params.country } } : {}),
    ...(params.city ? { hqCity: { slug: params.city } } : {}),
    ...(params.service ? { services: { some: { service: { slug: params.service } } } } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: 'insensitive' } },
            { tagline: { contains: params.q, mode: 'insensitive' } },
            { description: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.CompanyOrderByWithRelationInput =
    params.sort === 'name'
      ? { name: 'asc' }
      : params.sort === 'reviews'
        ? { reviews: { _count: 'desc' } }
        : { intelligenceScore: { cis: 'desc' } }; // 'cis' | 'rating' default

  const [rows, total] = await Promise.all([
    prisma.company.findMany({ where, include: companyListInclude, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.company.count({ where }),
  ]);

  let items = rows.map(mapCard);
  if (params.sort === 'rating') items = items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

// ── profile ──────────────────────────────────────────────
export async function getCompanyBySlug(slug: string) {
  const c = await prisma.company.findFirst({
    where: { slug, deletedAt: null },
    include: {
      hqCountry: true,
      hqCity: true,
      services: { include: { service: true }, orderBy: { focusPct: 'desc' } },
      intelligenceScore: true,
      // published reviews only (held/spam excluded); best + richest ordered first, sliced for display
      reviews: { where: { deletedAt: null, flagged: false }, orderBy: [{ ratingOverall: 'desc' }, { reviewedAt: 'desc' }] },
      employeeSentiment: { orderBy: { asOf: 'desc' }, take: 1 },
      employeeReviews: { where: { flagged: false, deletedAt: null }, orderBy: { rating: 'desc' }, take: 8 },
      trustSignals: { orderBy: { asOf: 'desc' }, take: 1 },
      offices: { include: { country: true, city: true } },
      externalRatings: { orderBy: { source: 'asc' } },
    },
  });
  if (!c) return null;

  const { rating, reviewCount } = ratingFromReviews(c.reviews);
  const es = c.employeeSentiment[0] ?? null;
  const ts = c.trustSignals[0] ?? null;
  const agg = aggregateExternalRatings(c.externalRatings);
  const editorialSummary = buildEditorialSummary({
    name: c.name,
    city: c.hqCity?.name ?? null,
    country: c.hqCountry?.name ?? null,
    foundedYear: c.foundedYear,
    employeeMin: c.employeeRangeMin,
    employeeMax: c.employeeRangeMax,
    topServices: c.services.map((s) => s.service.name),
    cis: c.intelligenceScore?.cis ?? null,
    quadrant: c.intelligenceScore?.quadrant ?? null,
    clientRating: rating,
    reviewCount,
    externalAverage: agg?.average ?? null,
    externalCount: agg?.totalCount ?? 0,
    employeeSentiment: es ? dec(es.overallRating) : null,
    certifications: (ts?.certifications as string[] | null) ?? [],
  });

  return {
    slug: c.slug,
    name: c.name,
    logoUrl: c.logoUrl,
    tagline: c.tagline,
    description: c.description,
    website: c.website,
    foundedYear: c.foundedYear,
    listingStatus: c.listingStatus,
    verified: c.verified,
    claimed: c.claimed,
    hqCountry: c.hqCountry ? { slug: c.hqCountry.slug, name: c.hqCountry.name } : null,
    hqCity: c.hqCity ? { slug: c.hqCity.slug, name: c.hqCity.name } : null,
    hourlyRateMin: c.hourlyRateMin,
    hourlyRateMax: c.hourlyRateMax,
    rateCurrency: c.rateCurrency,
    minProjectSize: c.minProjectSize,
    employeeRangeMin: c.employeeRangeMin,
    employeeRangeMax: c.employeeRangeMax,
    rating,
    reviewCount,
    services: c.services.map((s) => ({ slug: s.service.slug, name: s.service.name, focusPct: s.focusPct })),
    intelligenceScore: c.intelligenceScore
      ? {
          cis: c.intelligenceScore.cis,
          reviewsScore: c.intelligenceScore.reviewsScore,
          sentimentScore: c.intelligenceScore.sentimentScore,
          trustScore: c.intelligenceScore.trustScore,
          marketScore: c.intelligenceScore.marketScore,
          marketPresence: c.intelligenceScore.marketPresence,
          clientSatisfaction: c.intelligenceScore.clientSatisfaction,
          quadrant: c.intelligenceScore.quadrant,
          tier: c.intelligenceScore.tier,
          justification: c.intelligenceScore.justification,
        }
      : null,
    reviews: c.reviews.slice(0, 12).map((r) => ({
      id: r.id,
      reviewerName: r.reviewerName,
      reviewerTitle: r.reviewerTitle,
      reviewerCompany: r.reviewerCompany,
      ratingOverall: stars(r.ratingOverall),
      ratingQuality: r.ratingQuality ? stars(r.ratingQuality) : null,
      ratingSchedule: r.ratingSchedule ? stars(r.ratingSchedule) : null,
      ratingCost: r.ratingCost ? stars(r.ratingCost) : null,
      ratingWillingToRefer: r.ratingWillingToRefer ? stars(r.ratingWillingToRefer) : null,
      body: r.body,
      verified: r.verified,
      reviewedAt: r.reviewedAt,
      projectDurationMonths: r.projectDurationMonths,
    })),
    employeeReviews: c.employeeReviews.map((er) => ({
      id: er.id,
      rating: stars(er.rating),
      title: er.title,
      pros: er.pros,
      cons: er.cons,
      role: er.role,
      isCurrentEmployee: er.isCurrentEmployee,
      verified: er.verified,
      reviewedAt: er.reviewedAt,
    })),
    employeeSentiment: es
      ? {
          overallRating: dec(es.overallRating),
          culture: dec(es.culture),
          compensation: dec(es.compensation),
          workLifeBalance: dec(es.workLifeBalance),
          leadership: dec(es.leadership),
          recommendPct: es.recommendPct,
          reviewCount: es.reviewCount,
          sourceName: es.sourceName,
          sourceUrl: es.sourceUrl,
          asOf: es.asOf,
        }
      : null,
    trustSignals: ts
      ? {
          domainAgeYears: dec(ts.domainAgeYears),
          sslValid: ts.sslValid,
          githubOrgActivity: ts.githubOrgActivity,
          certifications: (ts.certifications as string[] | null) ?? [],
          fundingRaised: ts.fundingRaised,
          fundingCurrency: ts.fundingCurrency,
          crunchbaseUrl: ts.crunchbaseUrl,
        }
      : null,
    offices: c.offices.map((o) => ({
      country: o.country ? { slug: o.country.slug, name: o.country.name } : null,
      city: o.city ? { slug: o.city.slug, name: o.city.name } : null,
      isHeadquarters: o.isHeadquarters,
    })),
    externalRatings: c.externalRatings.map((r) => ({
      source: r.source,
      rating: r.rating,
      ratingCount: r.ratingCount,
      sourceUrl: r.sourceUrl,
      fetchedAt: r.fetchedAt,
    })),
    aggregateRating: agg,
    editorialSummary,
  };
}

export type CompanyDetail = NonNullable<Awaited<ReturnType<typeof getCompanyBySlug>>>;

// ── taxonomy ─────────────────────────────────────────────
export async function listServices() {
  const rows = await prisma.service.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { companies: true } } },
  });
  return rows.map((s) => ({ slug: s.slug, name: s.name, category: s.category, companyCount: s._count.companies }));
}

export async function listCountries() {
  const rows = await prisma.country.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { companies: true } } },
  });
  return rows.map((c) => ({ slug: c.slug, name: c.name, isoCode: c.isoCode, companyCount: c._count.companies }));
}

/** All slugs for sitemap + programmatic-SEO generation. */
export async function getSitemapData() {
  const [companies, services, countries] = await Promise.all([
    prisma.company.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
    prisma.service.findMany({ select: { slug: true } }),
    prisma.country.findMany({ select: { slug: true } }),
  ]);
  return {
    companies: companies.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt })),
    services: services.map((s) => s.slug),
    countries: countries.map((c) => c.slug),
  };
}
