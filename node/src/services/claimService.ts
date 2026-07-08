import { randomBytes } from 'node:crypto';
import type { ClaimStatus, Prisma, VerificationMethod } from '@prisma/client';
import { prisma } from '../db/prisma.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

/** A user requests ownership of a company (docs/05). Verified by work-email domain or DNS TXT. */
export async function requestClaim(userId: string, userEmail: string, companySlug: string, method: VerificationMethod) {
  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) throw httpError(404, 'Company not found');
  if (company.ownerId && company.ownerId !== userId) throw httpError(409, 'This company has already been claimed');

  const existing = await prisma.claim.findFirst({ where: { companyId: company.id, userId, status: 'pending' } });
  if (existing) return { id: existing.id, method: existing.verificationMethod, alreadyPending: true as const, token: (existing.verificationEvidence as { dnsTxt?: string } | null)?.dnsTxt };

  const emailDomain = (userEmail.split('@')[1] ?? '').toLowerCase();
  const domainMatches = !!company.domain && emailDomain === company.domain.toLowerCase();

  let evidence: Prisma.InputJsonValue;
  let token: string | undefined;
  if (method === 'work_email_domain') {
    evidence = { emailDomain, companyDomain: company.domain ?? null, matches: domainMatches };
  } else {
    token = `techfirms-verify=${randomBytes(8).toString('hex')}`;
    evidence = { dnsTxt: token, domain: company.domain ?? null };
  }

  const claim = await prisma.claim.create({ data: { companyId: company.id, userId, verificationMethod: method, verificationEvidence: evidence } });
  return { id: claim.id, method, token, domainMatches, alreadyPending: false as const };
}

export async function listMyClaims(userId: string) {
  const rows = await prisma.claim.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { company: { select: { slug: true, name: true } } } });
  return rows.map((c) => ({ id: c.id, status: c.status, method: c.verificationMethod, company: c.company, createdAt: c.createdAt }));
}

export async function listClaims(status?: ClaimStatus) {
  const rows = await prisma.claim.findMany({
    where: status ? { status } : {},
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { company: { select: { slug: true, name: true, domain: true, listingStatus: true } }, user: { select: { email: true, fullName: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    status: c.status,
    method: c.verificationMethod,
    evidence: c.verificationEvidence,
    company: c.company,
    user: c.user,
    createdAt: c.createdAt,
  }));
}

/** Admin approves/rejects. Approval grants ownership + promotes a visitor to business_owner. */
export async function decideClaim(claimId: string, decision: 'approved' | 'rejected', adminId: string) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId }, include: { user: { select: { id: true, role: true } } } });
  if (!claim) throw httpError(404, 'Claim not found');

  if (decision === 'rejected') {
    await prisma.claim.update({ where: { id: claimId }, data: { status: 'rejected', reviewedByUserId: adminId, reviewedAt: new Date() } });
    return { ok: true };
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.company.update({ where: { id: claim.companyId }, data: { ownerId: claim.userId, claimed: true, listingStatus: 'claimed' } }),
    prisma.claim.update({ where: { id: claimId }, data: { status: 'approved', reviewedByUserId: adminId, reviewedAt: new Date() } }),
  ];
  // promote only a plain visitor (don't downgrade an admin who claimed)
  if (claim.user.role === 'visitor') {
    ops.push(prisma.user.update({ where: { id: claim.userId }, data: { role: 'business_owner' } }));
  }
  await prisma.$transaction(ops);
  return { ok: true };
}
