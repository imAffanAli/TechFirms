/**
 * Seed the reference taxonomy (10 services, the launch countries + cities) and the admin
 * user. Idempotent — safe to re-run (`npm run db:seed`).
 *
 * NO demo companies or reviews live here. Companies are imported separately
 * (`npm run pipeline:import`) from real, curated data.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient, type ServiceCategory } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@techfirms.local';
const ADMIN_PASSWORD = 'admin12345';

const SERVICES: { slug: string; name: string; category: ServiceCategory }[] = [
  { slug: 'ai-development', name: 'AI Development', category: 'ai_development' },
  { slug: 'custom-software', name: 'Custom Software Development', category: 'custom_software' },
  { slug: 'web-development', name: 'Web Development', category: 'web_development' },
  { slug: 'mobile-app-development', name: 'Mobile App Development', category: 'mobile_app_development' },
  { slug: 'cloud', name: 'Cloud', category: 'cloud' },
  { slug: 'devops', name: 'DevOps', category: 'devops' },
  { slug: 'data-engineering', name: 'Data Engineering', category: 'data_engineering' },
  { slug: 'cybersecurity', name: 'Cybersecurity', category: 'cybersecurity' },
  { slug: 'it-staff-augmentation', name: 'IT Staff Augmentation', category: 'it_staff_augmentation' },
  { slug: 'ui-ux-design', name: 'UI/UX Design', category: 'ui_ux_design' },
];

// Only countries where we have real, curated companies.
const COUNTRIES: { slug: string; name: string; isoCode: string; currency: string; priceMultiplier: number; cities: { slug: string; name: string }[] }[] = [
  { slug: 'saudi-arabia', name: 'Saudi Arabia', isoCode: 'SA', currency: 'SAR', priceMultiplier: 1.4, cities: [{ slug: 'riyadh', name: 'Riyadh' }, { slug: 'jeddah', name: 'Jeddah' }, { slug: 'dammam', name: 'Dammam' }, { slug: 'khobar', name: 'Khobar' }] },
  { slug: 'pakistan', name: 'Pakistan', isoCode: 'PK', currency: 'PKR', priceMultiplier: 0.45, cities: [{ slug: 'karachi', name: 'Karachi' }, { slug: 'lahore', name: 'Lahore' }, { slug: 'islamabad', name: 'Islamabad' }] },
];

async function main() {
  console.log('Seeding admin user…');
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'super_admin', passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10) },
    create: { email: ADMIN_EMAIL, fullName: 'TechFirms Admin', role: 'super_admin', passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10) },
  });
  console.log(`  ✓ admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  console.log('Seeding services…');
  for (const s of SERVICES) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: { name: s.name }, create: s });
  }

  console.log('Seeding countries & cities…');
  for (const co of COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { slug: co.slug },
      update: { name: co.name, isoCode: co.isoCode, currency: co.currency, priceMultiplier: co.priceMultiplier },
      create: { slug: co.slug, name: co.name, isoCode: co.isoCode, currency: co.currency, priceMultiplier: co.priceMultiplier },
    });
    for (const city of co.cities) {
      await prisma.city.upsert({
        where: { countryId_slug: { countryId: country.id, slug: city.slug } },
        update: { name: city.name },
        create: { slug: city.slug, name: city.name, countryId: country.id },
      });
    }
  }

  console.log('Seed complete (base taxonomy + admin). Companies come from pipeline:import.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
