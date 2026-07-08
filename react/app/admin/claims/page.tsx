import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ClaimDecision } from "@/components/claim-decision";

export const dynamic = "force-dynamic";

interface Claim {
  id: string;
  status: string;
  method: string;
  evidence: unknown;
  company: { slug: string; name: string; domain: string | null; listingStatus: string };
  user: { email: string; fullName: string | null };
  createdAt: string;
}

export default async function AdminClaims() {
  let items: Claim[] = [];
  try {
    items = (await api<{ items: Claim[] }>("/api/v1/admin/claims")).items;
  } catch {
    items = [];
  }
  const pending = items.filter((c) => c.status === "pending").length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Claims</h1>
      <p className="mt-1 text-muted-foreground">{pending} pending · {items.length} total. Approving grants ownership and promotes the user to a business owner.</p>

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">No claims yet.</p>}
        {items.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link href={`/companies/${c.company.slug}`} className="font-medium hover:text-primary">{c.company.name}</Link>
                <Badge variant="brand">{c.status}</Badge>
                <Badge variant="neutral">{c.company.listingStatus}</Badge>
              </div>
              <ClaimDecision id={c.id} status={c.status} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Claimant: {c.user.fullName ? `${c.user.fullName} · ` : ""}{c.user.email} · Method: {c.method.replace(/_/g, " ")} · {new Date(c.createdAt).toLocaleString()}
            </div>
            <div className="mt-1 overflow-x-auto text-xs text-muted-foreground">Evidence: <code className="tabular">{JSON.stringify(c.evidence)}</code></div>
          </div>
        ))}
      </div>
    </div>
  );
}
