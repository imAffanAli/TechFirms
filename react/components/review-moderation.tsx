"use client";

import { useState } from "react";

export function ReviewModeration({ id, kind }: { id: string; kind: "client" | "employee" }) {
  const [done, setDone] = useState<null | "approve" | "reject">(null);
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approve" | "reject") {
    setBusy(true);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, decision }) });
    setBusy(false);
    if (res.ok) setDone(decision);
  }

  if (done) return <span className="text-xs font-medium text-muted-foreground">{done === "approve" ? "Approved ✓" : "Rejected"}</span>;
  return (
    <div className="flex gap-2">
      <button onClick={() => decide("approve")} disabled={busy} className="h-8 rounded-md bg-success px-3 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50">Approve</button>
      <button onClick={() => decide("reject")} disabled={busy} className="h-8 rounded-md border border-border px-3 text-xs hover:bg-muted disabled:opacity-50">Reject</button>
    </div>
  );
}
