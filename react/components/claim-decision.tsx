"use client";

import { useState } from "react";

export function ClaimDecision({ id, status }: { id: string; status: string }) {
  const [s, setS] = useState(status);
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approved" | "rejected") {
    setBusy(true);
    const res = await fetch(`/api/admin/claims/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision }) });
    setBusy(false);
    if (res.ok) setS(decision);
  }

  if (s !== "pending") return <span className="text-xs font-medium capitalize text-muted-foreground">{s}</span>;
  return (
    <div className="flex gap-2">
      <button onClick={() => decide("approved")} disabled={busy} className="h-8 rounded-md bg-success px-3 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50">Approve</button>
      <button onClick={() => decide("rejected")} disabled={busy} className="h-8 rounded-md border border-border px-3 text-xs hover:bg-muted disabled:opacity-50">Reject</button>
    </div>
  );
}
