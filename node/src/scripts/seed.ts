/**
 * Seed: reference taxonomy (10 services, 3 launch countries + cities) and ~8 demo
 * companies with reviews, trust signals, employee sentiment, and a computed
 * Company Intelligence Score. Idempotent — safe to re-run (`npm run db:seed`).
 *
 * NOTE: the CIS here is a simplified stand-in so the UI shows real numbers.
 * The real deterministic engine lands in M6 (docs/08-scoring-and-leaderboards.md).
 */
import bcrypt from 'bcryptjs';
import { PrismaClient, type ServiceCategory, type Quadrant } from '@prisma/client';
import { toCurrency } from '../services/fx.js';
import { genEmployeeReviews } from '../services/content.js';

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

const COUNTRIES: { slug: string; name: string; isoCode: string; currency: string; priceMultiplier: number; cities: { slug: string; name: string }[] }[] = [
  { slug: 'saudi-arabia', name: 'Saudi Arabia', isoCode: 'SA', currency: 'SAR', priceMultiplier: 1.4, cities: [{ slug: 'riyadh', name: 'Riyadh' }, { slug: 'jeddah', name: 'Jeddah' }] },
  { slug: 'united-arab-emirates', name: 'United Arab Emirates', isoCode: 'AE', currency: 'AED', priceMultiplier: 1.4, cities: [{ slug: 'dubai', name: 'Dubai' }, { slug: 'abu-dhabi', name: 'Abu Dhabi' }] },
  { slug: 'pakistan', name: 'Pakistan', isoCode: 'PK', currency: 'PKR', priceMultiplier: 0.45, cities: [{ slug: 'karachi', name: 'Karachi' }, { slug: 'lahore', name: 'Lahore' }] },
];

type Rev = { name: string; title: string; company: string; overall: number; quality: number; schedule: number; cost: number; refer: number; budget: number; months: number; body: string; verified: boolean };
type Demo = {
  slug: string; name: string; tagline: string; description: string; website: string; domain: string;
  foundedYear: number; empMin: number; empMax: number; rateMin: number; rateMax: number; minProject: number;
  status: 'unclaimed' | 'claimed' | 'verified'; country: string; city: string;
  services: { slug: string; focus: number }[];
  trust: { domainAgeYears: number; ssl: boolean; github: number; certs: string[]; funding: number };
  sentiment: { overall: number; culture: number; comp: number; wlb: number; leadership: number; recommendPct: number; reviewCount: number };
  reviews: Rev[];
};

const r = (name: string, title: string, company: string, overall: number, body: string, verified = true): Rev => ({
  name, title, company, overall, quality: overall, schedule: Math.max(3, overall - 0.3), cost: Math.max(3, overall - 0.2), refer: overall,
  budget: 50000, months: 6, body, verified,
});

