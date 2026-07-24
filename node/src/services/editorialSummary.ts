/**
 * "TechFirms Take" — an ORIGINAL, detailed editorial section we write ourselves from the
 * signals we hold (ratings, sentiment, trust, size, services, score breakdown). It is our
 * own content — never copied from any source. Deterministic + template-based, so it needs
 * no AI key.
 */

export interface Editorial {
  verdict: string; // 2–4 sentence overview
  strengths: string[]; // derived positives
  considerations: string[]; // derived caveats / things to check
  bestFor: string | null; // who it suits
}

export interface EditorialInput {
  name: string;
  city: string | null;
  country: string | null;
  foundedYear: number | null;
  employeeMin: number | null;
  employeeMax: number | null;
  topServices: string[];
  cis: number | null;
  quadrant: string | null;
  tier: string | null;
  reviewsScore: number | null; // 0..100
  sentimentScore: number | null;
  trustScore: number | null;
  marketScore: number | null;
  clientRating: number | null; // internal review avg, 0..5
  reviewCount: number;
  externalAverage: number | null; // aggregate public rating, 0..5
  externalCount: number;
  employeeSentiment: number | null; // 0..5
  certifications: string[];
  fundingRaised: number | null; // whole units, USD
  domainAgeYears: number | null;
  minProject: number | null;
}

function sizeDescriptor(min: number | null, max: number | null): string | null {
  const n = max ?? min;
  if (n == null) return null;
  if (n < 50) return 'a boutique';
  if (n < 250) return 'a mid-sized';
  if (n < 1000) return 'a large';
  return 'an enterprise-scale';
}

function quadrantVerdict(q: string | null): string | null {
  switch (q) {
    case 'Leaders':
      return 'placing it among the Leaders in its market';
    case 'Challengers':
      return 'placing it among the Challengers — strong reach, with room to lift satisfaction';
    case 'Rising_Stars':
      return 'marking it a Rising Star — high satisfaction and growing presence';
    case 'Niche_Players':
      return 'positioning it as a Niche Player in its segment';
    default:
      return null;
  }
}

function compactMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 ? 1 : 0)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function buildVerdict(x: EditorialInput): string {
  const sentences: string[] = [];
  const size = sizeDescriptor(x.employeeMin, x.employeeMax);
  const loc = [x.city, x.country].filter(Boolean).join(', ');
  const services =
    x.topServices.length >= 2 ? `${x.topServices.slice(0, 2).join(' and ')}` : x.topServices[0] ?? 'technology services';

  let s1 = `${x.name} is ${size ?? 'a'} technology company`;
  if (loc) s1 += ` based in ${loc}`;
  if (x.foundedYear) s1 += `, operating since ${x.foundedYear}`;
  s1 += `, focused on ${services}.`;
  sentences.push(s1);

  if (x.externalAverage != null) {
    let s2 = `It holds a public rating of ${x.externalAverage.toFixed(1)}★`;
    if (x.externalCount > 0) s2 += ` across ${x.externalCount.toLocaleString()} ratings`;
    if (x.reviewCount > 0 && x.clientRating != null) s2 += `, alongside ${x.reviewCount} client review${x.reviewCount === 1 ? '' : 's'} on TechFirms`;
    s2 += '.';
    sentences.push(s2);
  } else if (x.clientRating != null && x.reviewCount > 0) {
    sentences.push(`Clients rate it ${x.clientRating.toFixed(1)}★ across ${x.reviewCount} review${x.reviewCount === 1 ? '' : 's'} on TechFirms.`);
  }

  const verdict = quadrantVerdict(x.quadrant);
  if (x.cis != null) {
    let s3 = `Its TechFirms Intelligence Score is ${x.cis}/100`;
    if (verdict) s3 += `, ${verdict}`;
    s3 += '.';
    sentences.push(s3);
  }
  return sentences.join(' ');
}

function buildStrengths(x: EditorialInput): string[] {
  const out: string[] = [];
  if (x.cis != null && x.cis >= 80) out.push(`Elite Company Intelligence Score (${x.cis}/100)`);
  if (x.externalAverage != null && x.externalAverage >= 4.4) out.push(`Strong public reputation — ${x.externalAverage.toFixed(1)}★${x.externalCount > 0 ? ` from ${x.externalCount.toLocaleString()} ratings` : ''}`);
  if (x.employeeSentiment != null && x.employeeSentiment >= 4.2) out.push(`Employees rate it highly (${x.employeeSentiment.toFixed(1)}/5)`);
  if (x.reviewsScore != null && x.reviewsScore >= 75) out.push('Excellent client-review track record');
  if (x.certifications.length > 0) out.push(`Certified: ${x.certifications.slice(0, 3).join(', ')}`);
  if (x.fundingRaised != null && x.fundingRaised > 0) out.push(`Venture-backed (${compactMoney(x.fundingRaised)} raised)`);
  if ((x.employeeMax ?? x.employeeMin ?? 0) >= 1000) out.push('Enterprise-scale delivery team');
  if (x.marketScore != null && x.marketScore >= 75) out.push('High market presence');
  if (x.domainAgeYears != null && x.domainAgeYears >= 10) out.push(`Long-established (${Math.round(x.domainAgeYears)}+ year web presence)`);
  return out.slice(0, 5);
}

function buildConsiderations(x: EditorialInput): string[] {
  const out: string[] = [];
  if (x.tier === 'Unrated') out.push('Not yet enough verified reviews to earn a Rated badge');
  if (x.reviewCount < 5) out.push(`Only ${x.reviewCount} first-party review${x.reviewCount === 1 ? '' : 's'} on TechFirms so far`);
  if (x.externalAverage != null && x.externalAverage < 4.0) out.push(`Public rating is middling (${x.externalAverage.toFixed(1)}★)`);
  if (x.employeeSentiment != null && x.employeeSentiment < 3.8) out.push(`Employee sentiment is mixed (${x.employeeSentiment.toFixed(1)}/5)`);
  if (x.quadrant === 'Challengers') out.push('Broad reach, but client satisfaction trails the top tier');
  if (x.quadrant === 'Niche_Players') out.push('Operates in a narrower niche');
  if (x.certifications.length === 0) out.push('No public certifications listed');
  if (out.length === 0) out.push('No major red flags across the available signals');
  return out.slice(0, 4);
}

function buildBestFor(x: EditorialInput): string | null {
  if (x.topServices.length === 0) return null;
  const services = x.topServices.slice(0, 2).join(' or ');
  const big = (x.employeeMax ?? x.employeeMin ?? 0) >= 800 || (x.minProject != null && x.minProject >= 40000);
  const small = (x.employeeMax ?? x.employeeMin ?? 9999) < 150 || (x.minProject != null && x.minProject <= 12000);
  const audience = big
    ? 'larger organizations running enterprise-grade programs'
    : small
      ? 'startups and smaller, budget-conscious projects'
      : 'mid-market teams';
  return `Best suited for ${audience} that need ${services}.`;
}

export function buildEditorial(x: EditorialInput): Editorial {
  return {
    verdict: buildVerdict(x),
    strengths: buildStrengths(x),
    considerations: buildConsiderations(x),
    bestFor: buildBestFor(x),
  };
}
