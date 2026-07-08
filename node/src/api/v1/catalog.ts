import { Router } from 'express';
import { listServices, listCountries } from '../../services/companyService.js';

export const servicesRouter = Router();
// GET /api/v1/services
servicesRouter.get('/', async (_req, res, next) => {
  try {
    res.json({ items: await listServices() });
  } catch (e) {
    next(e);
  }
});

export const countriesRouter = Router();
// GET /api/v1/countries
countriesRouter.get('/', async (_req, res, next) => {
  try {
    res.json({ items: await listCountries() });
  } catch (e) {
    next(e);
  }
});