const COMPANIES: Demo[] = [
  {
    slug: 'falcon-ai-labs', name: 'Falcon AI Labs', tagline: 'Applied AI & data platforms for the Gulf', description: 'Falcon AI Labs builds production machine-learning systems and data platforms for enterprises across the GCC, with a focus on Arabic NLP, computer vision, and MLOps.', website: 'https://falconailabs.com', domain: 'falconailabs.com', foundedYear: 2018, empMin: 50, empMax: 100, rateMin: 60, rateMax: 120, minProject: 25000, status: 'verified', country: 'saudi-arabia', city: 'riyadh',
    services: [{ slug: 'ai-development', focus: 60 }, { slug: 'data-engineering', focus: 40 }],
    trust: { domainAgeYears: 7.2, ssl: true, github: 640, certs: ['ISO 27001', 'SOC 2'], funding: 8000000 },
    sentiment: { overall: 4.4, culture: 4.5, comp: 4.1, wlb: 4.2, leadership: 4.3, recommendPct: 88, reviewCount: 64 },
    reviews: [r('Sara Al-Otaibi', 'VP Engineering', 'Tamkeen Retail', 4.9, 'Falcon delivered our Arabic NLP pipeline ahead of schedule and the quality was exceptional.'), r('Omar Nasser', 'CTO', 'GulfPay', 4.7, 'Strong MLOps practices and clear communication throughout a complex 8-month build.'), r('Lena Haddad', 'Head of Data', 'Noor Health', 4.8, 'Rebuilt our data warehouse and cut reporting latency dramatically.'), r('Yousef Amir', 'Product Lead', 'Saned', 4.6, 'Reliable, senior team. Would hire again.'), r('Dana Kurdi', 'COO', 'Mawarid', 4.9, 'Best AI vendor we have worked with in the region.')],
  },
  {
    slug: 'nimbusstack', name: 'NimbusStack', tagline: 'Cloud & DevOps engineering', description: 'NimbusStack helps organizations migrate to the cloud and modernize delivery pipelines with Kubernetes, IaC, and 24/7 SRE support.', website: 'https://nimbusstack.com', domain: 'nimbusstack.com', foundedYear: 2016, empMin: 100, empMax: 250, rateMin: 45, rateMax: 90, minProject: 20000, status: 'claimed', country: 'saudi-arabia', city: 'riyadh',
    services: [{ slug: 'cloud', focus: 55 }, { slug: 'devops', focus: 45 }],
    trust: { domainAgeYears: 9.1, ssl: true, github: 410, certs: ['ISO 27001'], funding: 3000000 },
    sentiment: { overall: 4.1, culture: 4.0, comp: 4.2, wlb: 3.8, leadership: 4.0, recommendPct: 79, reviewCount: 51 },
    reviews: [r('Faisal Reda', 'Director IT', 'Alinma', 4.5, 'Smooth AWS migration with zero downtime.'), r('Huda Salem', 'Eng Manager', 'Jahez', 4.3, 'Solid Kubernetes expertise and good documentation.'), r('Tariq Aziz', 'CTO', 'Rasan', 4.4, 'Their SRE on-call saved us during a launch spike.'), r('Maya Farouk', 'VP Ops', 'Lean', 4.2, 'Dependable partner for infra work.')],
  },
  {
    slug: 'sadeem-software', name: 'Sadeem Software', tagline: 'Custom software & web platforms', description: 'Sadeem Software designs and builds bespoke web platforms and internal tools for mid-market and enterprise clients in Saudi Arabia.', website: 'https://sadeemsoftware.com', domain: 'sadeemsoftware.com', foundedYear: 2019, empMin: 20, empMax: 50, rateMin: 35, rateMax: 70, minProject: 10000, status: 'unclaimed', country: 'saudi-arabia', city: 'jeddah',
    services: [{ slug: 'custom-software', focus: 60 }, { slug: 'web-development', focus: 40 }],
    trust: { domainAgeYears: 5.4, ssl: true, github: 120, certs: [], funding: 0 },
    sentiment: { overall: 3.9, culture: 3.9, comp: 3.7, wlb: 4.0, leadership: 3.8, recommendPct: 72, reviewCount: 22 },
    reviews: [r('Nabil Q.', 'Owner', 'Souq Plus', 4.2, 'Built our marketplace MVP on time and budget.'), r('Rana K.', 'Marketing Dir', 'Batu', 4.0, 'Good web team, responsive to changes.'), r('Sami D.', 'Founder', 'Wared', 3.8, 'Decent work, some delays mid-project.', false)],
  },
  {
    slug: 'zayed-digital', name: 'Zayed Digital', tagline: 'Web & product design studio', description: 'Zayed Digital is a Dubai product studio crafting high-conversion web experiences and design systems for regional brands.', website: 'https://zayeddigital.com', domain: 'zayeddigital.com', foundedYear: 2015, empMin: 50, empMax: 100, rateMin: 55, rateMax: 110, minProject: 15000, status: 'verified', country: 'united-arab-emirates', city: 'dubai',
    services: [{ slug: 'web-development', focus: 55 }, { slug: 'ui-ux-design', focus: 45 }],
    trust: { domainAgeYears: 10.2, ssl: true, github: 210, certs: ['ISO 9001'], funding: 1500000 },
    sentiment: { overall: 4.5, culture: 4.6, comp: 4.2, wlb: 4.4, leadership: 4.5, recommendPct: 90, reviewCount: 73 },
    reviews: [r('Aisha Mansoori', 'CMO', 'Majid Group', 4.9, 'Beautiful design work that lifted conversion by 30%.'), r('Khalid R.', 'Head of Product', 'Careem-adjacent', 4.7, 'Strong design systems and front-end craft.'), r('Priya N.', 'Founder', 'Souqly', 4.8, 'A true product partner, not just an agency.'), r('Hassan T.', 'VP Growth', 'Yalla', 4.6, 'Great UX research and delivery.'), r('Mona F.', 'CEO', 'Bloom', 4.7, 'Highly recommended for brand and web.')],
  },
  {
    slug: 'oryx-mobile', name: 'Oryx Mobile', tagline: 'Native & cross-platform apps', description: 'Oryx Mobile ships iOS, Android, and Flutter apps for startups and enterprises, from prototype to App Store.', website: 'https://oryxmobile.com', domain: 'oryxmobile.com', foundedYear: 2017, empMin: 20, empMax: 50, rateMin: 40, rateMax: 85, minProject: 12000, status: 'claimed', country: 'united-arab-emirates', city: 'dubai',
    services: [{ slug: 'mobile-app-development', focus: 100 }],
    trust: { domainAgeYears: 8.0, ssl: true, github: 300, certs: [], funding: 500000 },
    sentiment: { overall: 4.0, culture: 4.1, comp: 3.9, wlb: 3.9, leadership: 4.0, recommendPct: 76, reviewCount: 34 },
    reviews: [r('Bilal H.', 'CPO', 'FitGulf', 4.4, 'Delivered a polished fitness app with great performance.'), r('Noura S.', 'Founder', 'Dari', 4.2, 'Smooth Flutter build and helpful post-launch support.'), r('Adeel M.', 'CTO', 'PayNow ME', 4.1, 'Reliable mobile team.')],
  },
  {
    slug: 'deepgulf-ai', name: 'DeepGulf AI', tagline: 'AI & security engineering', description: 'DeepGulf AI combines applied AI with security engineering, delivering fraud-detection and threat-intelligence systems for finance and government.', website: 'https://deepgulf.com', domain: 'deepgulf.com', foundedYear: 2020, empMin: 20, empMax: 50, rateMin: 65, rateMax: 130, minProject: 30000, status: 'verified', country: 'united-arab-emirates', city: 'abu-dhabi',
    services: [{ slug: 'ai-development', focus: 55 }, { slug: 'cybersecurity', focus: 45 }],
    trust: { domainAgeYears: 4.6, ssl: true, github: 520, certs: ['SOC 2', 'ISO 27001'], funding: 12000000 },
    sentiment: { overall: 4.6, culture: 4.6, comp: 4.5, wlb: 4.3, leadership: 4.6, recommendPct: 92, reviewCount: 48 },
    reviews: [r('Reem A.', 'CISO', 'First Abu Dhabi-adjacent', 4.9, 'Their fraud models measurably reduced chargebacks.'), r('Sultan K.', 'Head of Risk', 'GovTech', 4.8, 'Top-tier security and AI talent.'), r('Layla M.', 'VP Data', 'Etisalat-adjacent', 4.7, 'Rigorous, thoughtful engineering.'), r('Omar B.', 'CTO', 'Tabby-adjacent', 4.6, 'Excellent applied AI partner.'), r('Zaid H.', 'Director', 'ADGM co', 4.8, 'Delivered a complex system flawlessly.')],
  },
  {
    slug: 'indus-systems', name: 'Indus Systems', tagline: 'Enterprise software & staff augmentation', description: 'Indus Systems provides custom enterprise software and dedicated engineering teams to clients across the Middle East and North America from Karachi.', website: 'https://indussystems.com', domain: 'indussystems.com', foundedYear: 2012, empMin: 250, empMax: 500, rateMin: 25, rateMax: 55, minProject: 15000, status: 'verified', country: 'pakistan', city: 'karachi',
    services: [{ slug: 'custom-software', focus: 55 }, { slug: 'it-staff-augmentation', focus: 45 }],
    trust: { domainAgeYears: 12.5, ssl: true, github: 380, certs: ['ISO 27001', 'CMMI Level 3'], funding: 0 },
    sentiment: { overall: 4.0, culture: 4.0, comp: 3.8, wlb: 3.9, leadership: 3.9, recommendPct: 74, reviewCount: 96 },
    reviews: [r('James P.', 'VP Eng', 'US Fintech', 4.4, 'Great value dedicated team, strong communication across time zones.'), r('Ahmed S.', 'CTO', 'Gulf Logistics', 4.3, 'Delivered a large ERP integration reliably.'), r('Emily R.', 'Director', 'HealthCo', 4.2, 'Solid engineers, easy to scale the team up.'), r('Bilal N.', 'Founder', 'EdTechPK', 4.1, 'Good long-term partner.'), r('Sana T.', 'PM', 'RetailME', 4.0, 'Dependable delivery.', false)],
  },
  {
    slug: 'lahore-labs', name: 'Lahore Labs', tagline: 'Web, mobile & AI product teams', description: 'Lahore Labs is a fast-growing product studio building web, mobile, and AI-powered features for startups in Pakistan, the GCC, and Europe.', website: 'https://lahorelabs.com', domain: 'lahorelabs.com', foundedYear: 2019, empMin: 50, empMax: 100, rateMin: 22, rateMax: 50, minProject: 8000, status: 'claimed', country: 'pakistan', city: 'lahore',
    services: [{ slug: 'web-development', focus: 40 }, { slug: 'mobile-app-development', focus: 35 }, { slug: 'ai-development', focus: 25 }],
    trust: { domainAgeYears: 5.9, ssl: true, github: 260, certs: [], funding: 750000 },
    sentiment: { overall: 4.2, culture: 4.3, comp: 3.9, wlb: 4.1, leadership: 4.2, recommendPct: 81, reviewCount: 41 },
    reviews: [r('Daniyal R.', 'Founder', 'ShopEasy', 4.5, 'Shipped our web + mobile MVP in 10 weeks.'), r('Hina A.', 'CEO', 'CareConnect', 4.3, 'Great velocity and a genuinely helpful team.'), r('Marco L.', 'CTO', 'EU SaaS', 4.4, 'Strong React and AI feature work at a great rate.'), r('Usman K.', 'PM', 'FoodPandaPK-adjacent', 4.1, 'Reliable delivery and communication.')],
  },
];

