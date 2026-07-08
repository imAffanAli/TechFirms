"use client";

import { useState } from "react";

const STATUSES = ["New", "Forwarded", "Contacted", "Closed"] as const;

export function QueryStatusControl({ id, status, notes }: { id: string; status: string; notes: string | null }) {
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/queries/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: s, adminNotes: n }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={s} onChange={(e) => { setS(e.target.value); setSaved(false); }} className="h-8 rounded-md border border-input bg-card px-2 text-xs">
        {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <input value={n} onChange={(e) => { setN(e.target.value); setSaved(false); }} placeholder="Notes…" className="h-8 min-w-40 flex-1 rounded-md border border-input bg-card px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <button onClick={save} disabled={saving} className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
        {saving ? "…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}
