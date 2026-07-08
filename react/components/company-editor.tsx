"use client";

import { useState } from "react";

interface Owned {
  slug: string;
  tagline: string | null;
  description: string | null;
  website: string | null;
  foundedYear: number | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  minProjectSize: number | null;
  rateCurrency: string;
}
const field = "mt-1 h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CompanyEditor({ company }: { company: Owned }) {
  const [f, setF] = useState({
    tagline: company.tagline ?? "",
    description: company.description ?? "",
    website: company.website ?? "",
    foundedYear: company.foundedYear?.toString() ?? "",
    hourlyRateMin: company.hourlyRateMin?.toString() ?? "",
    hourlyRateMax: company.hourlyRateMax?.toString() ?? "",
    minProjectSize: company.minProjectSize?.toString() ?? "",
  });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF((s) => ({ ...s, [k]: e.target.value })); setState("idle"); };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);
    const payload: Record<string, unknown> = { tagline: f.tagline, description: f.description };
    if (f.website) payload.website = f.website;
    if (f.foundedYear) payload.foundedYear = Number(f.foundedYear);
    if (f.hourlyRateMin) payload.hourlyRateMin = Number(f.hourlyRateMin);
    if (f.hourlyRateMax) payload.hourlyRateMax = Number(f.hourlyRateMax);
    if (f.minProjectSize) payload.minProjectSize = Number(f.minProjectSize);
    const res = await fetch(`/api/dashboard/companies/${company.slug}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setState("saved");
    else { setError(data?.error?.message ?? "Save failed"); setState("error"); }
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Tagline</label>
        <input value={f.tagline} onChange={on("tagline")} className={field} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <textarea value={f.description} onChange={on("description")} rows={3} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Website</label>
          <input value={f.website} onChange={on("website")} placeholder="https://…" className={field} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Founded year</label>
          <input type="number" value={f.foundedYear} onChange={on("foundedYear")} className={field} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Rate min ({company.rateCurrency})</label>
          <input type="number" value={f.hourlyRateMin} onChange={on("hourlyRateMin")} className={field} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Rate max</label>
          <input type="number" value={f.hourlyRateMax} onChange={on("hourlyRateMax")} className={field} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Min project</label>
          <input type="number" value={f.minProjectSize} onChange={on("minProjectSize")} className={field} />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={state === "saving"} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}
