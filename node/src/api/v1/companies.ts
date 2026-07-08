import { Router } from 'express';
import { z } from 'zod';
import { listCompanies, getCompanyBySlug } from '../../services/companyService.js';

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
