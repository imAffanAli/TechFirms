import { Router } from 'express';
import { getSponsoredForDirectory, trackClick } from '../../services/sponsorshipService.js';

export const sponsorshipsRouter = Router();

// GET /api/v1/sponsorships/active?country=&service=  (public; sponsored slots for a context)
sponsorshipsRouter.get('/active', async (req, res, next) => {
  try {
    const country = typeof req.query.country === 'string' ? req.query.country : undefined;
    const service = typeof req.query.service === 'string' ? req.query.service : undefined;
    res.json({ items: await getSponsoredForDirectory(country, service) });
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/sponsorships/:id/click  (public; click tracking)
sponsorshipsRouter.post('/:id/click', async (req, res, next) => {
  try {
    res.json(await trackClick(req.params.id));
  } catch (e) {
    next(e);
  }
});
