import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanies, getServices, getCountries } from "@/lib/data";
import { CompanyCard } from "@/components/company-card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const svc = (await getServices()).find((s) => s.slug === service);
  if (!svc) return { title: "Service not found" };
  return {
    title: `${svc.name} companies`,
    description: `Browse and compare top ${svc.name} companies, ranked by the Company Intelligence Score.`,
  };
}

export default async function ServiceHub({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const [services, countries] = await Promise.all([getServices(), getCountries()]);
  const svc = services.find((s) => s.slug === service);
  if (!svc) notFound();

  const data = await getCompanies({ service, sort: "cis" });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <nav className="text-sm text-muted-foreground">
        <Link href="/companies" className="hover:text-foreground">Companies</Link> / <span className="text-foreground">{svc.name}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{svc.name} companies</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {data?.total ?? 0} {svc.name} {(data?.total ?? 0) === 1 ? "company" : "companies"} tracked, ranked by the Company Intelligence Score.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Leaderboards:</span>
        {countries.map((c) => (
          <Link key={c.slug} href={`/leaderboard/${c.slug}/${svc.slug}`} className="rounded-full border border-border px-3 py-1 hover:border-primary hover:text-primary">
            {svc.name} · {c.name}
          </Link>
        ))}
      </div>

      {!data || data.items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-border bg-card p-6 text-muted-foreground">No companies yet for this service.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data.items.map((c) => (
            <CompanyCard key={c.slug} c={c} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Badge variant="outline">Tip</Badge>{" "}
        <span className="text-sm text-muted-foreground">Compare across all services in the <Link href="/companies" className="text-primary hover:underline">full directory</Link>.</span>
      </div>
    </main>
  );
}
