"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIERS = [
  { value: "sponsored", label: "Sponsored (top-of-directory slot)" },
  { value: "featured", label: "Featured (badge)" },
  { value: "verified_plus", label: "Verified-Plus (badge)" },
];
const CATEGORIES = ["ai_development", "custom_software", "web_development", "mobile_app_development", "cloud", "devops", "data_engineering", "cybersecurity", "it_staff_augmentation", "ui_ux_design"];
const field = "mt-1 h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SponsorshipCreator() {
  const router = useRouter();
  const [f, setF] = useState({ companySlug: "", tier: "sponsored", countrySlug: "", serviceCategory: "", slotRank: "", priceAmount: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const payload: Record<string, unknown> = { companySlug: f.companySlug.trim(), tier: f.tier };
    if (f.countrySlug) payload.countrySlug = f.countrySlug.trim();
    if (f.serviceCategory) payload.serviceCategory = f.serviceCategory;
    if (f.slotRank) payload.slotRank = Number(f.slotRank);
    if (f.priceAmount) payload.priceAmount = Number(f.priceAmount);
    const res = await fetch("/api/admin/sponsorships", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    if (res.ok) {
      setMsg("Placement created ✓");
      setF({ ...f, companySlug: "" });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg(d?.error?.message ?? "Failed");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Company slug</label>
          <input required value={f.companySlug} onChange={on("companySlug")} placeholder="e.g. systems-limited" className={field} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tier</label>
          <select value={f.tier} onChange={on("tier")} className={field}>{TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Country slug (optional)</label>
          <input value={f.countrySlug} onChange={on("countrySlug")} placeholder="pakistan" className={field} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Service category (optional)</label>
          <select value={f.serviceCategory} onChange={on("serviceCategory")} className={field}>
            <option value="">Any</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Slot rank (optional)</label>
          <input type="number" value={f.slotRank} onChange={on("slotRank")} placeholder="1" className={field} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Price / mo (optional)</label>
          <input type="number" value={f.priceAmount} onChange={on("priceAmount")} placeholder="500" className={field} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={busy} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">{busy ? "…" : "Create placement"}</button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </form>
  );
}
