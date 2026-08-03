"use client";

import { useState } from "react";

export function CompanyVerify({ slug, verified }: { slug: string; verified: boolean }) {
  const [v, setV] = useState(verified);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch(`/api/admin/companies/${slug}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ verified: !v }) });
    setBusy(false);
    if (res.ok) setV(!v);
  }

  return (
    <button onClick={toggle} disabled={busy} className={`h-8 rounded-md border px-3 text-xs hover:bg-muted disabled:opacity-50 ${v ? "border-success text-success" : "border-border"}`}>
      {v ? "Verified ✓ — unset" : "Verify"}
    </button>
  );
}
