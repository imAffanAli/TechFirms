import Link from "next/link";
import { api } from "@/lib/api";
import { OrderDecision } from "@/components/order-decision";

export const dynamic = "force-dynamic";

interface Order {
  id: string;
  company: { slug: string; name: string };
  tier: string;
  durationDays: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  endsAt: string | null;
  createdAt: string;
}

const money = (c: number) => `$${(c / 100).toLocaleString()}`;
const dur = (d: number) => (d === 365 ? "1 year" : d === 90 ? "3 months" : `${d} days`);

export default async function AdminSponsorshipOrders() {
  let items: Order[] = [];
  try {
    items = (await api<{ items: Order[] }>("/api/v1/admin/sponsorship-orders")).items;
  } catch {
    items = [];
  }
  const pending = items.filter((o) => o.status === "pending").length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Sponsorship orders</h1>
      <p className="mt-1 text-muted-foreground">{pending} pending · {items.length} total. Approving creates the live, clearly-labeled sponsorship with start/end dates. Payment is handled manually (invoice) for now.</p>

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">No sponsorship orders yet.</p>}
        {items.map((o) => (
          <div key={o.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm">
                <Link href={`/companies/${o.company.slug}`} className="font-medium hover:text-primary">{o.company.name}</Link>
                {" · "}
                <span className="capitalize">{o.tier.replace("_", " ")}</span>
                {" · "}
                {dur(o.durationDays)} · {money(o.amount)} · <span className="capitalize text-muted-foreground">{o.status}</span>
              </div>
              {o.status === "pending" ? (
                <OrderDecision id={o.id} />
              ) : (
                o.endsAt && <span className="text-xs text-muted-foreground">until {new Date(o.endsAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
