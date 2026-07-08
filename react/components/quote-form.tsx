"use client";

import { useState } from "react";
import Link from "next/link";
import type { ServiceItem, CountryItem } from "@/lib/types";

type Matched = { slug: string; name: string; rank: number; cis: number | null };
const field = "mt-1 h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function QuoteForm({
  mode,
  companySlug,
  companyName,
  services = [],
  countries = [],
}: {
  mode: "direct" | "matched";
  companySlug?: string;
  companyName?: string;
  services?: ServiceItem[];
  countries?: CountryItem[];
}) {
  const [f, setF] = useState({ projectType: "", serviceSlug: "", countrySlug: "", budgetMin: "", budgetMax: "", timeline: "", description: "", contactName: "", contactEmail: "", contactPhone: "", website: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [matches, setMatches] = useState<Matched[]>([]);
  const [error, setError] = useState<string | null>(null);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const payload: Record<string, unknown> = {
      projectType: f.projectType,
      description: f.description,
      contactName: f.contactName,
      contactEmail: f.contactEmail,
      contactPhone: f.contactPhone || undefined,
      timeline: f.timeline || undefined,
      website: f.website,
    };
    if (f.budgetMin) payload.budgetMin = Number(f.budgetMin);
    if (f.budgetMax) payload.budgetMax = Number(f.budgetMax);
    if (mode === "direct") payload.directCompanySlug = companySlug;
    else {
      payload.serviceSlug = f.serviceSlug || undefined;
      payload.countrySlug = f.countrySlug || undefined;
    }
    const res = await fetch("/api/queries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMatches(data.matches ?? []);
      setState("done");
    } else {
      setError(data?.error?.message ?? "Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-brand-600/30 bg-brand-50 p-5 dark:bg-brand-950/40">
        <h3 className="font-semibold">Request sent ✓</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "direct" ? `Your brief was sent to ${companyName} and the TechFirms team. They typically respond within a few business days.` : "We routed your brief to the best-matched firms and the TechFirms team."}
        </p>
        {matches.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-medium">Matched firms</div>
            <ul className="mt-1 space-y-1 text-sm">
              {matches.map((m) => (
                <li key={m.slug}>
                  #{m.rank} <Link href={`/companies/${m.slug}`} className="text-primary hover:underline">{m.name}</Link>
                  {m.cis != null && <span className="text-muted-foreground"> · CIS {m.cis}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* honeypot */}
      <input type="text" name="website" value={f.website} onChange={on("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div>
        <label className="text-sm font-medium">Project type</label>
        <input required value={f.projectType} onChange={on("projectType")} placeholder="e.g. Mobile app, AI chatbot, cloud migration" className={field} />
      </div>

      {mode === "matched" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Service</label>
            <select value={f.serviceSlug} onChange={on("serviceSlug")} className={field}>
              <option value="">Any service</option>
              {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Country</label>
            <select value={f.countrySlug} onChange={on("countrySlug")} className={field}>
              <option value="">Any country</option>
              {countries.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Budget min (USD)</label>
          <input type="number" min={0} value={f.budgetMin} onChange={on("budgetMin")} placeholder="10000" className={field} />
        </div>
        <div>
          <label className="text-sm font-medium">Budget max (USD)</label>
          <input type="number" min={0} value={f.budgetMax} onChange={on("budgetMax")} placeholder="50000" className={field} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Timeline</label>
        <input value={f.timeline} onChange={on("timeline")} placeholder="e.g. 3 months, ASAP" className={field} />
      </div>

      <div>
        <label className="text-sm font-medium">Project details</label>
        <textarea required value={f.description} onChange={on("description")} rows={4} placeholder="Describe your project, goals, and requirements…" className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Your name</label>
          <input required value={f.contactName} onChange={on("contactName")} className={field} />
        </div>
        <div>
          <label className="text-sm font-medium">Work email</label>
          <input type="email" required value={f.contactEmail} onChange={on("contactEmail")} className={field} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Phone (optional)</label>
        <input value={f.contactPhone} onChange={on("contactPhone")} className={field} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
        {state === "loading" ? "Sending…" : mode === "direct" ? `Send to ${companyName ?? "this company"}` : "Get matched"}
      </button>
      <p className="text-center text-xs text-muted-foreground">No spam. Your details go only to matched firms and the TechFirms team.</p>
    </form>
  );
}
