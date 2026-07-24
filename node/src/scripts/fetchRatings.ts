/**
 * Pull real aggregate ratings from Google for the curated (real) companies and store them
 * with attribution. Run: `npm run ratings:fetch`. Also runs (best-effort) in the deploy
 * seed once GOOGLE_PLACES_API_KEY is set.
 *
 * Only touches curated companies — the generated demo firms have no real Google presence,
 * so querying them would waste API calls and risk false matches. Skips anything refreshed
 * within STALE_DAYS. Never throws out (exits 0) so it can't break the deploy seed.
 */
import { prisma } from '../db/prisma.js';
import { isGoogleRatingsEnabled } from '../services/googlePlaces.js';
import { refreshGoogleRating } from '../services/ratingsService.js';

const STALE_DAYS = 30;

async function main() {
  if (!isGoogleRatingsEnabled()) {
    console.log('[ratings] GOOGLE_PLACES_API_KEY not set — skipping.');
    return;
  }

  const companies = await prisma.company.findMany({
    where: { deletedAt: null, source: 'curated' },
    include: { hqCity: true, hqCountry: true, externalRatings: { where: { source: 'google' } } },
  });

  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  let updated = 0;
  let fresh = 0;
  let nomatch = 0;
  let errored = 0;

  console.log(`[ratings] checking ${companies.length} curated companies…`);
  for (const c of companies) {
    const existing = c.externalRatings[0];
    if (existing && existing.fetchedAt.getTime() > cutoff) {
      fresh++;
      continue;
    }
    const outcome = await refreshGoogleRating(c);
    if (outcome === 'updated') {
      updated++;
      console.log(`  ✓ ${c.name}`);
    } else if (outcome === 'nomatch') {
      nomatch++;
      console.log(`  ? ${c.name} — no Google match`);
    } else {
      errored++;
    }
    await new Promise((res) => setTimeout(res, 200)); // be gentle on the API
  }

  console.log(`[ratings] done: ${updated} updated, ${fresh} still fresh, ${nomatch} no-match, ${errored} errors.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0); // never fail the deploy seed
  });
