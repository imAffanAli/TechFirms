import type { Metadata } from "next";
import Link from "next/link";
import { getCompanies, getServices, getCountries } from "@/lib/data";
import { CompanyCard } from "@/components/company-card";
import { DirectoryFilters } from "@/components/directory-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Technology company directory",
  description: "Browse and filter technology companies by service, country, rating, and Company Intelligence Score.",
};

type SP = Promise<{ q?: string; service?: string; country?: string; sort?: string; page?: string }>;

export default async function CompaniesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [data, services, countries] = await Promise.all([
    getCompanies({ q: sp.q, service: sp.service, country: sp.country, sort: sp.sort, page: sp.page }),
    getServices(),
    getCountries(),
  ]);

  const buildQuery = (page: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, page: String(page) })) if (v) qs.set(k, v);
    return `/companies?${qs.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Company directory</h1>
      <p className="mt-1 text-muted-foreground">
        {data ? `${data.total} technology ${data.total === 1 ? "company" : "companies"}` : "Directory"} — ranked by Company Intelligence Score.
      </p>

      <div className="mt-6">
        <DirectoryFilters services={services} countries={countries} current={sp} />
      </div>

      {!data ? (
        <p className="mt-10 rounded-lg border border-border bg-card p-6 text-muted-foreground">
          Couldn’t reach the API. Make sure the backend is running (see the README) then refresh.
        </p>
      ) : data.items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-border bg-card p-6 text-muted-foreground">
          No companies match these filters. <Link href="/companies" className="text-primary hover:underline">Clear filters</Link>.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data.items.map((c) => (
              <CompanyCard key={c.slug} c={c} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-4 text-sm">
              {data.page > 1 && <Link href={buildQuery(data.page - 1)} className="text-primary hover:underline">← Previous</Link>}
              <span className="tabular text-muted-foreground">Page {data.page} of {data.totalPages}</span>
              {data.page < data.totalPages && <Link href={buildQuery(data.page + 1)} className="text-primary hover:underline">Next →</Link>}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
