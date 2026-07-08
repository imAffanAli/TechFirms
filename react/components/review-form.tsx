"use client";

import { useState } from "react";

const RATINGS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];
const field = "mt-1 h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const DIMS: { key: "ratingQuality" | "ratingSchedule" | "ratingCost" | "ratingWillingToRefer"; label: string }[] = [
  { key: "ratingQuality", label: "Quality" },
  { key: "ratingSchedule", label: "Schedule" },
  { key: "ratingCost", label: "Cost" },
  { key: "ratingWillingToRefer", label: "Willing to refer" },
];

export function ReviewForm({ token }: { token: string }) {
  const [f, setF] = useState({ reviewerName: "", reviewerTitle: "", reviewerCompany: "", ratingQuality: "5", ratingSchedule: "5", ratingCost: "5", ratingWillingToRefer: "5", body: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const payload = {
      reviewerName: f.reviewerName,
      reviewerTitle: f.reviewerTitle || undefined,
      reviewerCompany: f.reviewerCompany || undefined,
      ratingQuality: Number(f.ratingQuality),
      ratingSchedule: Number(f.ratingSchedule),
      ratingCost: Number(f.ratingCost),
      ratingWillingToRefer: Number(f.ratingWillingToRefer),
      body: f.body,
    };
    const res = await fetch(`/api/reviews/${token}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setState("done");
    else { setError(data?.error?.message ?? "Something went wrong"); setState("error"); }
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-brand-600/30 bg-brand-50 p-5 dark:bg-brand-950/40">
        <h3 className="font-semibold">Thank you ✓</h3>
        <p className="mt-1 text-sm text-muted-foreground">Your verified review has been published.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Your name</label>
          <input required value={f.reviewerName} onChange={on("reviewerName")} className={field} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <input value={f.reviewerTitle} onChange={on("reviewerTitle")} className={field} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Your company</label>
        <input value={f.reviewerCompany} onChange={on("reviewerCompany")} className={field} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DIMS.map((d) => (
          <div key={d.key}>
            <label className="text-xs font-medium text-muted-foreground">{d.label}</label>
            <select value={f[d.key]} onChange={on(d.key)} className={field}>
              {RATINGS.map((r) => <option key={r} value={r}>{r.toFixed(1)}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Your review</label>
        <textarea required value={f.body} onChange={on("body")} rows={4} placeholder="Describe the project and your experience…" className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
        {state === "loading" ? "Submitting…" : "Submit verified review"}
      </button>
    </form>
  );
}
