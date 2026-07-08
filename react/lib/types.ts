// API response types — mirror node/src/services/*.ts mappers (docs/16-public-api-spec.md).

export type Role = "visitor" | "business_owner" | "admin" | "super_admin";
export interface SessionUser { id: string; email: string; fullName: string | null; role: Role }

export type ScoreTier = "Unrated" | "Rated";
export type Quadrant = "Leaders" | "Challengers" | "Rising_Stars" | "Niche_Players";
export type ListingStatus = "unclaimed" | "claimed" | "verified";

export interface ServiceRef { slug: string; name: string; focusPct?: number }
export interface PlaceRef { slug: string; name: string }

export interface CompanyCard {
  slug: string;
  name: string;
  logoUrl: string | null;
  tagline: string | null;
  listingStatus: ListingStatus;
  verified: boolean;
  claimed: boolean;
  hqCountry: PlaceRef | null;
  hqCity: PlaceRef | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  rateCurrency: string;
  minProjectSize: number | null;
  employeeRangeMin: number | null;
  employeeRangeMax: number | null;
  foundedYear: number | null;
  rating: number | null;
  reviewCount: number;
  cis: number | null;
  quadrant: Quadrant | null;
  tier: ScoreTier | null;
  services: ServiceRef[];
}

export interface CompaniesResponse {
  items: CompanyCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Review {
  id: string;
  reviewerName: string | null;
  reviewerTitle: string | null;
  reviewerCompany: string | null;
  ratingOverall: number;
  ratingQuality: number | null;
  ratingSchedule: number | null;
  ratingCost: number | null;
  ratingWillingToRefer: number | null;
  body: string | null;
  verified: boolean;
  reviewedAt: string;
  projectDurationMonths: number | null;
}

export interface EmployeeSentiment {
  overallRating: number | null;
  culture: number | null;
  compensation: number | null;
  workLifeBalance: number | null;
  leadership: number | null;
  recommendPct: number | null;
  reviewCount: number;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
}

export interface TrustSignals {
  domainAgeYears: number | null;
  sslValid: boolean | null;
  githubOrgActivity: number | null;
  certifications: string[];
  fundingRaised: number | null;
  fundingCurrency: string;
  crunchbaseUrl: string | null;
}

export interface IntelligenceScore {
  cis: number;
  reviewsScore: number;
  sentimentScore: number | null;
  trustScore: number | null;
  marketScore: number | null;
  marketPresence: number;
  clientSatisfaction: number;
  quadrant: Quadrant | null;
  tier: ScoreTier;
  justification: string | null;
}

export interface CompanyDetail {
  slug: string;
  name: string;
  logoUrl: string | null;
  tagline: string | null;
  description: string | null;
  website: string | null;
  foundedYear: number | null;
  listingStatus: ListingStatus;
  verified: boolean;
  claimed: boolean;
  hqCountry: PlaceRef | null;
  hqCity: PlaceRef | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  rateCurrency: string;
  minProjectSize: number | null;
  employeeRangeMin: number | null;
  employeeRangeMax: number | null;
  rating: number | null;
  reviewCount: number;
  services: ServiceRef[];
  intelligenceScore: IntelligenceScore | null;
  reviews: Review[];
  employeeSentiment: EmployeeSentiment | null;
  trustSignals: TrustSignals | null;
  offices: { country: PlaceRef | null; city: PlaceRef | null; isHeadquarters: boolean }[];
}

export interface ServiceItem { slug: string; name: string; category: string; companyCount: number }
export interface CountryItem { slug: string; name: string; isoCode: string; companyCount: number }

export interface LeaderboardEntry {
  rank: number;
  slug: string;
  name: string;
  logoUrl: string | null;
  hqCity: string | null;
  cis: number;
  quadrant: Quadrant | null;
  tier: ScoreTier;
  marketPresence: number;
  clientSatisfaction: number;
  rating: number | null;
  reviewCount: number;
  topService: string | null;
}

export interface Leaderboard {
  country: { slug: string; name: string; isoCode: string };
  service: PlaceRef | null;
  title: string;
  answerBlock: string;
  generatedAt: string;
  entries: LeaderboardEntry[];
}
