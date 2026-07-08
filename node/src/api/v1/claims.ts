import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.js';
import { requestClaim, listMyClaims } from '../../services/claimService.js';

export const claimsRouter = Router();
claimsRouter.use(requireRole()); // any authenticated user

const body = z.object({ companySlug: z.string(), method: z.enum(['work_email_domain', 'dns_txt']) });

// POST /api/v1/claims
claimsRouter.post('/', async (req, res, next) => {
  try {
    const { companySlug, method } = body.parse(req.body);
    const result = await requestClaim(req.user!.sub, req.user!.email, companySlug, method);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// GET /api/v1/claims/mine
claimsRouter.get('/mine', async (req, res, next) => {
  try {
    res.json({ items: await listMyClaims(req.user!.sub) });
  } catch (e) {
    next(e);
  }
});
