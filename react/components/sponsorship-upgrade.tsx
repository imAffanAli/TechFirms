"use client";

import { useEffect, useState } from "react";

interface Duration { planId: string; durationDays: number; priceAmount: number; priceCurrency: string }
interface Tier { tier: string; name: string; blurb: string; benefits: string[]; durations: Duration[] }
interface Order { id: string; tier: string; durationDays: number; amount: number; currency: string; status: string; endsAt: string | null; createdAt: string }

const money = (cents: number) => `$${(cents / 100).toLocaleString()}`;
const durLabel = (d: number) => (d === 365 ? "1 year" : d === 90 ? "3 months" : `${d} days`);

export function SponsorshipUpgrade({ slug }: { slug: string }) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [p, o] = await Promise.all([
      fetch("/api/dashboard/sponsorship/plans").then((r) => (r.ok ? r.json() : { plans: [] })),
      fetch(`/api/dashboard/companies/${slug}/sponsorship/orders`).then((r) => (r.ok ? r.json() : { items: [] })),
    ]);
    const ts: Tier[] = p.plans ?? [];
    setTiers(ts);
    setOrders(o.items ?? []);
    const def: Record<string, string> = {};
    for (const t of ts) {
      const d = t.durations.find((x) => x.durationDays === 30) ?? t.durations[0];
      if (d) def[t.tier] = d.planId;
    }
    setSel(def);
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function order(tier: string) {
    const planId = sel[tier];
    if (!planId) return;
    setBusy(tier); setErr(null); setMsg(null);
    const res = await fetch(`/api/dashboard/companies/${slug}/sponsorship/order`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planId }) });
    const d = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) { setMsg("Request submitted — our team will confirm your invoice and activate it."); void load(); }
    else setErr(d?.error?.message ?? "Couldn't submit the request.");
  }

  const active = orders.find((o) => o.status === "active");
  const pending = orders.find((o) => o.status === "pending");

  return (
    <div>
      <div className="text-sm font-medium">Sponsorship</div>
      <p className="mb-3 text-xs text-muted-foreground">Boost your visibility. Sponsorship is clearly labeled and never affects organic ranking or your Company Intelligence Score.</p>

      {active && <p className="mb-3 rounded-md bg-success/10 p-2 text-xs">Active: <span className="font-medium capitalize">{active.tier.replace("_", " ")}</span> until {active.endsAt ? new Date(active.endsAt).toLocaleDateString() : "—"}.</p>}
      {pending && <p className="mb-3 rounded-md bg-warning/15 p-2 text-xs">Pending approval: <span className="font-medium capitalize">{pending.tier.replace("_", " ")}</span> ({money(pending.amount)}).</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.tier} className="flex flex-col rounded-lg border border-border p-3">
            <div className="font-semibold">{t.name}</div>
            <p className="text-xs text-muted-foreground">{t.blurb}</p>
            <ul className="mt-2 flex-1 space-y-1 text-xs text-muted-foreground">
              {t.benefits.map((b) => <li key={b}>• {b}</li>)}
            </ul>
            <div className="mt-3">
              <select value={sel[t.tier] ?? ""} onChange={(e) => setSel((s) => ({ ...s, [t.tier]: e.target.value }))} className="h-8 w-full rounded-md border border-input bg-card px-2 text-xs">
                {t.durations.map((d) => <option key={d.planId} value={d.planId}>{durLabel(d.durationDays)} — {money(d.priceAmount)}</option>)}
              </select>
              <button disabled={busy === t.tier || !!pending} onClick={() => order(t.tier)} className="mt-2 h-8 w-full rounded-md bg-primary text-xs font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
                {busy === t.tier ? "Submitting…" : pending ? "Order pending" : "Get sponsored"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {msg && <p className="mt-2 text-xs text-success">{msg}</p>}
      {err && <p className="mt-2 text-xs text-danger">{err}</p>}
    </div>
  );
}
