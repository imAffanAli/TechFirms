import { prisma } from '../db/prisma.js';
import { assessReview } from './moderationService.js';

/**
 * First-party reviews collected on TechFirms itself — legal, free, owned.
 * Employee reviews are Glassdoor-style (anonymous, with optional work-email domain
 * verification). Client reviews are public (the invited flow in dashboardService stays
 * separate and is marked verified). Both run through auto-moderation: a high spam score
 * holds the review (flagged) for an admin instead of publishing it.
 */

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

const SPAM_HOLD_THRESHOLD = 60; // spamRisk >= this is held for moderation

const normDomain = (d: string) => d.toLowerCase().trim().replace(/^www\./, '');

/** True when the reviewer's work-email domain matches the company's domain. */
function domainMatches(workEmail: string | undefined, companyDomain: string | null): boolean {
  if (!workEmail || !companyDomain) return false;
  const emailDomain = workEmail.split('@')[1];
  if (!emailDomain) return false;
  return normDomain(emailDomain) === normDomain(companyDomain);
}

const clampRating = (r: number) => Math.round(Math.max(1, Math.min(5, r)) * 100);

// ── Employee reviews (first-party, anonymous) ────────────────────────────────
export interface EmployeeReviewInput {
  rating: number; // 1..5 overall
  title: string;
  pros: string;
  cons: string;
  role?: string;
  isCurrentEmployee: boolean;
  workEmail?: string; // optional — domain match earns a "Verified employee" badge, stays anonymous
}

export async function submitEmployeeReview(slug: string, input: EmployeeReviewInput) {
  const company = await prisma.company.findFirst({ where: { slug, deletedAt: null }, select: { id: true, domain: true } });
  if (!company) throw httpError(404, 'Company not found');

  const verified = domainMatches(input.workEmail, company.domain);
  const assessment = await assessReview(`${input.title}\n${input.pros}\n${input.cons}`);
  const flagged = assessment.spamRisk.score >= SPAM_HOLD_THRESHOLD;

  await prisma.employeeReview.create({
    data: {
      companyId: company.id,
      rating: clampRating(input.rating),
      title: input.title,
      pros: input.pros,
      cons: input.cons,
      role: input.role ?? null,
      isCurrentEmployee: input.isCurrentEmployee,
      source: 'native',
      verified,
      flagged,
    },
  });

  return { ok: true, verified, held: flagged };
}

// ── Client reviews (first-party, public) ─────────────────────────────────────
export interface ClientReviewInput {
  reviewerName: string;
  reviewerTitle?: string;
  reviewerCompany?: string;
  rating: number; // 1..5 overall
  body: string;
}

export async function submitClientReview(slug: string, input: ClientReviewInput) {
  const company = await prisma.company.findFirst({ where: { slug, deletedAt: null }, select: { id: true } });
  if (!company) throw httpError(404, 'Company not found');

  const assessment = await assessReview(input.body);
  const flagged = assessment.spamRisk.score >= SPAM_HOLD_THRESHOLD;

  await prisma.customerReview.create({
    data: {
      companyId: company.id,
      reviewerName: input.reviewerName,
      reviewerTitle: input.reviewerTitle ?? null,
      reviewerCompany: input.reviewerCompany ?? null,
      ratingOverall: clampRating(input.rating),
      body: input.body,
      source: 'native',
      verified: false, // public + unverified; the invited flow marks reviews verified
      flagged,
    },
  });

  return { ok: true, held: flagged };
}

// ── Admin moderation ─────────────────────────────────────────────────────────
export async function listHeldReviews() {
  const [client, employee] = await Promise.all([
    prisma.customerReview.findMany({
      where: { flagged: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { company: { select: { slug: true, name: true } } },
    }),
    prisma.employeeReview.findMany({
      where: { flagged: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { company: { select: { slug: true, name: true } } },
    }),
  ]);
  return {
    client: client.map((r) => ({ id: r.id, company: r.company, reviewerName: r.reviewerName, rating: r.ratingOverall / 100, body: r.body, createdAt: r.createdAt })),
    employee: employee.map((r) => ({ id: r.id, company: r.company, title: r.title, rating: r.rating / 100, pros: r.pros, cons: r.cons, verified: r.verified, createdAt: r.createdAt })),
  };
}

export async function moderateReview(kind: 'client' | 'employee', id: string, decision: 'approve' | 'reject') {
  const data = decision === 'approve' ? { flagged: false } : { deletedAt: new Date() };
  if (kind === 'client') await prisma.customerReview.update({ where: { id }, data });
  else await prisma.employeeReview.update({ where: { id }, data });
  return { ok: true };
}
