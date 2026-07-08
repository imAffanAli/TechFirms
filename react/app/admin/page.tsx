import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

interface Stats {
  companies: number;
  claimed: number;
  verified: number;
  claimedPct: number;
  reviews: number;
  countries: number;
  services: number;
  pendingClaims: number;
  queries: number;
  flaggedReviews: number;
  aiEnabled: boolean;
}

export default async function AdminDashboard() {
  let stats: Stats | null = null;
  try {
    stats = await api<Stats>("/api/v1/admin/stats");
  } catch {
    stats = null;
  }

  const tiles = stats
    ? [
        { label: "Companies", value: stats.companies },
        { label: "Claimed", value: `${stats.claimedPct}%` },
        { label: "Verified", value: stats.verified },
        { label: "Reviews", value: stats.reviews },
        { label: "Queries", value: stats.queries },
        { label: "Pending claims", value: stats.pendingClaims },
        { label: "Flagged reviews", value: stats.flaggedReviews },
        { label: "Countries", value: stats.countries },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
        {stats && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${stats.aiEnabled ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "bg-muted text-muted-foreground"}`}>
            <span className={`size-2 rounded-full ${stats.aiEnabled ? "bg-success" : "bg-muted-foreground"}`} />
            AI features {stats.aiEnabled ? "enabled" : "off (set ANTHROPIC_API_KEY)"}
          </span>
        )}
      </div>
      <p className="mt-1 text-muted-foreground">Platform health at a glance.</p>

      {!stats ? (
        <p className="mt-6 rounded-lg border border-border bg-card p-6 text-muted-foreground">Couldn’t load stats — is the backend running?</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">{t.label}</div>
              <div className="tabular mt-1 text-2xl font-bold">{t.value}</div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Query management, the claims queue, review moderation (with AI spam assist), and company CRUD land in milestones M4–M5 (see <code className="tabular">docs/12-admin-panel-spec.md</code>).
      </p>
    </div>
  );
}
