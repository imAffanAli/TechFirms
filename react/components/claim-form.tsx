"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ClaimForm({ slug, companyName }: { slug: string; companyName: string }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [method, setMethod] = useState<"work_email_domain" | "dns_txt">("work_email_domain");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => setAuthed(!!d.user)).catch(() => setAuthed(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const res = await fetch("/api/claims", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ companySlug: slug, method }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setToken(data.token ?? null);
      setState("done");
    } else {
      setError(data?.error?.message ?? "Something went wrong");
      setState("error");
    }
  }

  if (authed === null) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!authed) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-left">
        <p className="text-sm">You need a TechFirms account to claim this profile.</p>
        <Link href={`/login?next=/claim/${slug}`} className="mt-3 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-800">Sign in to continue</Link>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-brand-600/30 bg-brand-50 p-5 text-left dark:bg-brand-950/40">
        <h3 className="font-semibold">Claim submitted ✓</h3>
        <p className="mt-1 text-sm text-muted-foreground">Your claim for {companyName} is pending admin review. You&apos;ll get access to the business dashboard once it&apos;s approved.</p>
        {token && (
          <div className="mt-3 text-sm">
            <p className="text-muted-foreground">To verify via DNS, add this TXT record to your domain, then it will be checked on approval:</p>
            <code className="tabular mt-1 block overflow-x-auto rounded bg-muted p-2">{token}</code>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" checked={method === "work_email_domain"} onChange={() => setMethod("work_email_domain")} className="mt-1" />
          <span><span className="font-medium">Work email</span> — verify that your email domain matches the company&apos;s website domain.</span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" checked={method === "dns_txt"} onChange={() => setMethod("dns_txt")} className="mt-1" />
          <span><span className="font-medium">DNS TXT record</span> — prove control of the domain by adding a TXT record.</span>
        </label>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
        {state === "loading" ? "Submitting…" : "Submit claim"}
      </button>
    </form>
  );
}
