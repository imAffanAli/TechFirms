import { PgBoss } from 'pg-boss';
import { env } from './config/env.js';
import { createLogger } from './utils/logger.js';
import { ingestCompany, type RawCompany } from './services/pipeline.js';

const logger = createLogger('worker');

const Q_SCRAPE = 'scrape-company'; // pg-boss v12 queue names: alphanumeric, _ - . / only

interface ScrapeJob {
  raw: RawCompany;
  sourceName: string;
  baseUrl: string;
}

/**
 * Background worker — runs as a SEPARATE process from the API (docs/07). Owns the
 * scraping/enrichment pipeline, CIS scoring, and (later) AI jobs, via pg-boss.
 * The bulk seed uses `npm run pipeline:import` (direct); this worker is the queued/
 * scheduled path — send `scrape:company` jobs and they flow through the same ingest.
 */
async function main(): Promise<void> {
  const boss = new PgBoss(env.DATABASE_URL);
  boss.on('error', (err: unknown) => logger.error({ err }, 'pg-boss error'));

  await boss.start();
  await boss.createQueue(Q_SCRAPE);

  await boss.work<ScrapeJob>(Q_SCRAPE, async (jobs) => {
    for (const job of jobs) {
      const { raw, sourceName, baseUrl } = job.data;
      try {
        const res = await ingestCompany(raw, sourceName, baseUrl);
        logger.info({ slug: res.slug, action: res.action, cis: res.cis }, 'ingested');
      } catch (err) {
        logger.error({ err, sourceId: raw?.sourceId }, 'ingest failed');
        throw err; // let pg-boss retry with backoff / dead-letter
      }
    }
  });

  logger.info(`TechFirms worker ready — listening on queue "${Q_SCRAPE}"`);
}

/** Enqueue records for background ingestion (used by scheduled/real-scrape flows). */
export async function enqueueScrape(raws: RawCompany[], sourceName: string, baseUrl: string): Promise<void> {
  const boss = new PgBoss(env.DATABASE_URL);
  await boss.start();
  await boss.createQueue(Q_SCRAPE);
  for (const raw of raws) await boss.send(Q_SCRAPE, { raw, sourceName, baseUrl } satisfies ScrapeJob);
  await boss.stop();
}

main().catch((err) => {
  logger.error({ err }, 'Worker failed to start');
  process.exit(1);
});
