import { api } from "./api";
import type {
  CompaniesResponse,
  CompanyDetail,
  CountryItem,
  Leaderboard,
  ServiceItem,
} from "./types";

/** Fetch JSON from the backend; returns null on failure (logged server-side) so pages can render a fallback. */
async function getJSON<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch (e) {
    console.error(`[data] ${path}:`, (e as Error).message);
    return null;
  }
}

export function getCompanies(search: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(search)) if (v) qs.set(k, v);
  const q = qs.toString();
  return getJSON<CompaniesResponse>(`/api/v1/companies${q ? `?${q}` : ""}`);
}

export function getCompany(slug: string) {
  return getJSON<CompanyDetail>(`/api/v1/companies/${encodeURIComponent(slug)}`);
}

export async function getServices() {
  return (await getJSON<{ items: ServiceItem[] }>(`/api/v1/services`))?.items ?? [];
}

export async function getCountries() {
  return (await getJSON<{ items: CountryItem[] }>(`/api/v1/countries`))?.items ?? [];
}

export function getLeaderboard(country: string, service?: string) {
  const path = service
    ? `/api/v1/leaderboard/${encodeURIComponent(country)}/${encodeURIComponent(service)}`
    : `/api/v1/leaderboard/${encodeURIComponent(country)}`;
  return getJSON<Leaderboard>(path);
}
