/**
 * Ensure the sponsorship plan catalog exists and expire any sponsorships whose term has ended.
 * Idempotent — runs in the deploy seed (and can be run manually: `npm run sponsorship:sync`).
 */
import { prisma } from '../db/prisma.js';
import { ensurePlans, expireSponsorships } from '../services/sponsorshipOrderService.js';

async function main() {
  await ensurePlans();
  const expired = await expireSponsorships();
  console.log(`[sponsorship] plans ensured; ${expired} sponsorship(s) expired.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
