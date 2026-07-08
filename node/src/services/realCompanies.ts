import type { RawCompany } from './pipeline.js';
import { kebab } from './pipeline.js';
import { genClientReviews, genEmployeeReviews } from './content.js';

/**
 * Curated real, notable technology companies in Pakistan and Saudi Arabia.
 * FACTUAL fields (name, HQ, founding year, website, services, approx. size) are real/public;
 * reviews, employee sentiment, and the CIS are DEMO content generated like the rest of the
 * seed data — they are NOT real ratings of these companies. For a real launch these must come
 * from verified first-party reviews (see docs/08 + docs/02).
 */
interface RealSpec {
  name: string;
  city: string;
  founded: number;
  emp: [number, number];
  services: { slug: string; focus: number }[];
  domain: string;
  rate: [number, number]; // USD
  minProject: number; // USD
  certs: string[];
  funding: number; // USD
  quality: number; // 0..1
}

const PK: RealSpec[] = [
  { name: 'Systems Limited', city: 'lahore', founded: 1977, emp: [8000, 9000], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'cloud', focus: 30 }, { slug: 'data-engineering', focus: 30 }], domain: 'systemsltd.com', rate: [30, 70], minProject: 25000, certs: ['ISO 27001', 'CMMI Level 5'], funding: 0, quality: 0.9 },
  { name: 'NETSOL Technologies', city: 'lahore', founded: 1997, emp: [1200, 1500], services: [{ slug: 'custom-software', focus: 50 }, { slug: 'ai-development', focus: 30 }, { slug: 'it-staff-augmentation', focus: 20 }], domain: 'netsoltech.com', rate: [28, 65], minProject: 25000, certs: ['ISO 27001', 'ISO 9001'], funding: 0, quality: 0.85 },
  { name: 'Devsinc', city: 'lahore', founded: 2010, emp: [2000, 2500], services: [{ slug: 'web-development', focus: 35 }, { slug: 'custom-software', focus: 35 }, { slug: 'mobile-app-development', focus: 30 }], domain: 'devsinc.com', rate: [22, 55], minProject: 10000, certs: [], funding: 0, quality: 0.82 },
  { name: '10Pearls', city: 'karachi', founded: 2004, emp: [1200, 1500], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'ai-development', focus: 30 }, { slug: 'ui-ux-design', focus: 30 }], domain: '10pearls.com', rate: [30, 70], minProject: 20000, certs: ['ISO 27001'], funding: 0, quality: 0.85 },
  { name: 'Arbisoft', city: 'lahore', founded: 2007, emp: [900, 1100], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'data-engineering', focus: 30 }, { slug: 'web-development', focus: 30 }], domain: 'arbisoft.com', rate: [28, 60], minProject: 15000, certs: [], funding: 0, quality: 0.83 },
  { name: 'Contour Software', city: 'karachi', founded: 2011, emp: [1800, 2200], services: [{ slug: 'custom-software', focus: 50 }, { slug: 'it-staff-augmentation', focus: 50 }], domain: 'contour-software.com', rate: [25, 55], minProject: 20000, certs: ['ISO 27001'], funding: 0, quality: 0.8 },
  { name: 'CodeNinja', city: 'lahore', founded: 2016, emp: [400, 600], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'web-development', focus: 30 }, { slug: 'mobile-app-development', focus: 30 }], domain: 'codeninja.com', rate: [22, 50], minProject: 10000, certs: [], funding: 0, quality: 0.78 },
  { name: 'Folio3', city: 'karachi', founded: 2005, emp: [800, 1000], services: [{ slug: 'custom-software', focus: 35 }, { slug: 'ai-development', focus: 30 }, { slug: 'mobile-app-development', focus: 35 }], domain: 'folio3.com', rate: [25, 60], minProject: 15000, certs: ['ISO 27001'], funding: 0, quality: 0.8 },
  { name: 'VentureDive', city: 'karachi', founded: 2012, emp: [600, 800], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'ai-development', focus: 30 }, { slug: 'data-engineering', focus: 30 }], domain: 'venturedive.com', rate: [28, 60], minProject: 20000, certs: [], funding: 0, quality: 0.8 },
  { name: 'i2c Inc', city: 'lahore', founded: 2001, emp: [1400, 1600], services: [{ slug: 'custom-software', focus: 50 }, { slug: 'cybersecurity', focus: 30 }, { slug: 'cloud', focus: 20 }], domain: 'i2cinc.com', rate: [35, 75], minProject: 30000, certs: ['SOC 2', 'ISO 27001', 'PCI DSS'], funding: 0, quality: 0.82 },
  { name: 'Techlogix', city: 'lahore', founded: 1996, emp: [700, 900], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'it-staff-augmentation', focus: 30 }, { slug: 'data-engineering', focus: 30 }], domain: 'techlogix.com', rate: [26, 58], minProject: 15000, certs: ['ISO 27001', 'CMMI Level 3'], funding: 0, quality: 0.78 },
  { name: 'Confiz', city: 'lahore', founded: 2005, emp: [1000, 1300], services: [{ slug: 'custom-software', focus: 35 }, { slug: 'cloud', focus: 35 }, { slug: 'data-engineering', focus: 30 }], domain: 'confiz.com', rate: [28, 62], minProject: 18000, certs: ['ISO 27001'], funding: 0, quality: 0.8 },
  { name: 'Cubix', city: 'karachi', founded: 2008, emp: [350, 450], services: [{ slug: 'mobile-app-development', focus: 50 }, { slug: 'web-development', focus: 30 }, { slug: 'ui-ux-design', focus: 20 }], domain: 'cubix.co', rate: [24, 52], minProject: 10000, certs: [], funding: 0, quality: 0.76 },
  { name: 'Emumba', city: 'islamabad', founded: 2009, emp: [250, 350], services: [{ slug: 'custom-software', focus: 35 }, { slug: 'cloud', focus: 35 }, { slug: 'devops', focus: 30 }], domain: 'emumba.com', rate: [30, 65], minProject: 20000, certs: [], funding: 0, quality: 0.79 },
  { name: 'NorthBay Solutions', city: 'lahore', founded: 2013, emp: [500, 700], services: [{ slug: 'cloud', focus: 35 }, { slug: 'data-engineering', focus: 35 }, { slug: 'ai-development', focus: 30 }], domain: 'northbaysolutions.net', rate: [32, 70], minProject: 25000, certs: ['ISO 27001'], funding: 0, quality: 0.81 },
  { name: 'Tkxel', city: 'lahore', founded: 2008, emp: [600, 800], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'web-development', focus: 30 }, { slug: 'devops', focus: 30 }], domain: 'tkxel.com', rate: [26, 56], minProject: 15000, certs: [], funding: 0, quality: 0.78 },
  { name: 'Xavor', city: 'lahore', founded: 1995, emp: [700, 900], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'it-staff-augmentation', focus: 30 }, { slug: 'cloud', focus: 30 }], domain: 'xavor.com', rate: [28, 60], minProject: 18000, certs: ['ISO 27001', 'ISO 13485'], funding: 0, quality: 0.78 },
  { name: 'Programmers Force', city: 'lahore', founded: 2014, emp: [1200, 1600], services: [{ slug: 'ai-development', focus: 40 }, { slug: 'custom-software', focus: 40 }, { slug: 'data-engineering', focus: 20 }], domain: 'programmersforce.com', rate: [24, 55], minProject: 15000, certs: [], funding: 0, quality: 0.79 },
];

