import type { RawCompany, RawReview } from './pipeline.js';

// ─────────────────────────── Generated source ───────────────────────────
// Produces realistic RawCompany records to exercise the ingest pipeline and
// populate the directory for development. In production this is replaced by the
// httpCheerioSource (see scraper.ts) pointed at a real, robots-permitted source.

const PREFIX = ['Nimbus', 'Falcon', 'Oryx', 'Cedar', 'Zenith', 'Atlas', 'Vertex', 'Lumen', 'Quanta', 'Delta', 'Sigma', 'Nova', 'Pulse', 'Orbit', 'Aster', 'Cobalt', 'Ember', 'Ionis', 'Kite', 'Mirage', 'Solace', 'Tesser', 'Vantage', 'Halcyon', 'Beacon', 'Cinder', 'Dune', 'Fathom', 'Granite', 'Harbor'];
const SUFFIX = ['Labs', 'Systems', 'Digital', 'Technologies', 'Software', 'Solutions', 'Studio', 'Works', 'AI', 'Cloud', 'Networks', 'Group'];
const SERVICE_SLUGS = ['ai-development', 'custom-software', 'web-development', 'mobile-app-development', 'cloud', 'devops', 'data-engineering', 'cybersecurity', 'it-staff-augmentation', 'ui-ux-design'];
const REVIEW_BODIES = [
  'Delivered on time and communicated clearly throughout the engagement.',
  'Strong senior team; the quality of the work exceeded our expectations.',
  'Great value and a genuinely helpful, responsive partner.',
  'Solid engineering and thoughtful architecture decisions.',
  'Smooth delivery with good documentation and handover.',
  'Reliable long-term partner — we have hired them for multiple projects.',
  'Helped us ship faster without sacrificing quality.',
  'Professional, transparent, and easy to work with across time zones.',
];
const TITLES = ['CTO', 'VP Engineering', 'Head of Product', 'Founder', 'Director of IT', 'Product Lead', 'CEO', 'Engineering Manager'];
const CLIENT_CO = ['Tamkeen', 'GulfPay', 'Noor Health', 'Saned', 'Jahez', 'Rasan', 'Lean', 'Careem-adjacent', 'Yalla', 'Bloom', 'ShopEasy', 'CareConnect', 'FoodTechME', 'PayNow', 'LogiGulf'];

// Deterministic PRNG so a re-run reproduces the same dataset (idempotent upserts).
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GenCountry { slug: string; cities: string[]; count: number; tierBias: number } // tierBias 0..1 (quality)

export function generatedSource(countries: GenCountry[]): RawCompany[] {
  const rng = mulberry32(42);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]!;
  const between = (lo: number, hi: number) => lo + rng() * (hi - lo);
  const used = new Set<string>();
  const out: RawCompany[] = [];

  for (const co of countries) {
    for (let i = 0; i < co.count; i++) {
      let name = `${pick(PREFIX)} ${pick(SUFFIX)}`;
      let guard = 0;
      while (used.has(name) && guard++ < 50) name = `${pick(PREFIX)} ${pick(SUFFIX)}`;
      used.add(name);

      const nServices = 1 + Math.floor(rng() * 2.5);
      const chosen = [...SERVICE_SLUGS].sort(() => rng() - 0.5).slice(0, nServices);
      const focus = chosen.map((_, idx) => (idx === 0 ? (nServices === 1 ? 100 : 60) : Math.round(40 / (nServices - 1))));
      const services = chosen.map((slug, idx) => ({ slug, focus: focus[idx]! }));

      const quality = co.tierBias * 0.7 + rng() * 0.4; // 0..~1.1
      const base = 3.7 + quality * 1.1; // ~3.7..4.9
      const nReviews = 3 + Math.floor(rng() * 5);
      const reviews: RawReview[] = Array.from({ length: nReviews }, () => {
        const overall = Math.max(3, Math.min(5, Math.round((base + (rng() - 0.5) * 0.6) * 10) / 10));
        return { name: `${pick(['A', 'M', 'S', 'R', 'K', 'H', 'T', 'D'])}. ${pick(['Khan', 'Ali', 'Nasser', 'Haddad', 'Reda', 'Farouk', 'Aziz', 'Salem'])}`, title: pick(TITLES), company: pick(CLIENT_CO), overall, body: pick(REVIEW_BODIES), verified: rng() > 0.25 };
      });

      const domainBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      out.push({
        sourceId: `gen-${co.slug}-${i}`,
        url: `https://directory.example/${co.slug}/${domainBase}`,
        name,
        website: `https://${domainBase}.example`,
        domain: `${domainBase}.example`,
        countrySlug: co.slug,
        citySlug: pick(co.cities),
        services,
        foundedYear: Math.round(between(2008, 2022)),
        employeeRange: pick([[10, 50], [20, 50], [50, 100], [100, 250], [250, 500]] as [number, number][]),
        hourlyRate: (() => { const lo = Math.round(between(20, 70)); return [lo, lo + Math.round(between(25, 60))] as [number, number]; })(),
        minProject: pick([5000, 8000, 10000, 15000, 20000, 25000]),
        reviews,
        sentiment: { overall: Math.round((3.6 + quality * 0.9) * 10) / 10, culture: Math.round((3.7 + quality * 0.8) * 10) / 10, comp: Math.round((3.6 + quality * 0.7) * 10) / 10, wlb: Math.round((3.7 + quality * 0.6) * 10) / 10, leadership: Math.round((3.7 + quality * 0.8) * 10) / 10, recommendPct: Math.round(65 + quality * 30), reviewCount: Math.round(between(15, 110)) },
        trust: { ssl: true, github: Math.round(between(40, 700)), certs: rng() > 0.5 ? pick([['ISO 27001'], ['ISO 27001', 'SOC 2'], ['CMMI Level 3'], []]) : [], funding: rng() > 0.5 ? Math.round(between(0, 12000000)) : 0 },
      });
    }
  }
  return out;
}
