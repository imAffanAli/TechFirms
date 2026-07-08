"use client";

import { useState } from "react";

export function InviteForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/dashboard/companies/${slug}/invitations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientEmail: email, clientName: name || undefined }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setLink(`${window.location.origin}${data.link}`);
      setEmail("");
      setName("");
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1">
          <label className="text-xs font-medium text-muted-foreground">Client email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <div className="min-w-32 flex-1">
          <label className="text-xs font-medium text-muted-foreground">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <button type="submit" disabled={loading} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">{loading ? "…" : "Create link"}</button>
      </form>
      {link && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2 text-xs">
          <code className="tabular flex-1 overflow-x-auto">{link}</code>
          <button onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); }} className="shrink-0 rounded bg-card px-2 py-1 hover:bg-border">{copied ? "Copied" : "Copy"}</button>
        </div>
      )}
    </div>
  );
}
