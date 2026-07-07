import { PgBoss } from 'pg-boss';
import { env } from './config/env.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('worker');

/**
 * Background worker — runs as a SEPARATE process from the API (never inside the web app).
 * Owns the scraping/enrichment pipeline (docs/07), the CIS scoring engine (docs/08),
 * and AI jobs (docs/11), scheduled via pg-boss. Job handlers are registered per docs/19 (M2+).
 */
async function main(): Promise<void> {
  const boss = new PgBoss(env.DATABASE_URL);
  boss.on('error', (err: unknown) => logger.error({ err }, 'pg-boss error'));

  await boss.start();
  logger.info('TechFirms worker started (pg-boss)');

  // Example registrations (implemented in later milestones):
  // await boss.work('scrape:company', { batchSize: 5 }, scrapeCompanyHandler);
  // await boss.work('score:recompute', scoreRecomputeHandler);
  // await boss.schedule('score:recompute', '0 3 * * 1'); // weekly, Mondays 03:00
}

main().catch((err) => {
  logger.error({ err }, 'Worker failed to start');
  process.exit(1);
});
