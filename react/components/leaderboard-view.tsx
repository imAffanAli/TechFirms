import Link from "next/link";
import type { Leaderboard } from "@/lib/types";
import { quadrantLabel } from "@/lib/format";
import { QuadrantChart } from "@/components/quadrant-chart";
import { Badge } from "@/components/ui/badge";

function itemListLd(lb: Leaderboard) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lb.title,
    itemListElement: lb.entries.map((e) => ({
      "@type": "ListItem",
      position: e.rank,
      name: e.name,
      url: `https://techfirms.com/companies/${e.slug}`,
    })),
  };
}

export function LeaderboardView({ lb }: { lb: Leaderboard }) {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd(lb)) }} />
      <h1 className="text-3xl font-bold tracking-tight">{lb.title}</h1>

      {/* Answer block (GEO) */}
      <p className="mt-4 rounded-lg border border-border bg-muted/40 p-4 leading-relaxed">{lb.answerBlock}</p>

      {lb.entries.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No ranked companies yet for this leaderboard.</p>
      ) : (
        <>
          {/* Quadrant chart */}
          <section className="mt-8 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Market Presence vs. Client Satisfaction</h2>
            <p className="text-sm text-muted-foreground">Each dot is a company; quadrants split at the cohort median.</p>
            <div className="mt-4">
              <QuadrantChart entries={lb.entries} />
            </div>
          </section>

          {/* Ranked table (HTML equivalent — GEO/accessibility) */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Full ranking</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Company</th>
                    <th className="px-4 py-2 font-medium">Location</th>
                    <th className="px-4 py-2 font-medium">Rating</th>
                    <th className="px-4 py-2 font-medium">Quadrant</th>
                    <th className="px-4 py-2 text-right font-medium">CIS</th>
                  </tr>
                </thead>
                <tbody>
                  {lb.entries.map((e) => (
                    <tr key={e.slug} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="tabular px-4 py-3 text-muted-foreground">{e.rank}</td>
                      <td className="px-4 py-3">
                        <Link href={`/companies/${e.slug}`} className="font-medium hover:text-primary">{e.name}</Link>
                        {e.topService && <div className="text-xs text-muted-foreground">{e.topService}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{e.hqCity ?? "—"}</td>
                      <td className="tabular px-4 py-3">{e.rating != null ? `${e.rating.toFixed(1)} (${e.reviewCount})` : "—"}</td>
                      <td className="px-4 py-3"><Badge variant="brand">{quadrantLabel(e.quadrant)}</Badge></td>
                      <td className="px-4 py-3 text-right"><span className="tabular font-semibold">{e.cis}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Ranked by the <Link href="/methodology" className="underline">Company Intelligence Score</Link> — a deterministic composite of customer reviews (40%), employee sentiment (25%), trust signals (20%), and market activity (15%). Rankings are never for sale.
      </p>
    </div>
  );
}
