import { Router } from 'express';
import { z } from 'zod';
import type { QueryStatus, ClaimStatus } from '@prisma/client';
import { requireRole } from '../../middleware/auth.js';
import { getAdminStats } from '../../services/adminService.js';
import { listQueries, updateQuery } from '../../services/queryService.js';
import { listClaims, decideClaim } from '../../services/claimService.js';
import { assessReview } from '../../services/moderationService.js';
import { listSponsorships, createSponsorship, setSponsorshipActive } from '../../services/sponsorshipService.js';
import { writeAudit } from '../../utils/audit.js';

export const adminRouter = Router();

// All /api/v1/admin/* routes require an admin or super_admin.
adminRouter.use(requireRole('admin', 'super_admin'));

// GET /api/v1/admin/stats
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    res.json(await getAdminStats());
  } catch (e) {
    next(e);
  }
});

const STATUSES = ['New', 'Forwarded', 'Contacted', 'Closed'] as const;

// GET /api/v1/admin/queries?status=New
adminRouter.get('/queries', async (req, res, next) => {
  try {
    const raw = String(req.query.status ?? '');
    const status = (STATUSES as readonly string[]).includes(raw) ? (raw as QueryStatus) : undefined;
    res.json({ items: await listQueries(status) });
  } catch (e) {
    next(e);
  }
});

const patchBody = z.object({ status: z.enum(STATUSES).optional(), adminNotes: z.string().optional() });

// PATCH /api/v1/admin/queries/:id
adminRouter.patch('/queries/:id', async (req, res, next) => {
  try {
    const patch = patchBody.parse(req.body);
    const updated = await updateQuery(req.params.id, patch);
    await writeAudit({ actorId: req.user?.sub ?? null, action: 'query.update', entityType: 'Query', entityId: req.params.id, metadata: patch, ipAddress: req.ip ?? null });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

const CLAIM_STATUSES = ['pending', 'approved', 'rejected'] as const;

// GET /api/v1/admin/claims?status=pending
adminRouter.get('/claims', async (req, res, next) => {
  try {
    const raw = String(req.query.status ?? '');
    const status = (CLAIM_STATUSES as readonly string[]).includes(raw) ? (raw as ClaimStatus) : undefined;
    res.json({ items: await listClaims(status) });
  } catch (e) {
    next(e);
  }
});

const claimPatch = z.object({ decision: z.enum(['approved', 'rejected']) });

// PATCH /api/v1/admin/claims/:id  { decision }
adminRouter.patch('/claims/:id', async (req, res, next) => {
  try {
    const { decision } = claimPatch.parse(req.body);
    const result = await decideClaim(req.params.id, decision, req.user!.sub);
    await writeAudit({ actorId: req.user?.sub ?? null, action: `claim.${decision}`, entityType: 'Claim', entityId: req.params.id, ipAddress: req.ip ?? null });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

const moderateBody = z.object({ text: z.string().min(1).max(5000) });

// POST /api/v1/admin/moderate  — AI (or heuristic) sentiment + fake/spam assessment (docs/11)
adminRouter.post('/moderate', async (req, res, next) => {
  try {
    const { text } = moderateBody.parse(req.body);
    res.json(await assessReview(text));
  } catch (e) {
    next(e);
  }
});

const SERVICE_CATEGORIES = ['ai_development', 'custom_software', 'web_development', 'mobile_app_development', 'cloud', 'devops', 'data_engineering', 'cybersecurity', 'it_staff_augmentation', 'ui_ux_design'] as const;
const sponsorshipBody = z.object({
  companySlug: z.string(),
  tier: z.enum(['featured', 'sponsored', 'verified_plus']),
  countrySlug: z.string().optional(),
  serviceCategory: z.enum(SERVICE_CATEGORIES).optional(),
  slotRank: z.coerce.number().int().positive().optional(),
  priceAmount: z.coerce.number().int().nonnegative().optional(),
  priceCurrency: z.string().optional(),
});

// GET /api/v1/admin/sponsorships
adminRouter.get('/sponsorships', async (_req, res, next) => {
  try {
    res.json({ items: await listSponsorships() });
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/admin/sponsorships  — admin override for sales (docs/15)
adminRouter.post('/sponsorships', async (req, res, next) => {
  try {
    const input = sponsorshipBody.parse(req.body);
    const result = await createSponsorship(input);
    await writeAudit({ actorId: req.user?.sub ?? null, action: 'sponsorship.create', entityType: 'Sponsorship', entityId: result.id, metadata: input, ipAddress: req.ip ?? null });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/v1/admin/sponsorships/:id  { active }
adminRouter.patch('/sponsorships/:id', async (req, res, next) => {
  try {
    const { active } = z.object({ active: z.boolean() }).parse(req.body);
    const result = await setSponsorshipActive(req.params.id, active);
    await writeAudit({ actorId: req.user?.sub ?? null, action: `sponsorship.${active ? 'activate' : 'deactivate'}`, entityType: 'Sponsorship', entityId: req.params.id, ipAddress: req.ip ?? null });
    res.json(result);
  } catch (e) {
    next(e);
  }
});
