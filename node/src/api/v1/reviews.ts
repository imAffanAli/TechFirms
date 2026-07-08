import { Router } from 'express';
import { z } from 'zod';
import { getInvitation, submitInvitedReview } from '../../services/dashboardService.js';

export const reviewsRouter = Router();

// GET /api/v1/reviews/invitation/:token  (public — powers the review form)
reviewsRouter.get('/invitation/:token', async (req, res, next) => {
  try {
    const inv = await getInvitation(req.params.token);
    if (!inv) {
      res.status(404).json({ error: { code: 'not_found', message: 'Invalid review link' } });
      return;
    }
    res.json(inv);
  } catch (e) {
    next(e);
  }
});

const rev = z.object({
  reviewerName: z.string().min(2),
  reviewerTitle: z.string().optional(),
  reviewerCompany: z.string().optional(),
  ratingQuality: z.coerce.number().min(1).max(5),
  ratingSchedule: z.coerce.number().min(1).max(5),
  ratingCost: z.coerce.number().min(1).max(5),
  ratingWillingToRefer: z.coerce.number().min(1).max(5),
  body: z.string().min(10),
  projectBudget: z.coerce.number().nonnegative().optional(),
  projectDurationMonths: z.coerce.number().int().nonnegative().optional(),
});

// POST /api/v1/reviews/invitation/:token  (public — submit a verified native review)
reviewsRouter.post('/invitation/:token', async (req, res, next) => {
  try {
    res.status(201).json(await submitInvitedReview(req.params.token, rev.parse(req.body)));
  } catch (e) {
    next(e);
  }
});
