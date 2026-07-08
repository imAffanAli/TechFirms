import type { MetadataRoute } from "next";

const SITE = "https://techfirms.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/", "/r/"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