const KSA: RealSpec[] = [
  { name: 'Elm', city: 'riyadh', founded: 2003, emp: [4500, 5500], services: [{ slug: 'custom-software', focus: 35 }, { slug: 'cybersecurity', focus: 30 }, { slug: 'cloud', focus: 35 }], domain: 'elm.sa', rate: [55, 120], minProject: 40000, certs: ['ISO 27001', 'SOC 2'], funding: 0, quality: 0.9 },
  { name: 'Solutions by stc', city: 'riyadh', founded: 2008, emp: [3500, 4500], services: [{ slug: 'cloud', focus: 40 }, { slug: 'custom-software', focus: 30 }, { slug: 'cybersecurity', focus: 30 }], domain: 'solutions.com.sa', rate: [55, 120], minProject: 40000, certs: ['ISO 27001'], funding: 0, quality: 0.88 },
  { name: 'Saudi Information Technology Company (SITE)', city: 'riyadh', founded: 2017, emp: [1200, 1600], services: [{ slug: 'cybersecurity', focus: 50 }, { slug: 'custom-software', focus: 30 }, { slug: 'cloud', focus: 20 }], domain: 'site.sa', rate: [60, 130], minProject: 45000, certs: ['ISO 27001', 'SOC 2'], funding: 0, quality: 0.86 },
  { name: 'Lean Business Services', city: 'riyadh', founded: 2019, emp: [700, 900], services: [{ slug: 'data-engineering', focus: 35 }, { slug: 'cloud', focus: 30 }, { slug: 'ai-development', focus: 35 }], domain: 'lean.sa', rate: [60, 130], minProject: 40000, certs: ['ISO 27001'], funding: 0, quality: 0.85 },
  { name: 'Innovative Solutions', city: 'khobar', founded: 2004, emp: [500, 700], services: [{ slug: 'cybersecurity', focus: 50 }, { slug: 'cloud', focus: 30 }, { slug: 'custom-software', focus: 20 }], domain: 'is.sa', rate: [55, 115], minProject: 35000, certs: ['ISO 27001', 'SOC 2'], funding: 0, quality: 0.83 },
  { name: 'Mozn', city: 'riyadh', founded: 2017, emp: [250, 350], services: [{ slug: 'ai-development', focus: 60 }, { slug: 'data-engineering', focus: 40 }], domain: 'mozn.sa', rate: [65, 140], minProject: 40000, certs: ['ISO 27001'], funding: 12000000, quality: 0.85 },
  { name: 'Lucidya', city: 'riyadh', founded: 2016, emp: [120, 180], services: [{ slug: 'ai-development', focus: 100 }], domain: 'lucidya.com', rate: [50, 110], minProject: 25000, certs: [], funding: 8000000, quality: 0.82 },
  { name: 'Quant', city: 'riyadh', founded: 2019, emp: [80, 120], services: [{ slug: 'ai-development', focus: 100 }], domain: 'quant.sa', rate: [55, 120], minProject: 30000, certs: [], funding: 5000000, quality: 0.8 },
  { name: 'Baianat', city: 'dammam', founded: 2013, emp: [150, 250], services: [{ slug: 'ui-ux-design', focus: 40 }, { slug: 'web-development', focus: 30 }, { slug: 'ai-development', focus: 30 }], domain: 'baianat.com', rate: [40, 90], minProject: 15000, certs: [], funding: 0, quality: 0.78 },
  { name: 'Salla', city: 'jeddah', founded: 2016, emp: [500, 700], services: [{ slug: 'custom-software', focus: 100 }], domain: 'salla.sa', rate: [45, 100], minProject: 20000, certs: [], funding: 130000000, quality: 0.83 },
  { name: 'Zid', city: 'riyadh', founded: 2017, emp: [350, 450], services: [{ slug: 'custom-software', focus: 100 }], domain: 'zid.sa', rate: [45, 100], minProject: 20000, certs: [], funding: 40000000, quality: 0.82 },
  { name: 'Foodics', city: 'riyadh', founded: 2014, emp: [600, 800], services: [{ slug: 'custom-software', focus: 70 }, { slug: 'cloud', focus: 30 }], domain: 'foodics.com', rate: [50, 110], minProject: 25000, certs: ['ISO 27001'], funding: 200000000, quality: 0.84 },
  { name: 'Unifonic', city: 'riyadh', founded: 2006, emp: [400, 600], services: [{ slug: 'cloud', focus: 50 }, { slug: 'custom-software', focus: 50 }], domain: 'unifonic.com', rate: [50, 110], minProject: 25000, certs: ['ISO 27001', 'SOC 2'], funding: 125000000, quality: 0.83 },
  { name: 'Geidea', city: 'riyadh', founded: 2008, emp: [900, 1200], services: [{ slug: 'custom-software', focus: 60 }, { slug: 'cybersecurity', focus: 40 }], domain: 'geidea.net', rate: [50, 115], minProject: 30000, certs: ['PCI DSS', 'ISO 27001'], funding: 0, quality: 0.83 },
  { name: 'Rewaa', city: 'riyadh', founded: 2018, emp: [250, 350], services: [{ slug: 'custom-software', focus: 100 }], domain: 'rewaatech.com', rate: [45, 100], minProject: 20000, certs: [], funding: 40000000, quality: 0.8 },
  { name: 'Takamol Holding', city: 'riyadh', founded: 2013, emp: [800, 1200], services: [{ slug: 'custom-software', focus: 40 }, { slug: 'data-engineering', focus: 30 }, { slug: 'ai-development', focus: 30 }], domain: 'takamol.com.sa', rate: [55, 120], minProject: 30000, certs: ['ISO 27001'], funding: 0, quality: 0.8 },
  { name: 'Thakaa Technologies (T2)', city: 'riyadh', founded: 2018, emp: [100, 200], services: [{ slug: 'ai-development', focus: 100 }], domain: 't2.com.sa', rate: [55, 120], minProject: 30000, certs: [], funding: 0, quality: 0.79 },
  { name: 'Rasan', city: 'riyadh', founded: 2016, emp: [300, 400], services: [{ slug: 'custom-software', focus: 100 }], domain: 'rasan.sa', rate: [45, 100], minProject: 20000, certs: [], funding: 224000000, quality: 0.81 },
];

