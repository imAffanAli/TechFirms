import type { SponsorshipTier, ServiceCategory } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { assertCompanyRole, OWNER_ONLY, OPERATE } from './teamService.js';

/**
 * Self-serve sponsorship purchasing. Orders are created by a company Owner and, in manual mode,
 * approved by an admin (which creates the live Sponsorship with start/end dates). Stripe can be
 * added later behind PAYMENTS_PROVIDER without changing this flow. Ranking + CIS are never sold.
 */

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

// Display metadata + benefits per tier (organic ranking always excluded).
export const TIER_META: Record<SponsorshipTier, { name: string; blurb: string; benefits: string[] }> = {
  featured: {
    name: 'Featured',
    blurb: 'Stand out in the directory.',
    benefits: ['"Featured" badge on your card', 'Highlighted directory card', 'Logo priority in listings'],
  },
  sponsored: {
    name: 'Sponsored',
    blurb: 'A labeled placement on your country/service board.',
    benefits: ['Everything in Featured', 'Labeled "Sponsored" slot on a country × service board', 'Profile gallery + custom call-to-action', 'Priority on incoming leads', 'Full impressions/clicks analytics'],
  },
  verified_plus: {
    name: 'Verified-Plus',
    blurb: 'Maximum trust + reach.',
    benefits: ['Everything in Sponsored', 'Deep-verification seal', 'Video embed on your profile', 'Priority support'],
  },
};

// Plan catalog (USD cents). Kept in code; ensurePlans() upserts them.
const PLAN_PRICES: Record<SponsorshipTier, Record<number, number>> = {
  featured: { 30: 9900, 90: 26900, 365: 89900 },
  sponsored: { 30: 19900, 90: 53900, 365: 179900 },
  verified_plus: { 30: 34900, 90: 93900, 365: 314900 },
};

export async function ensurePlans() {
  for (const tier of Object.keys(PLAN_PRICES) as SponsorshipTier[]) {
    for (const [days, price] of Object.entries(PLAN_PRICES[tier])) {
      await prisma.sponsorshipPlan.upsert({
        where: { tier_durationDays: { tier, durationDays: Number(days) } },
        update: { priceAmount: price, active: true },
        create: { tier, durationDays: Number(days), priceAmount: price },
      });
    }
  }
}

export async function listPlans() {
  const plans = await prisma.sponsorshipPlan.findMany({ where: { active: true }, orderBy: [{ tier: 'asc' }, { durationDays: 'asc' }] });
  const tiers: SponsorshipTier[] = ['featured', 'sponsored', 'verified_plus'];
  return tiers.map((tier) => ({
    tier,
    ...TIER_META[tier],
    durations: plans
      .filter((p) => p.tier === tier)
      .map((p) => ({ planId: p.id, durationDays: p.durationDays, priceAmount: p.priceAmount, priceCurrency: p.priceCurrency })),
  }));
}

export async function createOrder(userId: string, slug: string, planId: string, opts: { countryId?: string; serviceCategory?: ServiceCategory } = {}) {
  const { company } = await assertCompanyRole(userId, slug, OWNER_ONLY);
  const plan = await prisma.sponsorshipPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) throw httpError(404, 'Plan not found');

  const pending = await prisma.sponsorshipOrder.findFirst({ where: { companyId: company.id, status: 'pending' } });
  if (pending) throw httpError(409, 'You already have a pending sponsorship order for this company.');

  const order = await prisma.sponsorshipOrder.create({
    data: {
      companyId: company.id,
      requestedById: userId,
      planId: plan.id,
      tier: plan.tier,
      durationDays: plan.durationDays,
      countryId: opts.countryId ?? null,
      serviceCategory: opts.serviceCategory ?? null,
      amount: plan.priceAmount,
      currency: plan.priceCurrency,
      status: 'pending',
      paymentMethod: 'manual_invoice',
    },
  });
  return { id: order.id, status: order.status, amount: order.amount, currency: order.currency, tier: order.tier, durationDays: order.durationDays };
}

