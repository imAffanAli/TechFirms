/**
 * Turnkey demo state so a non-technical visitor can log in and see a populated app.
 * Idempotent — safe to re-run. Run AFTER db:seed + pipeline:import + scores:recompute.
 *
 * Demo logins:
 *   Admin          admin@techfirms.local / admin12345
 *   Business owner owner@techfirms.local / demo1234   (owns Devsinc)
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';

const OWNER_EMAIL = 'owner@techfirms.local';
const OWNER_PASSWORD = 'demo1234';
const OWNED_SLUG = 'devsinc';

async function main() {
  // 1) Demo business owner
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { role: 'business_owner', passwordHash: bcrypt.hashSync(OWNER_PASSWORD, 10) },
    create: { email: OWNER_EMAIL, fullName: 'Demo Owner', role: 'business_owner', passwordHash: bcrypt.hashSync(OWNER_PASSWORD, 10) },
  });

  // 2) Give them a recognizable company to manage
  const owned = await prisma.company.findUnique({ where: { slug: OWNED_SLUG } });
  if (owned) {
    await prisma.company.update({ where: { id: owned.id }, data: { ownerId: owner.id, claimed: true, listingStatus: 'claimed' } });
  }

  // 3) A sample sponsored placement (so the "Sponsored" strip shows) + a Featured badge
  const sys = await prisma.company.findUnique({ where: { slug: 'systems-limited' } });
  const pk = await prisma.country.findUnique({ where: { slug: 'pakistan' } });
  if (sys && pk && !(await prisma.sponsorship.findFirst({ where: { companyId: sys.id, tier: 'sponsored' } }))) {
    await prisma.sponsorship.create({ data: { companyId: sys.id, tier: 'sponsored', countryId: pk.id, slotRank: 1, priceAmount: 800, startsAt: new Date(), active: true } });
  }
  const netsol = await prisma.company.findUnique({ where: { slug: 'netsol-technologies' } });
  if (netsol && !(await prisma.sponsorship.findFirst({ where: { companyId: netsol.id, tier: 'featured' } }))) {
    await prisma.sponsorship.create({ data: { companyId: netsol.id, tier: 'featured', startsAt: new Date(), active: true } });
  }

  // 4) Sample leads so the admin queue + owner dashboard aren't empty (idempotent by email)
  if (owned && !(await prisma.query.findFirst({ where: { contactEmail: 'bilal@fintechpk.example' } }))) {
    await prisma.query.create({ data: { projectType: 'Mobile banking app', description: 'We need a secure mobile banking app with biometric login for a Pakistani fintech startup.', contactName: 'Bilal Ahmed', contactEmail: 'bilal@fintechpk.example', budgetMin: 30000, budgetMax: 80000, budgetCurrency: 'USD', timeline: '4 months', directCompanyId: owned.id, status: 'New' } });
    const aiSvc = await prisma.service.findUnique({ where: { slug: 'ai-development' } });
    await prisma.query.create({ data: { projectType: 'AI customer-support assistant', description: 'Looking for a team to build an Arabic + English AI support assistant for our e-commerce platform.', contactName: 'Sara Al-Otaibi', contactEmail: 'sara@shopgulf.example', budgetMin: 25000, budgetMax: 60000, budgetCurrency: 'USD', timeline: '3 months', serviceCategory: aiSvc?.category ?? null, status: 'New' } });
  }

  console.log(`Demo setup complete. Owner: ${OWNER_EMAIL} / ${OWNER_PASSWORD} (owns ${OWNED_SLUG}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
