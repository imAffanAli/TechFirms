/**
 * One-shot bootstrap for hosted deploys (Railway/Render/etc). Runs at container start.
 *
 * - Always applies pending migrations (fast, idempotent).
 * - Seeds companies + scores ONLY when the DB is empty (first boot), so redeploys and
 *   restarts stay quick instead of re-importing everything each time.
 * - Always ensures the demo/admin logins + sample state exist (cheap, idempotent).
 */
import { execSync } from 'node:child_process';
import { prisma } from '../db/prisma.js';

function run(cmd: string) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  run('npx prisma migrate deploy');

  let companies = 0;
  try {
    companies = await prisma.company.count();
  } catch {
    companies = 0; // table may not exist yet on a brand-new database
  }

  if (companies === 0) {
    console.log('Empty database — running first-time seed + import + score pass.');
    run('npm run db:seed');
    run('npm run pipeline:import');
    run('npm run scores:recompute');
  } else {
    console.log(`Database already has ${companies} companies — skipping heavy seed.`);
  }

  // Cheap + idempotent: guarantees the demo owner, admin, and sample data exist.
  run('npm run demo:setup');

  console.log('\nBootstrap complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
