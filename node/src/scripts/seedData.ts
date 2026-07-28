/**
 * Background data seed, run once on first boot and (idempotently) on every deploy
 * (see startProd.ts). The real-only dataset is small enough to reconcile each boot.
 *
 * Uses compiled scripts (node dist/…) rather than tsx to keep memory low on small hosts.
 */
import { execSync } from 'node:child_process';

function run(cmd: string) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  run('node dist/scripts/seed.js'); // base taxonomy (services, countries) + admin
  run('node dist/scripts/importCompanies.js'); // curated REAL companies
  run('node dist/scripts/purgeDemoData.js'); // remove any leftover demo/generated data
  run('node dist/scripts/discoverCompanies.js'); // grow with REAL companies via Google Places (gated)
  run('node dist/scripts/demoSetup.js'); // demo owner + sponsored placements (idempotent)
  run('node dist/scripts/fetchRatings.js'); // real Google ratings (no-op without the key)
  run('node dist/scripts/recomputeScores.js'); // scores from real signals (ratings + facts)
  console.log('[seedData] done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
