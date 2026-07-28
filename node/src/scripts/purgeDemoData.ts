/**
 * Idempotent cleanup so ONLY real data remains: curated companies, real Google ratings,
 * real trust facts, and first-party (native) reviews. Removes anything left over from
 * earlier demo/generated seeds. Safe to run on every deploy.
 */
import { prisma } from '../db/prisma.js';

async function main() {
  // 1) Generated + base-seed demo companies. Clear the non-cascading references first
  //    (query matches, raw scrape records, direct-query targets), then delete.
  const doomed = await prisma.company.findMany({ where: { source: { in: ['seed', 'generated-directory'] } }, select: { id: true } });
  const ids = doomed.map((c) => c.id);
  if (ids.length) {
    await prisma.queryMatch.deleteMany({ where: { companyId: { in: ids } } });
    await prisma.rawScrapeRecord.deleteMany({ where: { companyId: { in: ids } } });
    await prisma.query.updateMany({ where: { directCompanyId: { in: ids } }, data: { directCompanyId: null } });
  }
  const companies = await prisma.company.deleteMany({ where: { id: { in: ids } } });

  // 2) Imported (non first-party) client reviews — keep native (first-party) ones.
  const client = await prisma.customerReview.deleteMany({ where: { source: { not: 'native' } } });

  // 3) Sample employee reviews — keep native (first-party) ones.
  const employee = await prisma.employeeReview.deleteMany({ where: { source: { not: 'native' } } });

  // 4) All seeded employee-sentiment aggregates (fabricated Glassdoor-style numbers).
  const sentiment = await prisma.employeeSentiment.deleteMany({});

  // 5) Null out fabricated GitHub-activity numbers (keep real certs/funding/domain age/SSL).
  const trust = await prisma.trustSignal.updateMany({ data: { githubOrgActivity: null } });

  console.log(`[purge] companies=${companies.count} clientReviews=${client.count} employeeReviews=${employee.count} sentiment=${sentiment.count} githubNulled=${trust.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