export async function listCompanyOrders(userId: string, slug: string) {
  const { company } = await assertCompanyRole(userId, slug, OPERATE);
  const rows = await prisma.sponsorshipOrder.findMany({ where: { companyId: company.id }, orderBy: { createdAt: 'desc' }, take: 20, include: { sponsorship: { select: { endsAt: true, active: true } } } });
  return rows.map((o) => ({ id: o.id, tier: o.tier, durationDays: o.durationDays, amount: o.amount, currency: o.currency, status: o.status, endsAt: o.sponsorship?.endsAt ?? null, createdAt: o.createdAt }));
}

// ── Admin ──
export async function listOrders(status?: 'pending' | 'active' | 'rejected' | 'expired') {
  const rows = await prisma.sponsorshipOrder.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { company: { select: { slug: true, name: true } }, sponsorship: { select: { endsAt: true } } },
  });
  return rows.map((o) => ({ id: o.id, company: o.company, tier: o.tier, durationDays: o.durationDays, amount: o.amount, currency: o.currency, status: o.status, paymentMethod: o.paymentMethod, endsAt: o.sponsorship?.endsAt ?? null, createdAt: o.createdAt }));
}

/** Approve a pending order → create the live Sponsorship and mark the order active. */
export async function approveOrder(adminId: string, orderId: string) {
  const order = await prisma.sponsorshipOrder.findUnique({ where: { id: orderId } });
  if (!order) throw httpError(404, 'Order not found');
  if (order.status !== 'pending') throw httpError(409, 'Order is not pending');

  // Next slot rank for a scoped "sponsored" board.
  let slotRank: number | null = null;
  if (order.tier === 'sponsored') {
    const last = await prisma.sponsorship.findFirst({
      where: { tier: 'sponsored', active: true, countryId: order.countryId, serviceCategory: order.serviceCategory },
      orderBy: { slotRank: 'desc' },
      select: { slotRank: true },
    });
    slotRank = (last?.slotRank ?? 0) + 1;
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + order.durationDays * 86400000);
  const sponsorship = await prisma.sponsorship.create({
    data: {
      companyId: order.companyId,
      tier: order.tier,
      countryId: order.countryId,
      serviceCategory: order.serviceCategory,
      slotRank,
      priceAmount: order.amount,
      priceCurrency: order.currency,
      planId: order.planId,
      startsAt: now,
      endsAt,
      active: true,
    },
  });
  await prisma.sponsorshipOrder.update({ where: { id: order.id }, data: { status: 'active', sponsorshipId: sponsorship.id, reviewedById: adminId, reviewedAt: now } });
  return { ok: true, endsAt };
}

export async function rejectOrder(adminId: string, orderId: string) {
  const order = await prisma.sponsorshipOrder.findUnique({ where: { id: orderId } });
  if (!order) throw httpError(404, 'Order not found');
  if (order.status !== 'pending') throw httpError(409, 'Order is not pending');
  await prisma.sponsorshipOrder.update({ where: { id: order.id }, data: { status: 'rejected', reviewedById: adminId, reviewedAt: new Date() } });
  return { ok: true };
}

/** Deactivate sponsorships whose term has ended, and mark their orders expired. Idempotent. */
export async function expireSponsorships() {
  const now = new Date();
  const expired = await prisma.sponsorship.findMany({ where: { active: true, endsAt: { not: null, lt: now } }, select: { id: true } });
  if (expired.length === 0) return 0;
  const ids = expired.map((s) => s.id);
  await prisma.sponsorship.updateMany({ where: { id: { in: ids } }, data: { active: false } });
  await prisma.sponsorshipOrder.updateMany({ where: { sponsorshipId: { in: ids }, status: 'active' }, data: { status: 'expired' } });
  return ids.length;
}
