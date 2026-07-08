"use client";

import { useState } from "react";

export function SponsorshipToggle({ id, active }: { id: string; active: boolean }) {
  const [on, setOn] = useState(active);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch(`/api/admin/sponsorships/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active: !on }) });
    setBusy(false);
    if (res.ok) setOn(!on);
  }

  return (
    <button onClick={toggle} disabled={busy} className={`h-7 rounded-md px-2.5 text-xs font-medium disabled:opacity-50 ${on ? "border border-border hover:bg-muted" : "bg-success text-white hover:opacity-90"}`}>
      {busy ? "…" : on ? "Deactivate" : "Activate"}
    </button>
  );
}
