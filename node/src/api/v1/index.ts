import { Router } from 'express';

/**
 * Public read-only API surface (v1). Full contract in docs/16-public-api-spec.md.
 * Resource routers are added per docs/19-build-sequence.md (M3+).
 */
export const v1Router = Router();

v1Router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'techfirms-api',
    version: 'v1',
    time: new Date().toISOString(),
  });
});

// Planned (see docs/16 + docs/19):
// v1Router.use('/companies', companiesRouter);       // GET /companies, GET /companies/:slug
// v1Router.use('/leaderboard', leaderboardRouter);   // GET /leaderboard/:country[/:service]
// v1Router.use('/services', servicesRouter);         // GET /services
// v1Router.use('/countries', countriesRouter);       // GET /countries
// v1Router.use('/reports', reportsRouter);           // GET /reports/:country
