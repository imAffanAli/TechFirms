import type { Metadata } from "next";
import Link from "next/link";
import { getCountries, getServices } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Technology company leaderboards by country",
  description: "Country-scoped, Gartner-style leaderboards of the top technology companies, ranked by the Company Intelligence Score.",
};

export default async function LeaderboardIndex() {
  const [countries, services] = await Promise.all([getCountries(), getServices()]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Country-scoped rankings of the top technology companies, ranked by the deterministic Company Intelligence Score. Pick a country, then narrow by service.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c) => (
          <div key={c.slug} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <Link href={`/leaderboard/${c.slug}`} className="text-lg font-semibold hover:text-primary">{c.name}</Link>
              <Badge variant="neutral">{c.companyCount} cos</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {services.slice(0, 6).map((s) => (
                <Link key={s.slug} href={`/leaderboard/${c.slug}/${s.slug}`} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