function computeScore(c: Demo) {
  const overalls = c.reviews.map((x) => x.overall);
  const reviewsAvg = overalls.reduce((a, b) => a + b, 0) / overalls.length; // 0–5
  const reviewsScore = Math.round((reviewsAvg / 5) * 100);
  const sentimentScore = Math.round((c.sentiment.overall / 5) * 100);
  const trustScore = Math.min(
    100,
    Math.round(c.trust.domainAgeYears * 4 + (c.trust.ssl ? 15 : 0) + c.trust.certs.length * 8 + (c.trust.funding > 0 ? 20 : 0) + Math.min(20, c.trust.github / 40)),
  );
  const reviewCount = c.reviews.length;
  const marketScore = Math.min(100, Math.round(reviewCount * 7 + c.sentiment.reviewCount * 0.4));
  const cis = Math.round(0.4 * reviewsScore + 0.25 * sentimentScore + 0.2 * trustScore + 0.15 * marketScore);
  const marketPresence = Math.min(100, Math.round(reviewCount * 6 + trustScore * 0.4 + c.sentiment.reviewCount * 0.3));
  const clientSatisfaction = reviewsScore;
  const verifiedCount = c.reviews.filter((x) => x.verified).length;
  const rated = verifiedCount >= 3;
  const quadrant: Quadrant = marketPresence >= 50
    ? clientSatisfaction >= 88 ? 'Leaders' : 'Challengers'
    : clientSatisfaction >= 88 ? 'Rising_Stars' : 'Niche_Players';
  return { cis, reviewsScore, sentimentScore, trustScore, marketScore, marketPresence, clientSatisfaction, tier: rated ? ('Rated' as const) : ('Unrated' as const), quadrant };
}

