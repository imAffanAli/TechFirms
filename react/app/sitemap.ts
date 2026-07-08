import type { MetadataRoute } from "next";

const SITE = "https://techfirms.com";
const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const revalidate = 3600;

interface SitemapData { companies: { slug: string; updatedAt: string }[]; services: string[]; countries: string[] }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let data: SitemapData = { companies: [], services: [], countries: [] };
  try {
    data = (await fetch(`${API}/api/v1/sitemap`, { next: { revalidate: 3600 } }).then((r) => r.json())) as SitemapData;
  } catch {
    /* API down at build — emit the static routes only */
  }

  const staticRoutes: MetadataRoute.Sitemap = ["", "/companies", "/leaderboard", "/methodology", "/get-quote"].map((p) => ({ url: `${SITE}${p}`, changeFrequency: "weekly", priority: 0.8 }));
  const services: MetadataRoute.Sitemap = data.services.map((s) => ({ url: `${SITE}/services/${s}`, changeFrequency: "weekly", priority: 0.6 }));
  const countryBoards: MetadataRoute.Sitemap = data.countries.map((c) => ({ url: `${SITE}/leaderboard/${c}`, changeFrequency: "weekly", priority: 0.7 }));
  const serviceBoards: MetadataRoute.Sitemap = data.countries.flatMap((c) => data.services.map((s) => ({ url: `${SITE}/leaderboard/${c}/${s}`, changeFrequency: "weekly" as const, priority: 0.6 })));
  const pseo: MetadataRoute.Sitemap = data.countries.flatMap((c) => data.services.map((s) => ({ url: `${SITE}/best-${s}-companies-in-${c}`, changeFrequency: "weekly" as const, priority: 0.6 })));
  const companies: MetadataRoute.Sitemap = data.companies.map((c) => ({ url: `${SITE}/companies/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "monthly", priority: 0.5 }));

  return [...staticRoutes, ...services, ...countryBoards, ...serviceBoards, ...pseo, ...companies];
}
