import type { Prisma, Quadrant, ScoreTier } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('scoring');

// Weights (LOCKED, _canon.md §6). Renormalized when a signal is missing.
const W = { reviews: 0.4, sentiment: 0.25, trust: 0.2, market: 0.15 };
// Bayesian prior + recency decay (docs/08). m = prior strength, C = prior mean (1–5).
const PRIOR_M = 6;
const PRIOR_C = 3.5;
const HALF_LIFE_MONTHS = 12;
const MS_PER_MONTH = (365.25 / 12) * 24 * 3600 * 1000;
export const FORMULA_VERSION = 'cis-v1';

const monthsAgo = (d: Date, now: Date) => Math.max(0, (now.getTime() - d.getTime()) / MS_PER_MONTH);
const recencyWeight = (ageMonths: number) => Math.pow(0.5, ageMonths / HALF_LIFE_MONTHS);
const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
function median(nums: number[]): number {
  if (!nums.length) return 50;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export interface ReviewRow { ratingOverall: number; reviewedAt: Date; verified: boolean }
export interface ScoreInputs {
  reviews: ReviewRow[];
  externalRating: { average: number; count: number } | null; // real public rating (Google, …)
  employeeCount: number | null; // real company size, for market presence
  sentimentOverall: number | null; // 0–5
  sentimentReviewCount: number;
  trust: { domainAgeYears: number | null; sslValid: boolean | null; githubOrgActivity: number | null; certCount: number; funding: number | null } | null;
}

export interface CompanyScore {
  reviewsScore: number;
  sentimentScore: number | null;
  trustScore: number | null;
  marketScore: number;
  cis: number;
  marketPresence: number;
  clientSatisfaction: number;
  tier: ScoreTier;
  reviewCount: number;
  verifiedCount: number;
  recentCount: number;
}

/** Per-company signals + composite (quadrant assigned later, needs the cohort). */
export function scoreCompany(inp: ScoreInputs, now: Date): CompanyScore {
  // ── Reviews: recency-weighted Bayesian average ──
  let num = PRIOR_C * PRIOR_M;
  let den = PRIOR_M;
  let recentCount = 0;
  let verifiedCount = 0;
  for (const r of inp.reviews) {
    const stars = r.ratingOverall / 100;
    const age = monthsAgo(r.reviewedAt, now);
    const w = recencyWeight(age);
    num += stars * w;
    den += w;
    if (age <= 18) recentCount += 1;
    if (r.verified) verifiedCount += 1;
  }
  // Fold the real public (Google) rating into client satisfaction — strong but capped.
  if (inp.externalRating && inp.externalRating.count > 0) {
    const w = Math.min(inp.externalRating.count, 80) * 0.6;
    num += inp.externalRating.average * w;
    den += w;
  }
  const bayes = num / den; // 1–5
  const reviewsScore = clamp100((bayes / 5) * 100);
  const clientSatisfaction = reviewsScore;

  // ── Employee sentiment ──
  const sentimentScore = inp.sentimentOverall != null ? clamp100((inp.sentimentOverall / 5) * 100) : null;

  // ── Trust ──
  let trustScore: number | null = null;
  if (inp.trust) {
    const age = inp.trust.domainAgeYears ?? 0;
    trustScore = clamp100(10 + age * 3 + (inp.trust.sslValid ? 12 : 0) + inp.trust.certCount * 8 + (inp.trust.funding && inp.trust.funding > 0 ? 16 : 0) + Math.min(18, (inp.trust.githubOrgActivity ?? 0) / 40));
  }

  // ── Market activity (review breadth + public-rating volume + company size) ──
  const extCount = inp.externalRating?.count ?? 0;
  const emp = inp.employeeCount ?? 0;
  const marketScore = clamp100(inp.reviews.length * 6 + recentCount * 3 + inp.sentimentReviewCount * 0.35 + Math.min(45, extCount / 5) + Math.min(20, emp / 100));

  // ── Composite with renormalized weights for missing signals ──
  let wsum = W.reviews;
  let acc = W.reviews * reviewsScore;
  if (sentimentScore != null) { acc += W.sentiment * sentimentScore; wsum += W.sentiment; }
  if (trustScore != null) { acc += W.trust * trustScore; wsum += W.trust; }
  acc += W.market * marketScore; wsum += W.market;
  const cis = clamp100(acc / wsum);

  // ── Leaderboard axes ──
  const marketPresence = clamp100(inp.reviews.length * 4 + (trustScore ?? 0) * 0.4 + inp.sentimentReviewCount * 0.25 + Math.min(50, extCount / 4) + Math.min(20, emp / 150));

  // ── Eligibility gate: enough first-party verified reviews, OR a substantial public rating. ──
  const hasPublicRating = extCount >= 20;
  const tier: ScoreTier = (verifiedCount >= 3 && recentCount >= 3) || hasPublicRating ? 'Rated' : 'Unrated';

  return { reviewsScore, sentimentScore, trustScore, marketScore, cis, marketPresence, clientSatisfaction, tier, reviewCount: inp.reviews.length, verifiedCount, recentCount };
}

function quadrantFor(mp: number, cs: number, medMP: number, medCS: number): Quadrant {
  if (mp >= medMP) return cs >= medCS ? 'Leaders' : 'Challengers';
  return cs >= medCS ? 'Rising_Stars' : 'Niche_Players';
}

/**
 * Recompute every company's Company Intelligence Score with the real engine, assign
 * quadrants by country×service cohort median split, and freeze a monthly snapshot.
 */
export async function recomputeAllScores(now = new Date()): Promise<{ scored: number; cohorts: number }> {
  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      hqCountryId: true,
      employeeRangeMin: true,
      employeeRangeMax: true,
      services: { select: { serviceId: true, focusPct: true }, orderBy: { focusPct: 'desc' }, take: 1 },
      reviews: { where: { deletedAt: null, flagged: false }, select: { ratingOverall: true, reviewedAt: true, verified: true } },
      externalRatings: { select: { rating: true, ratingCount: true } },
      employeeSentiment: { orderBy: { asOf: 'desc' }, take: 1, select: { overallRating: true, reviewCount: true } },
      trustSignals: { orderBy: { asOf: 'desc' }, take: 1, select: { domainAgeYears: true, sslValid: true, githubOrgActivity: true, certifications: true, fundingRaised: true } },
    },
  });

  // Pass 1: per-company axes
  const rows = companies.map((c) => {
    const ts = c.trustSignals[0];
    const es = c.employeeSentiment[0];
    const ext = c.externalRatings.length
      ? { average: c.externalRatings.reduce((a, r) => a + r.rating, 0) / c.externalRatings.length, count: c.externalRatings.reduce((a, r) => a + r.ratingCount, 0) }
      : null;
    const score = scoreCompany(
      {
        reviews: c.reviews,
        externalRating: ext,
        employeeCount: c.employeeRangeMax ?? c.employeeRangeMin ?? null,
        sentimentOverall: es ? Number(es.overallRating) : null,
        sentimentReviewCount: es?.reviewCount ?? 0,
        trust: ts ? { domainAgeYears: ts.domainAgeYears != null ? Number(ts.domainAgeYears) : null, sslValid: ts.sslValid, githubOrgActivity: ts.githubOrgActivity, certCount: Array.isArray(ts.certifications) ? ts.certifications.length : 0, funding: ts.fundingRaised } : null,
      },
      now,
    );
    const cohortKey = `${c.hqCountryId ?? 'none'}:${c.services[0]?.serviceId ?? 'none'}`;
    const countryKey = c.hqCountryId ?? 'none';
    return { id: c.id, score, cohortKey, countryKey };
  });

  // Pass 2: cohort medians (fall back to country, then global for thin cohorts)
  const byCohort = new Map<string, { mp: number[]; cs: number[] }>();
  const byCountry = new Map<string, { mp: number[]; cs: number[] }>();
  const global = { mp: [] as number[], cs: [] as number[] };
  for (const r of rows) {
    (byCohort.get(r.cohortKey) ?? byCohort.set(r.cohortKey, { mp: [], cs: [] }).get(r.cohortKey)!).mp.push(r.score.marketPresence);
    byCohort.get(r.cohortKey)!.cs.push(r.score.clientSatisfaction);
    (byCountry.get(r.countryKey) ?? byCountry.set(r.countryKey, { mp: [], cs: [] }).get(r.countryKey)!).mp.push(r.score.marketPresence);
    byCountry.get(r.countryKey)!.cs.push(r.score.clientSatisfaction);
    global.mp.push(r.score.marketPresence);
    global.cs.push(r.score.clientSatisfaction);
  }
  const medMPglobal = median(global.mp);
  const medCSglobal = median(global.cs);

  // Pass 3: assign quadrant + persist (score + monthly snapshot)
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  let scored = 0;
  for (const r of rows) {
    const cohort = byCohort.get(r.cohortKey)!;
    const country = byCountry.get(r.countryKey)!;
    const medMP = cohort.mp.length >= 4 ? median(cohort.mp) : country.mp.length >= 4 ? median(country.mp) : medMPglobal;
    const medCS = cohort.cs.length >= 4 ? median(cohort.cs) : country.cs.length >= 4 ? median(country.cs) : medCSglobal;
    const quadrant = quadrantFor(r.score.marketPresence, r.score.clientSatisfaction, medMP, medCS);
    const s = r.score;

    const data = {
      cis: s.cis,
      reviewsScore: s.reviewsScore,
      sentimentScore: s.sentimentScore,
      trustScore: s.trustScore,
      marketScore: s.marketScore,
      marketPresence: s.marketPresence,
      clientSatisfaction: s.clientSatisfaction,
      quadrant,
      tier: s.tier,
      formulaVersion: FORMULA_VERSION,
      computedAt: now,
    } satisfies Prisma.IntelligenceScoreUncheckedUpdateInput;

    const justification = `Company Intelligence Score of ${s.cis}/100 (${quadrant.replace('_', ' ')}) — client satisfaction ${s.clientSatisfaction}/100${s.trustScore != null ? `, trust ${s.trustScore}/100` : ''}, market presence ${s.marketPresence}/100. Built from public ratings and ${s.reviewCount} first-party review${s.reviewCount === 1 ? '' : 's'}; ${s.tier === 'Rated' ? 'meets' : 'below'} the rating threshold.`;

    await prisma.intelligenceScore.upsert({
      where: { companyId: r.id },
      update: { ...data, justification },
      create: { companyId: r.id, ...data, justification },
    });
    await prisma.scoreSnapshot.upsert({
      where: { companyId_periodYear_periodMonth: { companyId: r.id, periodYear: year, periodMonth: month } },
      update: { cis: s.cis, reviewsScore: s.reviewsScore, sentimentScore: s.sentimentScore, trustScore: s.trustScore, marketScore: s.marketScore, marketPresence: s.marketPresence, clientSatisfaction: s.clientSatisfaction, quadrant, formulaVersion: FORMULA_VERSION },
      create: { companyId: r.id, periodYear: year, periodMonth: month, cis: s.cis, reviewsScore: s.reviewsScore, sentimentScore: s.sentimentScore, trustScore: s.trustScore, marketScore: s.marketScore, marketPresence: s.marketPresence, clientSatisfaction: s.clientSatisfaction, quadrant, formulaVersion: FORMULA_VERSION },
    });
    scored += 1;
  }

  logger.info({ scored, cohorts: byCohort.size }, 'Recomputed CIS');
  return { scored, cohorts: byCohort.size };
}
