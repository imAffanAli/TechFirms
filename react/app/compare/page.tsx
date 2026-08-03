import type { Metadata } from "next";
import Link from "next/link";
import { getCompany } from "@/lib/data";
import type { CompanyDetail } from "@/lib/types";
import { fmtRate, fmtEmployees, fmtMoney, quadrantLabel } from "@/lib/format";
import { LogoAvatar } from "@/components/logo-avatar";
import { ScoreBadge } from "@/components/score-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare companies" };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ c?: string | string[] }> }) {
  const sp = await searchParams;
  const slugs = (Array.isArray(sp.c) ? sp.c : sp.c ? [sp.c] : []).slice(0, 4);
  const companies = (await Promise.all(slugs.map((s) => getCompany(s).catch(() => null)))).filter((c): c is CompanyDetail => !!c);

  if (companies.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Compare companies</h1>
        <p className="mt-2 text-muted-foreground">Add companies to compare, e.g. <code className="tabular">/compare?c=systems-limited&amp;c=devsinc</code></p>
        <Link href="/companies" className="mt-4 inline-block text-primary hover:underline">Browse the directory →</Link>
      </main>
    );
  }

  const rows: { label: string; render: (c: CompanyDetail) => React.ReactNode }[] = [
    { label: "Intelligence Score", render: (c) => (c.intelligenceScore ? `${c.intelligenceScore.cis}/100` : "—") },
    { label: "Quadrant", render: (c) => (c.intelligenceScore?.quadrant ? quadrantLabel(c.intelligenceScore.quadrant) : "—") },
    { label: "Public rating", render: (c) => (c.aggregateRating ? `${c.aggregateRating.average.toFixed(1)}★ (${c.aggregateRating.totalCount.toLocaleString()})` : "—") },
    { label: "On-platform reviews", render: (c) => c.reviewCount },
    { label: "Team size", render: (c) => fmtEmployees(c.employeeRangeMin, c.employeeRangeMax) ?? "—" },
    { label: "Founded", render: (c) => c.foundedYear ?? "—" },
    { label: "Hourly rate", render: (c) => fmtRate(c.hourlyRateMin, c.hourlyRateMax, c.rateCurrency) ?? "—" },
    { label: "Min project", render: (c) => fmtMoney(c.minProjectSize, c.rateCurrency) ?? "—" },
    { label: "Location", render: (c) => [c.hqCity?.name, c.hqCountry?.name].filter(Boolean).join(", ") || "—" },
    { label: "Verified", render: (c) => (c.verified ? "Yes" : "—") },
    { label: "Top services", render: (c) => c.services.slice(0, 3).map((s) => s.name).join(", ") || "—" },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Compare companies</h1>
      <p className="mt-1 text-muted-foreground">Side-by-side on the signals that matter. Organic scores are never influenced by sponsorship.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 p-3 text-left align-bottom text-xs uppercase text-muted-foreground">&nbsp;</th>
              {companies.map((c) => (
                <th key={c.slug} className="min-w-[160px] border-b border-border p-3 text-left align-bottom">
                  <div className="flex items-center gap-2">
                    <LogoAvatar name={c.name} domain={c.domain} logoUrl={c.logoUrl} size={32} />
                    <Link href={`/companies/${c.slug}`} className="font-semibold hover:text-primary">{c.name}</Link>
                  </div>
                  <div className="mt-2"><ScoreBadge cis={c.intelligenceScore?.cis ?? null} size={44} /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-border">
                <td className="p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.label}</td>
                {companies.map((c) => (
                  <td key={c.slug} className="tabular p-3">{r.render(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
