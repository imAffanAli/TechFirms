import { prisma } from '../db/prisma.js';
import { fetchGoogleRating } from './googlePlaces.js';

export interface ExternalRatingRow {
  source: string;
  rating: number;
  ratingCount: number;
}

/**
 * The uncle's model: average the platform ratings (e.g. Google 4.5 + Trustpilot 4.9 → 4.7).
 * A simple mean of the per-platform averages; totalCount is the sum of the rating counts.
 */
export function aggregateExternalRatings(rows: ExternalRatingRow[]) {
  if (!rows.length) return null;
  const average = Math.round((rows.reduce((a, r) => a + r.rating, 0) / rows.length) * 10) / 10;
  const totalCount = rows.reduce((a, r) => a + r.ratingCount, 0);
  return { average, totalCount, sourceCount: rows.length };
}

type CompanyForLookup = {
  id: string;
  name: string;
  hqCity?: { name: string } | null;
  hqCountry?: { name: string } | null;
};

export type RefreshOutcome = 'updated' | 'nomatch' | 'error';

/** Fetch the Google rating for one company and upsert it (one row per company per source). */
export async function refreshGoogleRating(company: CompanyForLookup): Promise<RefreshOutcome> {
  const query = [company.name, company.hqCity?.name, company.hqCountry?.name].filter(Boolean).join(' ');
  try {
    const g = await fetchGoogleRating(query);
    if (!g) return 'nomatch';
    await prisma.externalRating.upsert({
      where: { companyId_source: { companyId: company.id, source: 'google' } },
      update: { rating: g.rating, ratingCount: g.ratingCount, externalId: g.placeId, sourceUrl: g.mapsUri, fetchedAt: new Date() },
      create: { companyId: company.id, source: 'google', rating: g.rating, ratingCount: g.ratingCount, externalId: g.placeId, sourceUrl: g.mapsUri },
    });
    return 'updated';
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[ratings] ${company.name}:`, e);
    return 'error';
  }
}
