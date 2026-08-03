"use client";

import { useState } from "react";

export function AcceptInviteButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/team/invitations/${token}/accept`, { method: "POST" });
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error?.message ?? "Couldn't accept the invitation.");
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={accept} disabled={busy} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
        {busy ? "Joining…" : "Accept & join"}
      </button>
      {err && <p className="mt-2 text-sm text-danger">{err}</p>}
    </>
  );
}
