/**
 * Bulk-import demo companies through the ingest pipeline (docs/07).
 * Run: `npm run pipeline:import`. Idempotent (deterministic generator + upserts).
 *
 * This exercises the full pipeline — normalize → enrich (RDAP) → describe → upsert —
 * using the generated source. Swap `generatedSource` for `scrapeListing` (scraper.ts)
 * pointed at a real, robots-permitted source to ingest live data.
 */
import { prisma } from '../db/prisma.js';
import { generatedSource, type GenCountry } from '../services/sources.js';
import { ingestCompany } from '../services/pipeline.js';

const SOURCE_NAME = 'generated-directory';
const BASE_URL = 'https://directory.example';

const COUNTRIES: { slug: string; name: string; iso: string; cur: string; mult: number; cities: [string, string][] }[] = [
  { slug: 'saudi-arabia', name: 'Saudi Arabia', iso: 'SA', cur: 'SAR', mult: 1.4, cities: [['riyadh', 'Riyadh'], ['jeddah', 'Jeddah'], ['dammam', 'Dammam']] },
  { slug: 'united-arab-emirates', name: 'United Arab Emirates', iso: 'AE', cur: 'AED', mult: 1.4, cities: [['dubai', 'Dubai'], ['abu-dhabi', 'Abu Dhabi'], ['sharjah', 'Sharjah']] },
  { slug: 'pakistan', name: 'Pakistan', iso: 'PK', cur: 'PKR', mult: 0.45, cities: [['karachi', 'Karachi'], ['lahore', 'Lahore'], ['islamabad', 'Islamabad']] },
  { slug: 'qatar', name: 'Qatar', iso: 'QA', cur: 'QAR', mult: 1.4, cities: [['doha', 'Doha']] },
  { slug: 'egypt', name: 'Egypt', iso: 'EG', cur: 'EGP', mult: 0.5, cities: [['cairo', 'Cairo'], ['alexandria', 'Alexandria']] },
];

const PLAN: GenCountry[] = [
  { slug: 'saudi-arabia', cities: ['riyadh', 'jeddah', 'dammam'], count: 10, tierBias: 0.8 },
  { slug: 'united-arab-emirates', cities: ['dubai', 'abu-dhabi', 'sharjah'], count: 10, tierBias: 0.85 },
  { slug: 'pakistan', cities: ['karachi', 'lahore', 'islamabad'], count: 10, tierBias: 0.6 },
  { slug: 'qatar', cities: ['doha'], count: 6, tierBias: 0.75 },
  { slug: 'egypt', cities: ['cairo', 'alexandria'], count: 6, tierBias: 0.6 },
];

async function ensureGeography() {
  for (const c of COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { slug: c.slug },
      update: { name: c.name, isoCode: c.iso, currency: c.cur, priceMultiplier: c.mult },
      create: { slug: c.slug, name: c.name, isoCode: c.iso, currency: c.cur, priceMultiplier: c.mult },
    });
    for (const [citySlug, cityName] of c.cities) {
      await prisma.city.upsert({
        where: { countryId_slug: { countryId: country.id, slug: citySlug } },
        update: { name: cityName },
        create: { slug: citySlug, name: cityName, countryId: country.id },
      });
    }
  }
}

async function main() {
  console.log('Ensuring geography…');
  await ensureGeography();

  const raws = generatedSource(PLAN);
  console.log(`Ingesting ${raws.length} companies via pipeline…`);
  const tally: Record<string, number> = { created: 0, updated: 0, unchanged: 0, skipped: 0 };
  let i = 0;
  for (const raw of raws) {
    const res = await ingestCompany(raw, SOURCE_NAME, BASE_URL);
    tally[res.action] = (tally[res.action] ?? 0) + 1;
    if (++i % 10 === 0) console.log(`  …${i}/${raws.length}`);
  }

  const total = await prisma.company.count({ where: { deletedAt: null } });
  const byCountry = await prisma.country.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { companies: true } } } });
  console.log(`\nDone: ${JSON.stringify(tally)}`);
  console.log(`Directory now has ${total} companies:`);
  for (const c of byCountry) console.log(`  ${c.name}: ${c._count.companies}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
