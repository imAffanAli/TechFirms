import { Router } from 'express';
import { z } from 'zod';
import { listCompanies, getCompanyBySlug } from '../../services/companyService.js';
import { submitEmployeeReview, submitClientReview } from '../../services/communityReviewService.js';

export const companiesRouter = Router();

const listQuery = z.object({
  q: z.string().trim().min(1).optional(),
  service: z.string().trim().optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  sort: z.enum(['cis', 'rating', 'reviews', 'name']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(48).optional(),
});

// GET /api/v1/companies
companiesRouter.get('/', async (req, res, next) => {
  try {
    const params = listQuery.parse(req.query);
    res.json(await listCompanies(params));
  } catch (e) {
    next(e);
  }
});

// GET /api/v1/companies/:slug
companiesRouter.get('/:slug', async (req, res, next) => {
  try {
    const company = await getCompanyBySlug(req.params.slug);
    if (!company) {
      res.status(404).json({ error: { code: 'not_found', message: 'Company not found' } });
      return;
    }
    res.json(company);
  } catch (e) {
    next(e);
  }
});

// ── First-party review submission (public; auto-moderated) ──
const employeeReviewBody = z.object({
  rating: z.coerce.number().min(1).max(5),
  title: z.string().trim().min(3).max(120),
  pros: z.string().trim().min(5).max(2000),
  cons: z.string().trim().min(5).max(2000),
  role: z.string().trim().max(80).optional(),
  isCurrentEmployee: z.boolean().optional().default(true),
  workEmail: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(), // honeypot
});

// POST /api/v1/companies/:slug/employee-reviews
companiesRouter.post('/:slug/employee-reviews', async (req, res, next) => {
  try {
    const body = employeeReviewBody.parse(req.body);
    if (body.website) {
      res.status(201).json({ ok: true }); // honeypot tripped — pretend success
      return;
    }
    const workEmail = body.workEmail || undefined;
    res.status(201).json(await submitEmployeeReview(req.params.slug, { ...body, workEmail }));
  } catch (e) {
    next(e);
  }
});

const clientReviewBody = z.object({
  reviewerName: z.string().trim().min(2).max(80),
  reviewerTitle: z.string().trim().max(80).optional(),
  reviewerCompany: z.string().trim().max(120).optional(),
  rating: z.coerce.number().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
  website: z.string().optional(), // honeypot
});

// POST /api/v1/companies/:slug/reviews
companiesRouter.post('/:slug/reviews', async (req, res, next) => {
  try {
    const body = clientReviewBody.parse(req.body);
    if (body.website) {
      res.status(201).json({ ok: true }); // honeypot tripped
      return;
    }
    res.status(201).json(await submitClientReview(req.params.slug, body));
  } catch (e) {
    next(e);
  }
});
