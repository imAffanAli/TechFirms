import type { Prisma, ServiceCategory, SponsorshipTier } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { getCardsByIds, type CompanyCard } from './companyService.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

/** Admin override: attach a Featured / Sponsored / Verified-Plus placement to a company (docs/15). */
export async function createSponsorship(input: {
  companySlug: string;
  tier: SponsorshipTier;
  countrySlug?: string;
  serviceCategory?: ServiceCategory;
  slotRank?: number;
  priceAmount?: number;
  priceCurrency?: string;
  endsAt?: Date;
}) {
  const company = await prisma.company.findUnique({ where: { slug: input.companySlug }, select: { id: true } });
  if (!company) throw httpError(404, 'Company not found');
  const country = input.countrySlug ? await prisma.country.findUnique({ where: { slug: input.countrySlug }, select: { id: true } }) : null;
  const sp = await prisma.sponsorship.create({
    data: {
      companyId: company.id,
      tier: input.tier,
      countryId: country?.id ?? null,
      serviceCategory: input.serviceCategory ?? null,
      slotRank: input.slotRank ?? null,
      priceAmount: input.priceAmount ?? null,
      priceCurrency: input.priceCurrency ?? 'USD',
      startsAt: new Date(),
      endsAt: input.endsAt ?? null,
      active: true,
    },
  });
  return { id: sp.id };
}

export async function listSponsorships() {
  const rows = await prisma.sponsorship.findMany({
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    include: { company: { select: { slug: true, name: true } } },
  });
  return rows.map((s) => ({
    id: s.id,
    company: s.company,
    tier: s.tier,
    serviceCategory: s.serviceCategory,
    slotRank: s.slotRank,
    priceAmount: s.priceAmount,
    priceCurrency: s.priceCurrency,
    active: s.active,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    impressions: s.impressions,
    clicks: s.clicks,
  }));
}

export async function setSponsorshipActive(id: string, active: boolean) {
  await prisma.sponsorship.update({ where: { id }, data: { active } });
  return { ok: true };
}

export interface SponsoredCard extends CompanyCard {
  sponsorshipId: string;
}

/** Active sponsored placements for a directory context. Increments impressions. */
export async function getSponsoredForDirectory(countrySlug?: string, serviceSlug?: string, limit = 3): Promise<SponsoredCard[]> {
  const now = new Date();
  const country = countrySlug ? await prisma.country.findUnique({ where: { slug: countrySlug }, select: { id: true } }) : null;
  const service = serviceSlug ? await prisma.service.findUnique({ where: { slug: serviceSlug }, select: { category: true } }) : null;

  const rows = await prisma.sponsorship.findMany({
    where: {
      tier: 'sponsored',
      active: true,
      startsAt: { lte: now },
      AND: [
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ...(country ? [{ OR: [{ countryId: null }, { countryId: country.id }] } as Prisma.SponsorshipWhereInput] : []),
        ...(service ? [{ OR: [{ serviceCategory: null }, { serviceCategory: service.category }] } as Prisma.SponsorshipWhereInput] : []),
      ],
    },
    orderBy: [{ slotRank: 'asc' }, { createdAt: 'desc' }],
    take: limit,
    include: { company: { select: { id: true, slug: true } } },
  });
  if (rows.length === 0) return [];

  await prisma.sponsorship.updateMany({ where: { id: { in: rows.map((r) => r.id) } }, data: { impressions: { increment: 1 } } });

  const slugToSp = new Map(rows.map((r) => [r.company.slug, r.id] as const));
  const cards = await getCardsByIds(rows.map((r) => r.companyId));
  return cards.map((c) => ({ ...c, sponsorshipId: slugToSp.get(c.slug)! }));
}

export async function trackClick(id: string) {
  await prisma.sponsorship.update({ where: { id }, data: { clicks: { increment: 1 } } }).catch(() => {});
  return { ok: true };
}
