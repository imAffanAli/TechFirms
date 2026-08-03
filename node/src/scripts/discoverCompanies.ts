/**
 * Grow the directory with REAL companies discovered via Google Places (New) Text Search.
 * Each result is a real business — we store its real name, website, city, and Google rating
 * (with attribution). No fabricated facts: founded year / size / rates stay null until known.
 *
 * Global + incremental: sweeps many regions, but skips any city already covered and caps the
 * number of API calls per run, so a full worldwide rollout spreads safely across deploys.
 * Gated on GOOGLE_PLACES_API_KEY. Idempotent via domain + name dedup.
 * Run manually: `npm run discover:places`.
 */
import { prisma } from '../db/prisma.js';
import { kebab } from '../services/pipeline.js';
import { isGoogleRatingsEnabled, searchPlaces } from '../services/googlePlaces.js';

const MAX_REQUESTS = 150; // API calls per run — bounds cost; rollout continues next deploy
const MAX_TOTAL = 800; // companies created per run (safety)
const MIN_RATING_COUNT = 3; // require some real reviews to filter noise
const PER_CITY_DONE_AT = 3; // skip a city once it already has this many discovered companies

type Market = { countrySlug: string; countryName: string; iso: string; currency: string; mult: number; cities: [string, string][] };

// Major tech hubs across regions. Currency/multiplier are mostly cosmetic here (discovered
// companies carry no rates), but kept accurate for the country record + any curated overlap.
const MARKETS: Market[] = [
  // South Asia
  { countrySlug: 'pakistan', countryName: 'Pakistan', iso: 'PK', currency: 'PKR', mult: 0.45, cities: [['lahore', 'Lahore'], ['karachi', 'Karachi'], ['islamabad', 'Islamabad'], ['rawalpindi', 'Rawalpindi'], ['faisalabad', 'Faisalabad']] },
  { countrySlug: 'india', countryName: 'India', iso: 'IN', currency: 'INR', mult: 0.5, cities: [['bengaluru', 'Bengaluru'], ['mumbai', 'Mumbai'], ['hyderabad', 'Hyderabad'], ['pune', 'Pune'], ['gurugram', 'Gurugram']] },
  { countrySlug: 'bangladesh', countryName: 'Bangladesh', iso: 'BD', currency: 'BDT', mult: 0.4, cities: [['dhaka', 'Dhaka']] },
  { countrySlug: 'sri-lanka', countryName: 'Sri Lanka', iso: 'LK', currency: 'LKR', mult: 0.4, cities: [['colombo', 'Colombo']] },
  // GCC + MENA
  { countrySlug: 'saudi-arabia', countryName: 'Saudi Arabia', iso: 'SA', currency: 'SAR', mult: 1.4, cities: [['riyadh', 'Riyadh'], ['jeddah', 'Jeddah'], ['dammam', 'Dammam'], ['khobar', 'Khobar']] },
  { countrySlug: 'united-arab-emirates', countryName: 'United Arab Emirates', iso: 'AE', currency: 'AED', mult: 1.4, cities: [['dubai', 'Dubai'], ['abu-dhabi', 'Abu Dhabi'], ['sharjah', 'Sharjah']] },
  { countrySlug: 'qatar', countryName: 'Qatar', iso: 'QA', currency: 'QAR', mult: 1.4, cities: [['doha', 'Doha']] },
  { countrySlug: 'kuwait', countryName: 'Kuwait', iso: 'KW', currency: 'KWD', mult: 1.4, cities: [['kuwait-city', 'Kuwait City']] },
  { countrySlug: 'bahrain', countryName: 'Bahrain', iso: 'BH', currency: 'BHD', mult: 1.3, cities: [['manama', 'Manama']] },
  { countrySlug: 'oman', countryName: 'Oman', iso: 'OM', currency: 'OMR', mult: 1.2, cities: [['muscat', 'Muscat']] },
  { countrySlug: 'egypt', countryName: 'Egypt', iso: 'EG', currency: 'EGP', mult: 0.5, cities: [['cairo', 'Cairo'], ['alexandria', 'Alexandria']] },
  { countrySlug: 'jordan', countryName: 'Jordan', iso: 'JO', currency: 'JOD', mult: 0.8, cities: [['amman', 'Amman']] },
  { countrySlug: 'turkey', countryName: 'Türkiye', iso: 'TR', currency: 'TRY', mult: 0.7, cities: [['istanbul', 'Istanbul'], ['ankara', 'Ankara']] },
  // Africa
  { countrySlug: 'nigeria', countryName: 'Nigeria', iso: 'NG', currency: 'NGN', mult: 0.4, cities: [['lagos', 'Lagos'], ['abuja', 'Abuja']] },
  { countrySlug: 'kenya', countryName: 'Kenya', iso: 'KE', currency: 'KES', mult: 0.4, cities: [['nairobi', 'Nairobi']] },
  { countrySlug: 'south-africa', countryName: 'South Africa', iso: 'ZA', currency: 'ZAR', mult: 0.6, cities: [['johannesburg', 'Johannesburg'], ['cape-town', 'Cape Town']] },
  { countrySlug: 'ghana', countryName: 'Ghana', iso: 'GH', currency: 'GHS', mult: 0.4, cities: [['accra', 'Accra']] },
  // SE Asia
  { countrySlug: 'indonesia', countryName: 'Indonesia', iso: 'ID', currency: 'IDR', mult: 0.5, cities: [['jakarta', 'Jakarta']] },
  { countrySlug: 'malaysia', countryName: 'Malaysia', iso: 'MY', currency: 'MYR', mult: 0.6, cities: [['kuala-lumpur', 'Kuala Lumpur']] },
  { countrySlug: 'philippines', countryName: 'Philippines', iso: 'PH', currency: 'PHP', mult: 0.5, cities: [['manila', 'Manila'], ['cebu-city', 'Cebu City']] },
  { countrySlug: 'vietnam', countryName: 'Vietnam', iso: 'VN', currency: 'VND', mult: 0.45, cities: [['ho-chi-minh-city', 'Ho Chi Minh City'], ['hanoi', 'Hanoi']] },
  { countrySlug: 'singapore', countryName: 'Singapore', iso: 'SG', currency: 'SGD', mult: 1.2, cities: [['singapore', 'Singapore']] },
  // Europe
  { countrySlug: 'united-kingdom', countryName: 'United Kingdom', iso: 'GB', currency: 'GBP', mult: 1.3, cities: [['london', 'London'], ['manchester', 'Manchester']] },
  { countrySlug: 'germany', countryName: 'Germany', iso: 'DE', currency: 'EUR', mult: 1.3, cities: [['berlin', 'Berlin']] },
  { countrySlug: 'poland', countryName: 'Poland', iso: 'PL', currency: 'PLN', mult: 0.8, cities: [['warsaw', 'Warsaw'], ['krakow', 'Kraków']] },
  { countrySlug: 'ukraine', countryName: 'Ukraine', iso: 'UA', currency: 'UAH', mult: 0.6, cities: [['kyiv', 'Kyiv'], ['lviv', 'Lviv']] },
  { countrySlug: 'netherlands', countryName: 'Netherlands', iso: 'NL', currency: 'EUR', mult: 1.3, cities: [['amsterdam', 'Amsterdam']] },
  { countrySlug: 'romania', countryName: 'Romania', iso: 'RO', currency: 'RON', mult: 0.7, cities: [['bucharest', 'Bucharest']] },
  // Americas
  { countrySlug: 'united-states', countryName: 'United States', iso: 'US', currency: 'USD', mult: 1.5, cities: [['new-york', 'New York'], ['san-francisco', 'San Francisco'], ['austin', 'Austin']] },
  { countrySlug: 'canada', countryName: 'Canada', iso: 'CA', currency: 'CAD', mult: 1.2, cities: [['toronto', 'Toronto']] },
  { countrySlug: 'brazil', countryName: 'Brazil', iso: 'BR', currency: 'BRL', mult: 0.6, cities: [['sao-paulo', 'São Paulo']] },
  { countrySlug: 'mexico', countryName: 'Mexico', iso: 'MX', currency: 'MXN', mult: 0.6, cities: [['mexico-city', 'Mexico City']] },
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

  const services = await prisma.service.findMany({ select: { id: true, slug: true, name: true } });
  const svcIdBySlug = new Map(services.map((s) => [s.slug, s.id]));
  const svcNameBySlug = new Map(services.map((s) => [s.slug, s.name]));

  // Dedup against everything already in the DB (curated + prior discovery).
  const existing = await prisma.company.findMany({ where: { deletedAt: null }, select: { domain: true, name: true } });
  const seenDomains = new Set(existing.map((c) => c.domain?.toLowerCase()).filter(Boolean) as string[]);
  const seenNames = new Set(existing.map((c) => c.name.toLowerCase()));

  let requests = 0;
  let created = 0;
  let scanned = 0;
  let citiesCovered = 0;

  outer: for (const m of MARKETS) {
    // Ensure the country exists once per market.
    const country = await prisma.country.upsert({
      where: { slug: m.countrySlug },
      update: { name: m.countryName, isoCode: m.iso, currency: m.currency, priceMultiplier: m.mult },
      create: { slug: m.countrySlug, name: m.countryName, isoCode: m.iso, currency: m.currency, priceMultiplier: m.mult },
    });

    for (const [citySlug, cityName] of m.cities) {
      const city = await prisma.city.upsert({
        where: { countryId_slug: { countryId: country.id, slug: citySlug } },
        update: { name: cityName },
        create: { slug: citySlug, name: cityName, countryId: country.id },
      });

      // Skip cities we've already covered (keeps the rollout incremental + cheap).
      const covered = await prisma.company.count({ where: { source: 'google-places', hqCityId: city.id } });
      if (covered >= PER_CITY_DONE_AT) continue;

      for (const { term, service } of QUERIES) {
        if (requests >= MAX_REQUESTS || created >= MAX_TOTAL) break outer;
        const results = await searchPlaces(`${term} in ${cityName}, ${m.countryName}`, 20);
        requests += 1;
        await new Promise((r) => setTimeout(r, 120)); // be gentle on the API
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
              hqCountryId: country.id,
              hqCityId: city.id,
            },
          });
          if (svcId) await prisma.companyService.create({ data: { companyId: company.id, serviceId: svcId, focusPct: 100 } });
          if (p.rating != null) {
            await prisma.externalRating.create({ data: { companyId: company.id, source: 'google', rating: p.rating, ratingCount: p.ratingCount, externalId: p.placeId, sourceUrl: p.mapsUri } });
          }
          created += 1;
        }
      }
      citiesCovered += 1;
    }
  }

  console.log(`[discover] ${requests} API calls, scanned ${scanned}, created ${created} new real companies across ${citiesCovered} cities.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0); // best-effort — never fail the deploy seed
  });
