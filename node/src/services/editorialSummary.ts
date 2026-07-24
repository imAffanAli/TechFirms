/**
 * "TechFirms Take" — an ORIGINAL editorial paragraph we write ourselves from the signals
 * we hold (ratings, sentiment, trust, size, services). It is our own content — never copied
 * from any source. Deterministic + template-based so it needs no AI key; when ANTHROPIC_API_KEY
 * is present the profile description is already AI-narrated elsewhere.
 */

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
  clientRating: number | null; // internal review avg, 0..5
  reviewCount: number;
  externalAverage: number | null; // aggregate public rating, 0..5
  externalCount: number; // total public ratings
  employeeSentiment: number | null; // 0..5
  certifications: string[];
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

export function buildEditorialSummary(x: EditorialInput): string {
  const sentences: string[] = [];

  // 1) Identity
  const size = sizeDescriptor(x.employeeMin, x.employeeMax);
  const loc = [x.city, x.country].filter(Boolean).join(', ');
  const services =
    x.topServices.length >= 2
      ? `${x.topServices.slice(0, 2).join(' and ')}`
      : x.topServices[0] ?? 'technology services';
  let s1 = `${x.name} is ${size ?? 'a'} technology company`;
  if (loc) s1 += ` based in ${loc}`;
  if (x.foundedYear) s1 += `, operating since ${x.foundedYear}`;
  s1 += `, focused on ${services}.`;
  sentences.push(s1);

  // 2) Reputation — prefer the real public (Google) rating, fall back to on-platform reviews
  if (x.externalAverage != null) {
    let s2 = `It holds a public rating of ${x.externalAverage.toFixed(1)}★`;
    if (x.externalCount > 0) s2 += ` across ${x.externalCount.toLocaleString()} ratings`;
    if (x.reviewCount > 0 && x.clientRating != null) s2 += `, alongside ${x.reviewCount} client review${x.reviewCount === 1 ? '' : 's'} on TechFirms`;
    s2 += '.';
    sentences.push(s2);
  } else if (x.clientRating != null && x.reviewCount > 0) {
    sentences.push(`Clients rate it ${x.clientRating.toFixed(1)}★ across ${x.reviewCount} review${x.reviewCount === 1 ? '' : 's'} on TechFirms.`);
  }

  // 3) Employer signal + trust
  const bits: string[] = [];
  if (x.employeeSentiment != null) bits.push(`employees rate it ${x.employeeSentiment.toFixed(1)}/5`);
  if (x.certifications.length > 0) bits.push(`it holds ${x.certifications.slice(0, 3).join(', ')}`);
  if (bits.length) {
    const joined = bits.join(', and ');
    sentences.push(`${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`);
  }

  // 4) Verdict
  const verdict = quadrantVerdict(x.quadrant);
  if (x.cis != null) {
    let s4 = `Its TechFirms Intelligence Score is ${x.cis}/100`;
    if (verdict) s4 += `, ${verdict}`;
    s4 += '.';
    sentences.push(s4);
  }

  return sentences.join(' ');
}