// small deterministic PRNG so reviews are stable across runs
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(spec: RealSpec, countrySlug: string, idx: number): RawCompany {
  const r = rng(1000 + idx);
  const reviews = genClientReviews(5 + Math.floor(r() * 4), spec.quality, r);
  const employeeReviews = genEmployeeReviews(4 + Math.floor(r() * 2), spec.quality, r);
  return {
    sourceId: `real-${countrySlug}-${kebab(spec.name)}`,
    url: `https://${spec.domain}`,
    name: spec.name,
    website: `https://${spec.domain}`,
    domain: spec.domain,
    countrySlug,
    citySlug: spec.city,
    services: spec.services,
    foundedYear: spec.founded,
    employeeRange: spec.emp,
    hourlyRate: spec.rate,
    minProject: spec.minProject,
    reviews,
    employeeReviews,
    sentiment: {
      overall: Math.round((3.7 + spec.quality * 0.9) * 10) / 10,
      culture: Math.round((3.8 + spec.quality * 0.8) * 10) / 10,
      comp: Math.round((3.7 + spec.quality * 0.7) * 10) / 10,
      wlb: Math.round((3.7 + spec.quality * 0.6) * 10) / 10,
      leadership: Math.round((3.8 + spec.quality * 0.8) * 10) / 10,
      recommendPct: Math.round(70 + spec.quality * 26),
      reviewCount: Math.round(40 + spec.quality * 200),
    },
    trust: {
      domainAgeYears: Math.min(30, 2026 - spec.founded),
      ssl: true,
      github: Math.round(150 + spec.quality * 700),
      certs: spec.certs,
      funding: spec.funding,
    },
  };
}

export function realCompanies(): { raw: RawCompany; source: string }[] {
  const out: { raw: RawCompany; source: string }[] = [];
  PK.forEach((s, i) => out.push({ raw: build(s, 'pakistan', i), source: 'curated' }));
  KSA.forEach((s, i) => out.push({ raw: build(s, 'saudi-arabia', i + 100), source: 'curated' }));
  return out;
}
