"use client";

import { useState } from "react";

export function UserRow({ id, role, suspended }: { id: string; role: string; suspended: boolean }) {
  const [r, setR] = useState(role);
  const [susp, setSusp] = useState(suspended);
  const [busy, setBusy] = useState(false);

  async function patch(body: object) {
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    return res.ok;
  }
  async function changeRole(v: string) {
    if (await patch({ role: v })) setR(v);
  }
  async function toggleSuspend() {
    const next = !susp;
    if (await patch({ suspended: next })) setSusp(next);
  }

  return (
    <div className="flex items-center gap-2">
      <select value={r} disabled={busy} onChange={(e) => changeRole(e.target.value)} className="h-8 rounded-md border border-input bg-card px-2 text-xs">
        <option value="visitor">Visitor</option>
        <option value="business_owner">Business owner</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super admin</option>
      </select>
      <button onClick={toggleSuspend} disabled={busy} className={`h-8 rounded-md border px-3 text-xs hover:bg-muted disabled:opacity-50 ${susp ? "border-success text-success" : "border-border text-danger"}`}>
        {susp ? "Unsuspend" : "Suspend"}
      </button>
    </div>
  );
}
