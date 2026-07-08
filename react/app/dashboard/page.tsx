import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { CompanyEditor } from "@/components/company-editor";
import { InviteForm } from "@/components/invite-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Business dashboard" };

interface Owned {
  slug: string; name: string; listingStatus: string; verified: boolean;
  tagline: string | null; description: string | null; website: string | null; foundedYear: number | null;
  employeeRangeMin: number | null; employeeRangeMax: number | null;
  hourlyRateMin: number | null; hourlyRateMax: number | null; rateCurrency: string; minProjectSize: number | null;
  cis: number | null; reviewCount: number;
}
interface DQuery {
  id: string; projectType: string; description: string; budgetMin: number | null; budgetMax: number | null; budgetCurrency: string;
  timeline: string | null; contactName: string; contactEmail: string; status: string; createdAt: string; kind: "direct" | "matched";
}
interface Overview { companies: number; reviews: number; queries: number; avgCis: number | null }

export default async function Dashboard() {
  const user = await getSession();
  if (!user || !["business_owner", "admin", "super_admin"].includes(user.role)) redirect("/login?next=/dashboard");

  const [overview, companiesRes, queriesRes] = await Promise.all([
    api<Overview>("/api/v1/dashboard/overview").catch(() => null),
    api<{ items: Owned[] }>("/api/v1/dashboard/companies").catch(() => ({ items: [] as Owned[] })),
    api<{ items: DQuery[] }>("/api/v1/dashboard/queries").catch(() => ({ items: [] as DQuery[] })),
  ]);
  const companies = companiesRes.items;
  const queries = queriesRes.items;

  const tiles = overview
    ? [
        { label: "Companies", value: overview.companies },
        { label: "Reviews", value: overview.reviews },
        { label: "Incoming queries", value: overview.queries },
        { label: "Avg CIS", value: overview.avgCis ?? "—" },
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Business dashboard</h1>
      <p className="mt-1 text-muted-foreground">Signed in as {user.email}</p>

      {tiles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">{t.label}</div>
              <div className="tabular mt-1 text-2xl font-bold">{t.value}</div>
            </div>
          ))}
        </div>
      )}

      {companies.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-6 text-muted-foreground">
          You don&apos;t own any companies yet. Find your company in the <Link href="/companies" className="text-primary hover:underline">directory</Link> and click &ldquo;Claim this profile&rdquo;.
        </div>
      ) : (
        <section className="mt-8 space-y-6">
          <h2 className="text-lg font-semibold">Your companies</h2>
          {companies.map((c) => (
            <div key={c.slug} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link href={`/companies/${c.slug}`} className="font-semibold hover:text-primary">{c.name}</Link>
                  {c.verified ? <Badge variant="verified">Verified</Badge> : <Badge variant="brand">{c.listingStatus}</Badge>}
                  {c.cis != null && <Badge variant="neutral">CIS {c.cis}</Badge>}
                  <Badge variant="neutral">{c.reviewCount} reviews</Badge>
                </div>
              </div>
              <div className="mt-4"><CompanyEditor company={c} /></div>
              <div className="mt-5 border-t border-border pt-4">
                <div className="text-sm font-medium">Invite a client to leave a verified review</div>
                <p className="mb-2 text-xs text-muted-foreground">Generates a unique one-time review link.</p>
                <InviteForm slug={c.slug} />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Incoming queries</h2>
        <div className="mt-3 space-y-3">
          {queries.length === 0 && <p className="text-muted-foreground">No queries yet.</p>}
          {queries.map((q) => (
            <div key={q.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium">{q.projectType} <Badge variant="neutral">{q.kind}</Badge> <Badge variant="brand">{q.status}</Badge></div>
                <div className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{q.description}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {q.contactName} · {q.contactEmail}
                {(q.budgetMin || q.budgetMax) && <> · Budget {q.budgetMin ?? "?"}–{q.budgetMax ?? "?"} {q.budgetCurrency}</>}
                {q.timeline && <> · {q.timeline}</>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
