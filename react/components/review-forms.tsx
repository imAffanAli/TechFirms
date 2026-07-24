"use client";

import { useState } from "react";

const field = "mt-1 h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const area = "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const doneBox = "rounded-lg border border-brand-600/30 bg-brand-50 p-4 text-sm dark:bg-brand-950/40";

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-1 flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={`text-2xl leading-none transition-colors ${n <= value ? "text-amber-400" : "text-muted-foreground/30"} hover:text-amber-400`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function EmployeeReviewForm({ slug, companyName }: { slug: string; companyName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [f, setF] = useState({ title: "", pros: "", cons: "", role: "", isCurrent: "current", workEmail: "", website: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ verified?: boolean; held?: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) { setError("Please pick a star rating."); return; }
    setState("loading"); setError(null);
    const payload = {
      rating, title: f.title, pros: f.pros, cons: f.cons,
      role: f.role || undefined, isCurrentEmployee: f.isCurrent === "current",
      workEmail: f.workEmail || undefined, website: f.website,
    };
    const res = await fetch(`/api/companies/${slug}/employee-reviews`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setResult(data); setState("done"); }
    else { setError(data?.error?.message ?? "Something went wrong. Please try again."); setState("error"); }
  }

  if (state === "done") {
    return (
      <div className={doneBox}>
        <div className="font-semibold">Thanks for your review ✓</div>
        <p className="mt-1 text-muted-foreground">
          {result.held ? "It's been submitted and will appear once it clears moderation." : "It's now live on the profile."}
          {result.verified ? " Your work email matched the company domain — it's marked a verified employee review." : ""}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
        Write an employee review
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="text-sm font-semibold">Review working at {companyName}</div>
      <input type="text" value={f.website} onChange={on("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label className="text-sm font-medium">Overall rating</label>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="text-sm font-medium">Headline</label>
        <input required value={f.title} onChange={on("title")} placeholder="e.g. Great learning culture, fast-paced" className={field} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Pros</label>
          <textarea required rows={3} value={f.pros} onChange={on("pros")} placeholder="What's good about working here?" className={area} />
        </div>
        <div>
          <label className="text-sm font-medium">Cons</label>
          <textarea required rows={3} value={f.cons} onChange={on("cons")} placeholder="What could be better?" className={area} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Your role (optional)</label>
          <input value={f.role} onChange={on("role")} placeholder="e.g. Software Engineer" className={field} />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select value={f.isCurrent} onChange={on("isCurrent")} className={field}>
            <option value="current">Current employee</option>
            <option value="former">Former employee</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Work email (optional — earns a &quot;Verified employee&quot; badge)</label>
        <input type="email" value={f.workEmail} onChange={on("workEmail")} placeholder="you@company.com" className={field} />
        <p className="mt-1 text-xs text-muted-foreground">Only used to check your email domain matches the company. Your review stays anonymous.</p>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={state === "loading"} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
          {state === "loading" ? "Submitting…" : "Submit review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm hover:bg-muted">Cancel</button>
      </div>
      <p className="text-xs text-muted-foreground">Reviews are checked for spam and abuse before publishing.</p>
    </form>
  );
}

export function ClientReviewForm({ slug, companyName }: { slug: string; companyName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [f, setF] = useState({ reviewerName: "", reviewerTitle: "", reviewerCompany: "", body: "", website: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [held, setHeld] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) { setError("Please pick a star rating."); return; }
    setState("loading"); setError(null);
    const payload = { reviewerName: f.reviewerName, reviewerTitle: f.reviewerTitle || undefined, reviewerCompany: f.reviewerCompany || undefined, rating, body: f.body, website: f.website };
    const res = await fetch(`/api/companies/${slug}/reviews`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setHeld(!!data.held); setState("done"); }
    else { setError(data?.error?.message ?? "Something went wrong. Please try again."); setState("error"); }
  }

  if (state === "done") {
    return (
      <div className={doneBox}>
        <div className="font-semibold">Thanks for your review ✓</div>
        <p className="mt-1 text-muted-foreground">{held ? "It's been submitted and will appear once it clears moderation." : "It's now live on the profile."}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
        Write a review
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="text-sm font-semibold">Review {companyName}</div>
      <input type="text" value={f.website} onChange={on("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label className="text-sm font-medium">Overall rating</label>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="text-sm font-medium">Your name</label><input required value={f.reviewerName} onChange={on("reviewerName")} className={field} /></div>
        <div><label className="text-sm font-medium">Title (optional)</label><input value={f.reviewerTitle} onChange={on("reviewerTitle")} className={field} /></div>
        <div><label className="text-sm font-medium">Company (optional)</label><input value={f.reviewerCompany} onChange={on("reviewerCompany")} className={field} /></div>
      </div>
      <div>
        <label className="text-sm font-medium">Your review</label>
        <textarea required rows={4} value={f.body} onChange={on("body")} placeholder={`What was it like working with ${companyName}?`} className={area} />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={state === "loading"} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
          {state === "loading" ? "Submitting…" : "Submit review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm hover:bg-muted">Cancel</button>
      </div>
      <p className="text-xs text-muted-foreground">Reviews are checked for spam and abuse before publishing.</p>
    </form>
  );
}
