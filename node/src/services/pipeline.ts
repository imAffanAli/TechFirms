import { createHash } from 'node:crypto';
import type { Prisma, Quadrant } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('pipeline');

// ─────────────────────────── Types ───────────────────────────
export interface RawReview { name: string; title: string; company: string; overall: number; body: string; verified: boolean }
export interface RawCompany {
  sourceId: string; // stable key on the source
  url: string;
  name: string;
  website: string;
  domain: string;
  countrySlug: string;
  citySlug: string;
  services: { slug: string; focus: number }[];
  foundedYear: number;
  employeeRange: [number, number];
  hourlyRate: [number, number];
  minProject: number;
  reviews: RawReview[];
  sentiment: { overall: number; culture: number; comp: number; wlb: number; leadership: number; recommendPct: number; reviewCount: number };
  trust: { domainAgeYears?: number; ssl?: boolean; github?: number; certs: string[]; funding: number };
}

export const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const contentHashOf = (raw: RawCompany) => createHash('sha1').update(JSON.stringify(raw)).digest('hex');

// ─────────────────── Enrichment (best-effort, real APIs) ───────────────────
/** Domain age via RDAP (free, public). Returns undefined for unresolved/demo domains. */
export async function domainAgeYears(domain: string): Promise<number | undefined> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal: ctrl.signal, headers: { accept: 'application/rdap+json' } });
    clearTimeout(t);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { events?: { eventAction: string; eventDate: string }[] };
    const reg = data.events?.find((e) => e.eventAction === 'registration')?.eventDate;
    if (!reg) return undefined;
    const years = (Date.parse('2026-07-08T00:00:00Z') - Date.parse(reg)) / (365.25 * 24 * 3600 * 1000);
    return years > 0 ? Math.round(years * 10) / 10 : undefined;
  } catch {
    return undefined; // network/abort/parse — fall back to provided value
  }
}

// ─────────────────── AI description (Claude, with fallback) ───────────────────
/** Neutral ~60-word profile. Uses Claude (Haiku) when ANTHROPIC_API_KEY is set, else a deterministic template. */
export async function describeCompany(raw: RawCompany, countryName: string, cityName: string): Promise<string> {
  const svc = raw.services.map((s) => s.slug.replace(/-/g, ' ')).join(', ');
  const fallback = `${raw.name} is a technology company headquartered in ${cityName}, ${countryName}, focused on ${svc}. Founded in ${raw.foundedYear}, it serves clients with a team of ${raw.employeeRange[0]}–${raw.employeeRange[1]} and hourly rates from $${raw.hourlyRate[0]} to $${raw.hourlyRate[1]}.`;
  if (!env.ANTHROPIC_API_KEY) return fallback;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 160,
        messages: [{ role: 'user', content: `Write a neutral, factual 60-word company profile (no marketing superlatives) for "${raw.name}", a ${svc} company in ${cityName}, ${countryName}, founded ${raw.foundedYear}, team ${raw.employeeRange[0]}-${raw.employeeRange[1]}. Return only the paragraph.` }],
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { content?: { type: string; text: string }[] };
    return data.content?.find((c) => c.type === 'text')?.text?.trim() || fallback;
  } catch {
    return fallback;
  }
}

// ─────────────────── Demo scoring (shared shape with docs/08) ───────────────────
function computeScore(raw: RawCompany, trustDomainAge: number) {
  const overalls = raw.reviews.map((r) => r.overall);
  const reviewsAvg = overalls.length ? overalls.reduce((a, b) => a + b, 0) / overalls.length : 3.5;
  const reviewsScore = Math.round((reviewsAvg / 5) * 100);
  const sentimentScore = Math.round((raw.sentiment.overall / 5) * 100);
  const trustScore = Math.min(100, Math.round(trustDomainAge * 4 + (raw.trust.ssl ? 15 : 0) + raw.trust.certs.length * 8 + (raw.trust.funding > 0 ? 20 : 0) + Math.min(20, (raw.trust.github ?? 0) / 40)));
  const marketScore = Math.min(100, Math.round(raw.reviews.length * 7 + raw.sentiment.reviewCount * 0.4));
  const cis = Math.round(0.4 * reviewsScore + 0.25 * sentimentScore + 0.2 * trustScore + 0.15 * marketScore);
  const marketPresence = Math.min(100, Math.round(raw.reviews.length * 6 + trustScore * 0.4 + raw.sentiment.reviewCount * 0.3));
  const clientSatisfaction = reviewsScore;
  const verified = raw.reviews.filter((r) => r.verified).length;
  const quadrant: Quadrant = marketPresence >= 50 ? (clientSatisfaction >= 88 ? 'Leaders' : 'Challengers') : clientSatisfaction >= 88 ? 'Rising_Stars' : 'Niche_Players';
  return { cis, reviewsScore, sentimentScore, trustScore, marketScore, marketPresence, clientSatisfaction, tier: verified >= 3 ? ('Rated' as const) : ('Unrated' as const), quadrant };
}

