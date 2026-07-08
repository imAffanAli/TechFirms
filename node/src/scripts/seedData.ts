/**
 * Background data seed, run once on first boot (see startProd.ts).
 *
 * Guarded by a company count so redeploys/restarts skip the heavy import. Uses the
 * compiled scripts (node dist/…) rather than tsx to keep memory low on small hosts.
 */
import { execSync } from 'node:child_process';
import { prisma } from '../db/prisma.js';

function run(cmd: string) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  let companies = 0;
  try {
    companies = await prisma.company.count();
  } catch {
    companies = 0; // tables may not exist on a brand-new database
  }

  if (companies === 0) {
    console.log('[seedData] first boot — seeding companies + scores…');
    run('node dist/scripts/seed.js');
    run('node dist/scripts/importCompanies.js');
    run('node dist/scripts/recomputeScores.js');
  } else {
    console.log(`[seedData] database already has ${companies} companies — skipping heavy seed.`);
  }

  // Cheap + idempotent: guarantees the demo owner, admin, and sample data exist.
  run('node dist/scripts/demoSetup.js');

  console.log('[seedData] done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
