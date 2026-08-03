import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

interface Stats {
  companies: number; claimed: number; verified: number; unclaimed: number; claimedPct: number;
  reviews: number; countries: number; services: number; pendingClaims: number; queries: number;
  flaggedReviews: number; users: number; activeSponsorships: number; pendingOrders: number;
  sponsorshipRevenue: number; aiEnabled: boolean;
}

export default async function AdminDashboard() {
  let s: Stats | null = null;
  try {
    s = await api<Stats>("/api/v1/admin/stats");
  } catch {
    s = null;
  }

  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  const groups = s
    ? [
        { title: "Directory", tiles: [
          { label: "Companies", value: s.companies },
          { label: "Claimed", value: `${s.claimedPct}%` },
          { label: "Verified", value: s.verified },
          { label: "Unclaimed", value: s.unclaimed },
        ] },
        { title: "Activity", tiles: [
          { label: "Users", value: s.users },
          { label: "Reviews", value: s.reviews },
          { label: "Leads", value: s.queries },
          { label: "Countries", value: s.countries },
        ] },
        { title: "Revenue & queue", tiles: [
          { label: "Active sponsorships", value: s.activeSponsorships },
          { label: "Sponsorship revenue", value: money(s.sponsorshipRevenue) },
          { label: "Pending orders", value: s.pendingOrders, href: "/admin/sponsorship-orders" },
          { label: "Pending claims", value: s.pendingClaims, href: "/admin/claims" },
        ] },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
        {s && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.aiEnabled ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "bg-muted text-muted-foreground"}`}>
            <span className={`size-2 rounded-full ${s.aiEnabled ? "bg-success" : "bg-muted-foreground"}`} />
            AI features {s.aiEnabled ? "enabled" : "off"}
          </span>
        )}
      </div>
      <p className="mt-1 text-muted-foreground">Platform health at a glance.</p>

      {!s ? (
        <p className="mt-6 rounded-lg border border-border bg-card p-6 text-muted-foreground">Couldn&apos;t load stats — is the backend running?</p>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.title}</h2>
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {g.tiles.map((t) => {
                  const inner = (
                    <>
                      <div className="text-sm text-muted-foreground">{t.label}</div>
                      <div className="tabular mt-1 text-2xl font-bold">{t.value}</div>
                    </>
                  );
                  return "href" in t && t.href ? (
                    <Link key={t.label} href={t.href} className="rounded-lg border border-border bg-card p-4 hover:border-primary">{inner}</Link>
                  ) : (
                    <div key={t.label} className="rounded-lg border border-border bg-card p-4">{inner}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
