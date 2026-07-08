import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const stars = (n: number) => Math.round((n / 100) * 10) / 10;

const include = {
  hqCity: true,
  intelligenceScore: true,
  services: { include: { service: true }, orderBy: { focusPct: 'desc' as const } },
  reviews: { where: { deletedAt: null }, select: { ratingOverall: true } },
} satisfies Prisma.CompanyInclude;

/**
 * Country-scoped leaderboard (optionally per service). Ranked by CIS desc.
 * Real methodology (cohort median splits, eligibility gates, snapshots) lands in M6 —
 * see docs/08-scoring-and-leaderboards.md. This returns live-ordered demo data.
 */
export async function getLeaderboard(countrySlug: string, serviceSlug?: string, now = new Date()) {
  const country = await prisma.country.findUnique({ where: { slug: countrySlug } });
  if (!country) return null;
  const service = serviceSlug ? await prisma.service.findUnique({ where: { slug: serviceSlug } }) : null;
  if (serviceSlug && !service) return null;

  const rows = await prisma.company.findMany({
    where: {
      deletedAt: null,
      hqCountryId: country.id,
      intelligenceScore: { isNot: null },
      ...(service ? { services: { some: { serviceId: service.id } } } : {}),
    },
    include,
    orderBy: { intelligenceScore: { cis: 'desc' } },
  });

  const entries = rows.map((c, i) => {
    const reviewCount = c.reviews.length;
    const rating = reviewCount ? stars(c.reviews.reduce((a, r) => a + r.ratingOverall, 0) / reviewCount) : null;
    const s = c.intelligenceScore!;
    return {
      rank: i + 1,
      slug: c.slug,
      name: c.name,
      logoUrl: c.logoUrl,
      hqCity: c.hqCity ? c.hqCity.name : null,
      cis: s.cis,
      quadrant: s.quadrant,
      tier: s.tier,
      marketPresence: s.marketPresence,
      clientSatisfaction: s.clientSatisfaction,
      rating,
      reviewCount,
      topService: c.services[0]?.service.name ?? null,
    };
  });

  const label = service ? service.name : 'Technology';
  const title = `Top ${label} Companies in ${country.name} — ${MONTHS[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
  const top3 = entries.slice(0, 3).map((e, i) => `${i + 1}) ${e.name}`).join(', ');
  const answerBlock = entries.length
    ? `As of ${MONTHS[now.getUTCMonth()]} ${now.getUTCFullYear()}, the top ${label.toLowerCase()} companies in ${country.name}, ranked by TechFirms' Company Intelligence Score (customer reviews, employee sentiment, and trust signals), are: ${top3}. TechFirms tracks ${entries.length} ranked ${label.toLowerCase()} ${entries.length === 1 ? 'company' : 'companies'} in ${country.name}.`
    : `TechFirms does not yet have enough ranked ${label.toLowerCase()} companies in ${country.name} to publish a leaderboard.`;

  return {
    country: { slug: country.slug, name: country.name, isoCode: country.isoCode },
    service: service ? { slug: service.slug, name: service.name } : null,
    title,
    answerBlock,
    generatedAt: now.toISOString(),
    entries,
  };
}
