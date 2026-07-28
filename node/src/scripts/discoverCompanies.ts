/**
 * Grow the directory with REAL companies discovered via Google Places (New) Text Search.
 * Each result is a real business — we store its real name, website, city, and Google rating
 * (with attribution). No fabricated facts: founded year / size / rates stay null until known.
 *
 * Gated: needs GOOGLE_PLACES_API_KEY, and skips once enough have been discovered (so it runs
 * ~once and doesn't re-spend on every deploy). Idempotent via domain + placeId dedup.
 * Run manually: `npm run discover:places`.
 */
import { prisma } from '../db/prisma.js';
import { kebab } from '../services/pipeline.js';
import { isGoogleRatingsEnabled, searchPlaces } from '../services/googlePlaces.js';

const ALREADY_DONE_AT = 20; // if we already have this many discovered, skip
const MAX_TOTAL = 600; // safety cap per run
const MIN_RATING_COUNT = 3; // require some real reviews to filter noise

const MARKETS: { countrySlug: string; countryName: string; iso: string; currency: string; mult: number; cities: [string, string][] }[] = [
  { countrySlug: 'pakistan', countryName: 'Pakistan', iso: 'PK', currency: 'PKR', mult: 0.45, cities: [['lahore', 'Lahore'], ['karachi', 'Karachi'], ['islamabad', 'Islamabad'], ['rawalpindi', 'Rawalpindi'], ['faisalabad', 'Faisalabad']] },
  { countrySlug: 'saudi-arabia', countryName: 'Saudi Arabia', iso: 'SA', currency: 'SAR', mult: 1.4, cities: [['riyadh', 'Riyadh'], ['jeddah', 'Jeddah'], ['dammam', 'Dammam'], ['khobar', 'Khobar']] },
  { countrySlug: 'united-arab-emirates', countryName: 'United Arab Emirates', iso: 'AE', currency: 'AED', mult: 1.4, cities: [['dubai', 'Dubai'], ['abu-dhabi', 'Abu Dhabi'], ['sharjah', 'Sharjah']] },
];

const QUERIES: { term: string; service: string }[] = [
  { term: 'software development company', service: 'custom-software' },
  { term: 'software house', service: 'custom-software' },
  { term: 'IT services company', service: 'it-staff-augmentation' },
  { term: 'mobile app development company', service: 'mobile-app-development' },
  { term: 'web development company', service: 'web-development' },
  { term: 'digital marketing agency', service: 'web-development' },
  { term: 'artificial intelligence company', service: 'ai-development' },
];

// Obvious non-tech place types to reject (Places' primaryType).
const BAD_TYPES = new Set(['store', 'shopping_mall', 'restaurant', 'cafe', 'food', 'lodging', 'hotel', 'gym', 'school', 'hospital', 'bank', 'pharmacy', 'supermarket', 'clothing_store', 'electronics_store', 'car_repair', 'real_estate_agency', 'travel_agency', 'beauty_salon', 'point_of_interest']);

function domainOf(website: string): string | null {
  try {
    return new URL(website).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || 'company';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.company.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

async function main() {
  if (!isGoogleRatingsEnabled()) {
    console.log('[discover] GOOGLE_PLACES_API_KEY not set — skipping.');
    return;
  }
  const already = await prisma.company.count({ where: { source: 'google-places' } });
  if (already >= ALREADY_DONE_AT) {
    console.log(`[discover] already have ${already} discovered companies — skipping.`);
    return;
  }

  // Ensure geography for the target markets.
  const countryIdBySlug = new Map<string, string>();
  const cityIdByKey = new Map<string, string>();
  for (const m of MARKETS) {
    const country = await prisma.country.upsert({
      where: { slug: m.countrySlug },
      update: { name: m.countryName, isoCode: m.iso, currency: m.currency, priceMultiplier: m.mult },
      create: { slug: m.countrySlug, name: m.countryName, isoCode: m.iso, currency: m.currency, priceMultiplier: m.mult },
    });
    countryIdBySlug.set(m.countrySlug, country.id);
    for (const [slug, name] of m.cities) {
      const city = await prisma.city.upsert({
        where: { countryId_slug: { countryId: country.id, slug } },
        update: { name },
        create: { slug, name, countryId: country.id },
      });
      cityIdByKey.set(`${m.countrySlug}/${slug}`, city.id);
    }
  }

  const services = await prisma.service.findMany({ select: { id: true, slug: true, name: true } });
  const svcIdBySlug = new Map(services.map((s) => [s.slug, s.id]));
  const svcNameBySlug = new Map(services.map((s) => [s.slug, s.name]));

  // Dedup against everything already in the DB (curated + prior discovery).
  const existing = await prisma.company.findMany({ where: { deletedAt: null }, select: { domain: true, name: true } });
  const seenDomains = new Set(existing.map((c) => c.domain?.toLowerCase()).filter(Boolean) as string[]);
  const seenNames = new Set(existing.map((c) => c.name.toLowerCase()));

  let created = 0;
  let scanned = 0;

  outer: for (const m of MARKETS) {
    for (const [citySlug, cityName] of m.cities) {
      for (const { term, service } of QUERIES) {
        if (created >= MAX_TOTAL) break outer;
        const results = await searchPlaces(`${term} in ${cityName}, ${m.countryName}`, 20);
        await new Promise((r) => setTimeout(r, 150)); // be gentle on the API
        for (const p of results) {
          scanned += 1;
          if (!p.website || !p.name || p.name.length < 3) continue;
          if (p.ratingCount < MIN_RATING_COUNT) continue;
          if (p.primaryType && BAD_TYPES.has(p.primaryType)) continue;
          const domain = domainOf(p.website);
          if (!domain) continue;
          const nameKey = p.name.toLowerCase();
          if (seenDomains.has(domain) || seenNames.has(nameKey)) continue;
          seenDomains.add(domain);
          seenNames.add(nameKey);

          const svcId = svcIdBySlug.get(service);
          const svcName = svcNameBySlug.get(service) ?? 'Technology';
          const slug = await uniqueSlug(kebab(p.name));
          const company = await prisma.company.create({
            data: {
              slug,
              name: p.name,
              tagline: `${svcName} company in ${cityName}`,
              description: `${p.name} is a technology company based in ${cityName}, ${m.countryName}. Its public rating is aggregated from Google; profile details grow as the company claims and completes its listing.`,
              website: p.website,
              domain,
              rateCurrency: m.currency,
              listingStatus: 'unclaimed',
              source: 'google-places',
              sourceId: p.placeId,
              hqCountryId: countryIdBySlug.get(m.countrySlug)!,
              hqCityId: cityIdByKey.get(`${m.countrySlug}/${citySlug}`)!,
            },
          });
          if (svcId) await prisma.companyService.create({ data: { companyId: company.id, serviceId: svcId, focusPct: 100 } });
          if (p.rating != null) {
            await prisma.externalRating.create({ data: { companyId: company.id, source: 'google', rating: p.rating, ratingCount: p.ratingCount, externalId: p.placeId, sourceUrl: p.mapsUri } });
          }
          created += 1;
        }
      }
    }
  }

  console.log(`[discover] scanned ${scanned} places, created ${created} new real companies.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0); // best-effort — never fail the deploy seed
  });
