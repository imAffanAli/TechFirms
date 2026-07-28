/**
 * Import the curated REAL companies through the ingest pipeline (docs/07).
 * Run: `npm run pipeline:import`. Idempotent (deterministic + upserts).
 *
 * Real-only: no generated/demo companies. Just the vetted flagships in realCompanies.ts,
 * ingested with real facts + real trust signals (domain age enriched from RDAP).
 */
import { prisma } from '../db/prisma.js';
import { realCompanies } from '../services/realCompanies.js';
import { ingestCompany } from '../services/pipeline.js';

// Only countries where we have real, curated companies.
const COUNTRIES: { slug: string; name: string; iso: string; cur: string; mult: number; cities: [string, string][] }[] = [
  { slug: 'saudi-arabia', name: 'Saudi Arabia', iso: 'SA', cur: 'SAR', mult: 1.4, cities: [['riyadh', 'Riyadh'], ['jeddah', 'Jeddah'], ['dammam', 'Dammam'], ['khobar', 'Khobar']] },
  { slug: 'pakistan', name: 'Pakistan', iso: 'PK', cur: 'PKR', mult: 0.45, cities: [['karachi', 'Karachi'], ['lahore', 'Lahore'], ['islamabad', 'Islamabad']] },
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

  const reals = realCompanies();
  console.log(`Ingesting ${reals.length} curated real companies…`);
  const tally: Record<string, number> = { created: 0, updated: 0, unchanged: 0, skipped: 0 };
  for (const { raw, source } of reals) {
    const res = await ingestCompany(raw, source, 'https://techfirms.com/curated');
    tally[res.action] = (tally[res.action] ?? 0) + 1;
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