// ─────────────────── Ingest one record (the pipeline) ───────────────────
export interface IngestResult { slug: string; cis: number; action: 'created' | 'updated' | 'unchanged' | 'skipped' }

export async function ingestCompany(raw: RawCompany, sourceName: string, baseUrl: string): Promise<IngestResult> {
  // 1) provenance: source + raw record with diff detection
  const source = await prisma.scrapeSource.upsert({ where: { name: sourceName }, update: { baseUrl }, create: { name: sourceName, baseUrl } });
  const hash = contentHashOf(raw);
  const existingRaw = await prisma.rawScrapeRecord.findUnique({ where: { sourceId_sourceRecordId: { sourceId: source.id, sourceRecordId: raw.sourceId } } });
  if (existingRaw && existingRaw.contentHash === hash && existingRaw.companyId) {
    // Only treat as unchanged if the prior ingest actually COMPLETED (has a score).
    const scored = await prisma.intelligenceScore.findUnique({ where: { companyId: existingRaw.companyId }, select: { cis: true } });
    if (scored) return { slug: kebab(raw.name), cis: scored.cis, action: 'unchanged' };
    // else the prior run crashed mid-ingest — fall through and reprocess fully
  }

  // 2) resolve geography (must be seeded)
  const country = await prisma.country.findUnique({ where: { slug: raw.countrySlug } });
  const city = await prisma.city.findUnique({ where: { countryId_slug: { countryId: country?.id ?? '', slug: raw.citySlug } } }).catch(() => null);
  if (!country) {
    logger.warn({ country: raw.countrySlug, company: raw.name }, 'Unknown country — skipping');
    return { slug: kebab(raw.name), cis: 0, action: 'skipped' };
  }

  // 3) enrich (facts only) + 4) AI description (regenerated, never scraped prose)
  const enrichedAge = raw.trust.domainAgeYears ?? (await domainAgeYears(raw.domain)) ?? 5;
  const description = await describeCompany(raw, country.name, city?.name ?? country.name);

  // 5) don't clobber owner edits on claimed listings
  const existing = await prisma.company.findUnique({ where: { source_sourceId: { source: sourceName, sourceId: raw.sourceId } } });
  const guardClaimed = existing?.claimed === true;

  const facts: Prisma.CompanyUpdateInput = guardClaimed
    ? {} // claimed: leave owner-managed fields untouched
    : {
        name: raw.name,
        tagline: `${raw.services[0]?.slug.replace(/-/g, ' ') ?? 'technology'} specialists`,
        description,
        website: raw.website,
        domain: raw.domain,
        foundedYear: raw.foundedYear,
        employeeRangeMin: raw.employeeRange[0],
        employeeRangeMax: raw.employeeRange[1],
        hourlyRateMin: raw.hourlyRate[0],
        hourlyRateMax: raw.hourlyRate[1],
        minProjectSize: raw.minProject,
        hqCountry: { connect: { id: country.id } },
        ...(city ? { hqCity: { connect: { id: city.id } } } : {}),
      };

  const slug = await uniqueSlug(kebab(raw.name), existing?.slug);
  const company = await prisma.company.upsert({
    where: { source_sourceId: { source: sourceName, sourceId: raw.sourceId } },
    update: facts,
    create: {
      slug,
      name: raw.name,
      tagline: `${raw.services[0]?.slug.replace(/-/g, ' ') ?? 'technology'} specialists`,
      description,
      website: raw.website,
      domain: raw.domain,
      foundedYear: raw.foundedYear,
      employeeRangeMin: raw.employeeRange[0],
      employeeRangeMax: raw.employeeRange[1],
      hourlyRateMin: raw.hourlyRate[0],
      hourlyRateMax: raw.hourlyRate[1],
      minProjectSize: raw.minProject,
      listingStatus: 'unclaimed',
      source: sourceName,
      sourceId: raw.sourceId,
      hqCountryId: country.id,
      hqCityId: city?.id ?? null,
    },
  });

  // record raw provenance now that we have a companyId
  await prisma.rawScrapeRecord.upsert({
    where: { sourceId_sourceRecordId: { sourceId: source.id, sourceRecordId: raw.sourceId } },
    update: { url: raw.url, payload: raw as unknown as Prisma.InputJsonValue, contentHash: hash, companyId: company.id, httpStatus: 200 },
    create: { sourceId: source.id, sourceRecordId: raw.sourceId, url: raw.url, payload: raw as unknown as Prisma.InputJsonValue, contentHash: hash, companyId: company.id, httpStatus: 200 },
  });

  // 6) refresh derived child rows (skip for claimed to preserve native reviews)
  if (!guardClaimed) {
    await prisma.companyService.deleteMany({ where: { companyId: company.id } });
    await prisma.customerReview.deleteMany({ where: { companyId: company.id, source: 'imported' } });
    await prisma.trustSignal.deleteMany({ where: { companyId: company.id } });
    await prisma.employeeSentiment.deleteMany({ where: { companyId: company.id } });
    await prisma.intelligenceScore.deleteMany({ where: { companyId: company.id } });

    for (const s of raw.services) {
      const svc = await prisma.service.findUnique({ where: { slug: s.slug } });
      if (svc) await prisma.companyService.create({ data: { companyId: company.id, serviceId: svc.id, focusPct: s.focus } });
    }
    for (let ri = 0; ri < raw.reviews.length; ri++) {
      const rv = raw.reviews[ri]!;
      await prisma.customerReview.create({
        data: {
          companyId: company.id, reviewerName: rv.name, reviewerTitle: rv.title, reviewerCompany: rv.company,
          ratingOverall: Math.round(rv.overall * 100), ratingQuality: Math.round(rv.overall * 100),
          body: rv.body, source: 'imported', verified: rv.verified, sourceName, sourceId: `${raw.sourceId}:r${ri}`,
        },
      });
    }
    await prisma.trustSignal.create({ data: { companyId: company.id, domainAgeYears: enrichedAge, sslValid: raw.trust.ssl ?? true, githubOrgActivity: raw.trust.github ?? null, certifications: raw.trust.certs, fundingRaised: raw.trust.funding } });
    await prisma.employeeSentiment.create({ data: { companyId: company.id, overallRating: raw.sentiment.overall, culture: raw.sentiment.culture, compensation: raw.sentiment.comp, workLifeBalance: raw.sentiment.wlb, leadership: raw.sentiment.leadership, recommendPct: raw.sentiment.recommendPct, reviewCount: raw.sentiment.reviewCount, sourceName: 'glassdoor', sourceUrl: `https://www.glassdoor.com/${kebab(raw.name)}`, asOf: new Date('2026-06-01') } });

    const s = computeScore(raw, enrichedAge);
    await prisma.intelligenceScore.create({ data: { companyId: company.id, ...s, justification: `${raw.name} scores ${s.cis}/100 (${s.quadrant.replace('_', ' ')}) from ${raw.reviews.length} reviews and enriched trust signals. Demo score pending the full engine.` } });
    return { slug: company.slug, cis: s.cis, action: existing ? 'updated' : 'created' };
  }

  return { slug: company.slug, cis: 0, action: 'updated' };
}

/** Ensure a unique company slug (append -2, -3… on collision). Keeps the current slug if unchanged. */
async function uniqueSlug(base: string, current?: string): Promise<string> {
  if (current && current.startsWith(base)) return current;
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await prisma.company.findUnique({ where: { slug } });
    if (!clash) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}
