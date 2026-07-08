/**
 * Recompute the Company Intelligence Score for every company with the real engine
 * (Bayesian shrinkage, recency decay, cohort-median quadrants, monthly snapshots).
 * Run: `npm run scores:recompute`. The worker also runs this weekly (docs/08).
 */
import { prisma } from '../db/prisma.js';
import { recomputeAllScores } from '../services/scoringService.js';

async function main() {
  console.log('Recomputing Company Intelligence Scores…');
  const { scored, cohorts } = await recomputeAllScores(new Date());
  console.log(`Done: scored ${scored} companies across ${cohorts} country×service cohorts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
