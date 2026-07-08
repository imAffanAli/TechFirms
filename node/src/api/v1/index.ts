import { Router } from 'express';
import { companiesRouter } from './companies.js';
import { leaderboardRouter } from './leaderboard.js';
import { servicesRouter, countriesRouter } from './catalog.js';

/**
 * Public read-only API surface (v1). Full contract in docs/16-public-api-spec.md.
 */
export const v1Router = Router();

v1Router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'techfirms-api', version: 'v1', time: new Date().toISOString() });
});

v1Router.use('/companies', companiesRouter); // GET /companies, GET /companies/:slug
v1Router.use('/leaderboard', leaderboardRouter); // GET /leaderboard/:country[/:service]
v1Router.use('/services', servicesRouter); // GET /services
v1Router.use('/countries', countriesRouter); // GET /countries
