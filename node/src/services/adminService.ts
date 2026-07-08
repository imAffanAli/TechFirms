import { prisma } from '../db/prisma.js';
import { isAiEnabled } from './ai.js';

/** Admin dashboard KPIs (docs/12). */
export async function getAdminStats() {
  const [companies, claimed, verified, reviews, countries, services, pendingClaims, queries, flaggedReviews] = await Promise.all([
    prisma.company.count({ where: { deletedAt: null } }),
    prisma.company.count({ where: { deletedAt: null, claimed: true } }),
    prisma.company.count({ where: { deletedAt: null, verified: true } }),
    prisma.customerReview.count({ where: { deletedAt: null } }),
    prisma.country.count(),
    prisma.service.count(),
    prisma.claim.count({ where: { status: 'pending' } }),
    prisma.query.count({ where: { deletedAt: null } }),
    prisma.customerReview.count({ where: { flagged: true, deletedAt: null } }),
  ]);
  return {
    companies,
    claimed,
    verified,
    claimedPct: companies ? Math.round((claimed / companies) * 100) : 0,
    reviews,
    countries,
    services,
    pendingClaims,
    queries,
    flaggedReviews,
    aiEnabled: isAiEnabled(),
  };
}
