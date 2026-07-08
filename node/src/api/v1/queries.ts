import { Router } from 'express';
import { z } from 'zod';
import { createQuery } from '../../services/queryService.js';

export const queriesRouter = Router();

const body = z.object({
  projectType: z.string().min(2),
  serviceSlug: z.string().optional(),
  countrySlug: z.string().optional(),
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  budgetCurrency: z.string().optional(),
  timeline: z.string().optional(),
  description: z.string().min(10, 'Please describe your project (10+ chars)'),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  directCompanySlug: z.string().optional(),
  website: z.string().optional(), // honeypot — real users leave it blank
});

// POST /api/v1/queries  (public lead-gen submission)
queriesRouter.post('/', async (req, res, next) => {
  try {
    const data = body.parse(req.body);
    if (data.website && data.website.trim() !== '') {
      res.status(200).json({ ok: true }); // silently drop bots
      return;
    }
    const result = await createQuery(data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});
