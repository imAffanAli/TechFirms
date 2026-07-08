import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { QueryStatusControl } from "@/components/query-status-control";

export const dynamic = "force-dynamic";

interface Q {
  id: string;
  projectType: string;
  serviceCategory: string | null;
  country: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string;
  timeline: string | null;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  directCompany: { slug: string; name: string } | null;
  matches: { slug: string; name: string; rank: number }[];
}

export default async function AdminQueries() {
  let items: Q[] = [];
  try {
    items = (await api<{ items: Q[] }>("/api/v1/admin/queries")).items;
  } catch {
    items = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Queries</h1>
      <p className="mt-1 text-muted-foreground">{items.length} lead-gen {items.length === 1 ? "query" : "queries"} · pipeline New → Forwarded → Contacted → Closed.</p>

      <div className="mt-6 space-y-4">
        {items.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">No queries yet. Submit one from a company profile or /get-quote.</p>}
        {items.map((q) => (
          <div key={q.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">{q.projectType} <Badge variant="brand">{q.status}</Badge></div>
              <div className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleString()}</div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{q.description}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span><span className="font-medium text-foreground">Contact:</span> {q.contactName} · {q.contactEmail}{q.contactPhone ? ` · ${q.contactPhone}` : ""}</span>
              {q.country && <span><span className="font-medium text-foreground">Country:</span> {q.country}</span>}
              {q.serviceCategory && <span><span className="font-medium text-foreground">Service:</span> {q.serviceCategory}</span>}
              {(q.budgetMin || q.budgetMax) && <span><span className="font-medium text-foreground">Budget:</span> {q.budgetMin ?? "?"}–{q.budgetMax ?? "?"} {q.budgetCurrency}</span>}
              {q.timeline && <span><span className="font-medium text-foreground">Timeline:</span> {q.timeline}</span>}
            </div>
            <div className="mt-2 text-xs">
              {q.directCompany ? (
                <span><span className="font-medium">Direct →</span> <Link href={`/companies/${q.directCompany.slug}`} className="text-primary hover:underline">{q.directCompany.name}</Link></span>
              ) : q.matches.length > 0 ? (
                <span><span className="font-medium">Matched →</span> {q.matches.map((m) => <Link key={m.slug} href={`/companies/${m.slug}`} className="mr-2 text-primary hover:underline">#{m.rank} {m.name}</Link>)}</span>
              ) : (
                <span className="text-muted-foreground">No matches</span>
              )}
            </div>
            <div className="mt-3"><QueryStatusControl id={q.id} status={q.status} notes={q.adminNotes} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
