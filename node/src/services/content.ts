// Richer review content pools + generators, shared by the seed and the generated source.
// Client reviews describe scope + outcome; employee reviews carry pros/cons.

export interface RawEmployeeReview {
  rating: number; // 0–5
  title: string;
  pros: string;
  cons: string;
  role: string;
  current: boolean;
}

export const CLIENT_BODIES: string[] = [
  'They rebuilt our platform from the ground up and delivered two weeks early — engagement was smooth and communication was excellent throughout.',
  'We hired them to ship an MVP in a tight timeline. The senior team scoped it well, flagged risks early, and the launch went off without a hitch.',
  'Their engineers integrated with our in-house team seamlessly. Code quality was high, and they left us with clean documentation and tests.',
  'Migrated our infrastructure to the cloud with zero downtime. Cost dropped noticeably and reliability improved measurably after the move.',
  'The design and front-end work lifted our conversion rate significantly. They ran real user research rather than guessing.',
  'A genuine partner, not just a vendor — they pushed back on scope when it mattered and saved us from an expensive mistake.',
  'Delivered a complex data pipeline on budget. Reporting that used to take hours now runs in minutes.',
  'Strong project management. Weekly demos, clear velocity, and no surprises on the invoice. We have already signed a second phase.',
  'Their AI model measurably reduced manual review workload. They were rigorous about evaluation and did not over-promise.',
  'Responsive across time zones and easy to work with. Handover was thorough and our internal team was productive from day one.',
  'Took over a stalled project from a previous agency and got it back on track within a month. Pragmatic and dependable.',
  'Security-conscious and thorough — they caught issues our internal review had missed and fixed them without drama.',
];

const EMP_TITLES = ['Great place to grow', 'Solid engineering culture', 'Good work-life balance', 'Fast-paced and rewarding', 'Strong team, fair pay', 'Learned a lot here', 'Supportive leadership', 'Room to improve on process'];
const EMP_PROS = [
  'Smart, collaborative colleagues and interesting client work across the region.',
  'Real ownership early on — you get to lead features, not just take tickets.',
  'Management is transparent and genuinely invests in mentoring.',
  'Flexible hours and a respectful remote/hybrid setup.',
  'Modern stack and a strong engineering culture with code reviews and CI.',
  'Good exposure to enterprise clients and meaningful, shipped projects.',
];
const EMP_CONS = [
  'Growth means occasional process gaps; things can feel ad-hoc during busy sprints.',
  'Compensation is fair but on-call weeks can be intense before big launches.',
  'Career ladders are still being formalised as the company scales.',
  'Some legacy client projects can be less exciting than the newer work.',
  'Cross-team communication could be tighter as headcount grows.',
];
const EMP_ROLES = ['Software Engineer', 'Senior Engineer', 'Product Manager', 'DevOps Engineer', 'UX Designer', 'Data Engineer', 'QA Engineer', 'Engineering Manager'];

/** Generate `n` employee reviews around a quality level (0..1). `rand` returns 0..1. */
export function genEmployeeReviews(n: number, quality: number, rand: () => number): RawEmployeeReview[] {
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;
  const base = 3.4 + quality * 1.3; // ~3.4..4.7
  return Array.from({ length: n }, () => ({
    rating: Math.max(2.5, Math.min(5, Math.round((base + (rand() - 0.5) * 0.8) * 10) / 10)),
    title: pick(EMP_TITLES),
    pros: pick(EMP_PROS),
    cons: pick(EMP_CONS),
    role: pick(EMP_ROLES),
    current: rand() > 0.35,
  }));
}
