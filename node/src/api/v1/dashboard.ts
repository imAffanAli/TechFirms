import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.js';
import {
  listOwnedCompanies,
  updateOwnedCompany,
  listDashboardQueries,
  getDashboardOverview,
  createInvitation,
  listInvitations,
} from '../../services/dashboardService.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireRole('business_owner', 'admin', 'super_admin'));

dashboardRouter.get('/overview', async (req, res, next) => {
  try {
    res.json(await getDashboardOverview(req.user!.sub));
  } catch (e) {
    next(e);
  }
});

dashboardRouter.get('/companies', async (req, res, next) => {
  try {
    res.json({ items: await listOwnedCompanies(req.user!.sub) });
  } catch (e) {
    next(e);
  }
});

const editBody = z.object({
  tagline: z.string().max(120).optional(),
  description: z.string().max(4000).optional(),
  website: z.string().url().optional(),
  foundedYear: z.coerce.number().int().min(1970).max(2030).optional(),
  employeeRangeMin: z.coerce.number().int().nonnegative().optional(),
  employeeRangeMax: z.coerce.number().int().nonnegative().optional(),
  hourlyRateMin: z.coerce.number().int().nonnegative().optional(),
  hourlyRateMax: z.coerce.number().int().nonnegative().optional(),
  minProjectSize: z.coerce.number().int().nonnegative().optional(),
});

dashboardRouter.patch('/companies/:slug', async (req, res, next) => {
  try {
    res.json(await updateOwnedCompany(req.user!.sub, req.params.slug, editBody.parse(req.body)));
  } catch (e) {
    next(e);
  }
});

dashboardRouter.get('/queries', async (req, res, next) => {
  try {
    res.json({ items: await listDashboardQueries(req.user!.sub) });
  } catch (e) {
    next(e);
  }
});

const inviteBody = z.object({ clientEmail: z.string().email(), clientName: z.string().optional() });

dashboardRouter.post('/companies/:slug/invitations', async (req, res, next) => {
  try {
    const { clientEmail, clientName } = inviteBody.parse(req.body);
    res.status(201).json(await createInvitation(req.user!.sub, req.params.slug, clientEmail, clientName));
  } catch (e) {
    next(e);
  }
});

dashboardRouter.get('/companies/:slug/invitations', async (req, res, next) => {
  try {
    res.json({ items: await listInvitations(req.user!.sub, req.params.slug) });
  } catch (e) {
    next(e);
  }
});