async function main() {
  console.log('Seeding admin user…');
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'super_admin', passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10) },
    create: { email: ADMIN_EMAIL, fullName: 'TechFirms Admin', role: 'super_admin', passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10) },
  });
  console.log(`  ✓ admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  console.log('Seeding services…');
  const serviceIdBySlug = new Map<string, string>();
  for (const s of SERVICES) {
    const rec = await prisma.service.upsert({ where: { slug: s.slug }, update: { name: s.name }, create: s });
    serviceIdBySlug.set(s.slug, rec.id);
  }

  console.log('Seeding countries & cities…');
  const countryIdBySlug = new Map<string, string>();
  const countryCurrencyBySlug = new Map<string, string>();
  const cityIdByKey = new Map<string, string>();
  for (const co of COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { slug: co.slug },
      update: { name: co.name, isoCode: co.isoCode, currency: co.currency, priceMultiplier: co.priceMultiplier },
      create: { slug: co.slug, name: co.name, isoCode: co.isoCode, currency: co.currency, priceMultiplier: co.priceMultiplier },
    });
    countryIdBySlug.set(co.slug, country.id);
    countryCurrencyBySlug.set(co.slug, co.currency);
    for (const city of co.cities) {
      const rec = await prisma.city.upsert({
        where: { countryId_slug: { countryId: country.id, slug: city.slug } },
        update: { name: city.name },
        create: { slug: city.slug, name: city.name, countryId: country.id },
      });
      cityIdByKey.set(`${co.slug}/${city.slug}`, rec.id);
    }
  }

  console.log('Seeding companies…');
  for (const c of COMPANIES) {
    const hqCountryId = countryIdBySlug.get(c.country)!;
    const hqCityId = cityIdByKey.get(`${c.country}/${c.city}`)!;
    const cur = countryCurrencyBySlug.get(c.country)!;
    const rateMin = toCurrency(c.rateMin, cur);
    const rateMax = toCurrency(c.rateMax, cur);
    const minProj = toCurrency(c.minProject, cur);
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name, tagline: c.tagline, description: c.description, website: c.website, domain: c.domain,
        foundedYear: c.foundedYear, employeeRangeMin: c.empMin, employeeRangeMax: c.empMax,
        hourlyRateMin: rateMin, hourlyRateMax: rateMax, rateCurrency: cur, minProjectSize: minProj,
        listingStatus: c.status, claimed: c.status !== 'unclaimed', verified: c.status === 'verified',
        hqCountryId, hqCityId, source: 'seed', sourceId: c.slug,
      },
      create: {
        slug: c.slug, name: c.name, tagline: c.tagline, description: c.description, website: c.website, domain: c.domain,
        foundedYear: c.foundedYear, employeeRangeMin: c.empMin, employeeRangeMax: c.empMax,
        hourlyRateMin: rateMin, hourlyRateMax: rateMax, rateCurrency: cur, minProjectSize: minProj,
        listingStatus: c.status, claimed: c.status !== 'unclaimed', verified: c.status === 'verified',
        hqCountryId, hqCityId, source: 'seed', sourceId: c.slug,
      },
    });

    // Reset child records for idempotency
    await prisma.companyService.deleteMany({ where: { companyId: company.id } });
    await prisma.customerReview.deleteMany({ where: { companyId: company.id } });
    await prisma.trustSignal.deleteMany({ where: { companyId: company.id } });
    await prisma.employeeSentiment.deleteMany({ where: { companyId: company.id } });
    await prisma.employeeReview.deleteMany({ where: { companyId: company.id } });
    await prisma.intelligenceScore.deleteMany({ where: { companyId: company.id } });
    await prisma.officeLocation.deleteMany({ where: { companyId: company.id } });

    for (const svc of c.services) {
      await prisma.companyService.create({ data: { companyId: company.id, serviceId: serviceIdBySlug.get(svc.slug)!, focusPct: svc.focus } });
    }
    await prisma.officeLocation.create({ data: { companyId: company.id, countryId: hqCountryId, cityId: hqCityId, isHeadquarters: true } });

    for (const rv of c.reviews) {
      await prisma.customerReview.create({
        data: {
          companyId: company.id, reviewerName: rv.name, reviewerTitle: rv.title, reviewerCompany: rv.company,
          projectBudget: rv.budget, projectDurationMonths: rv.months,
          ratingQuality: Math.round(rv.quality * 100), ratingSchedule: Math.round(rv.schedule * 100),
          ratingCost: Math.round(rv.cost * 100), ratingWillingToRefer: Math.round(rv.refer * 100),
          ratingOverall: Math.round(rv.overall * 100), body: rv.body, source: 'native', verified: rv.verified,
        },
      });
    }

    await prisma.trustSignal.create({
      data: {
        companyId: company.id, domainAgeYears: c.trust.domainAgeYears, sslValid: c.trust.ssl,
        githubOrgActivity: c.trust.github, certifications: c.trust.certs, fundingRaised: c.trust.funding,
      },
    });

    await prisma.employeeSentiment.create({
      data: {
        companyId: company.id, overallRating: c.sentiment.overall, culture: c.sentiment.culture, compensation: c.sentiment.comp,
        workLifeBalance: c.sentiment.wlb, leadership: c.sentiment.leadership, recommendPct: c.sentiment.recommendPct,
        reviewCount: c.sentiment.reviewCount, sourceName: 'glassdoor', sourceUrl: `https://www.glassdoor.com/${c.slug}`, asOf: new Date('2026-06-01'),
      },
    });

    const empQuality = Math.max(0, Math.min(1, (c.sentiment.overall - 3.5) / 1.5));
    for (const er of genEmployeeReviews(4, empQuality, Math.random)) {
      await prisma.employeeReview.create({ data: { companyId: company.id, rating: Math.round(er.rating * 100), title: er.title, pros: er.pros, cons: er.cons, role: er.role, isCurrentEmployee: er.current, source: 'sample', sourceUrl: `https://www.glassdoor.com/${c.slug}` } });
    }

    const s = computeScore(c);
    await prisma.intelligenceScore.create({
      data: {
        companyId: company.id, cis: s.cis, reviewsScore: s.reviewsScore, sentimentScore: s.sentimentScore,
        trustScore: s.trustScore, marketScore: s.marketScore, marketPresence: s.marketPresence,
        clientSatisfaction: s.clientSatisfaction, quadrant: s.quadrant, tier: s.tier,
        justification: `${c.name} ranks in the ${s.quadrant.replace('_', ' ')} quadrant with a Company Intelligence Score of ${s.cis}/100, driven by ${c.reviews.length} customer reviews averaging ${(c.reviews.reduce((a, b) => a + b.overall, 0) / c.reviews.length).toFixed(1)}/5 and strong trust signals. Employee sentiment sits at ${c.sentiment.overall}/5 across ${c.sentiment.reviewCount} reviews. This is a demo score pending the full scoring engine.`,
      },
    });
    console.log(`  ✓ ${c.name} — CIS ${s.cis} (${s.quadrant})`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
