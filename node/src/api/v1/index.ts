import { Router } from 'express';
import { companiesRouter } from './companies.js';
import { leaderboardRouter } from './leaderboard.js';
import { servicesRouter, countriesRouter } from './catalog.js';
import { authRouter } from './auth.js';
import { adminRouter } from './admin.js';

/**
 * API surface (v1). Public read endpoints per docs/16; auth + admin per docs/12.
 */
export const v1Router = Router();

v1Router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'techfirms-api', version: 'v1', time: new Date().toISOString() });
});

v1Router.use('/auth', authRouter); // register, login, logout, me
v1Router.use('/admin', adminRouter); // role-gated admin endpoints
v1Router.use('/companies', companiesRouter); // GET /companies, GET /companies/:slug
v1Router.use('/leaderboard', leaderboardRouter); // GET /leaderboard/:country[/:service]
v1Router.use('/services', servicesRouter); // GET /services
v1Router.use('/countries', countriesRouter); // GET /countries
