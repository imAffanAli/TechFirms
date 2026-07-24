import Link from "next/link";
import { api } from "@/lib/api";
import { ReviewModeration } from "@/components/review-moderation";

export const dynamic = "force-dynamic";

interface HeldClient { id: string; company: { slug: string; name: string }; reviewerName: string | null; rating: number; body: string | null; createdAt: string }
interface HeldEmployee { id: string; company: { slug: string; name: string }; title: string; rating: number; pros: string; cons: string; verified: boolean; createdAt: string }

export default async function AdminReviews() {
  let client: HeldClient[] = [];
  let employee: HeldEmployee[] = [];
  try {
    const data = await api<{ client: HeldClient[]; employee: HeldEmployee[] }>("/api/v1/admin/reviews/held");
    client = data.client ?? [];
    employee = data.employee ?? [];
  } catch {
    /* show empty state */
  }
  const total = client.length + employee.length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Review moderation</h1>
      <p className="mt-1 text-muted-foreground">{total} held for review — first-party reviews flagged by auto-moderation (spam/abuse). Approve to publish, or reject to remove.</p>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Client reviews ({client.length})</h2>
      <div className="mt-3 space-y-3">
        {client.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">Nothing held.</p>}
        {client.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm">
                <Link href={`/companies/${r.company.slug}`} className="font-medium hover:text-primary">{r.company.name}</Link> · {r.reviewerName ?? "Anonymous"} · {r.rating.toFixed(1)}★
              </div>
              <ReviewModeration id={r.id} kind="client" />
            </div>
            {r.body && <p className="mt-2 text-sm text-muted-foreground">“{r.body}”</p>}
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Employee reviews ({employee.length})</h2>
      <div className="mt-3 space-y-3">
        {employee.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">Nothing held.</p>}
        {employee.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm">
                <Link href={`/companies/${r.company.slug}`} className="font-medium hover:text-primary">{r.company.name}</Link> · “{r.title}” · {r.rating.toFixed(1)}★{r.verified ? " · verified" : ""}
              </div>
              <ReviewModeration id={r.id} kind="employee" />
            </div>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="font-medium text-success">Pros:</span> <span className="text-muted-foreground">{r.pros}</span></p>
              <p><span className="font-medium text-danger">Cons:</span> <span className="text-muted-foreground">{r.cons}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
