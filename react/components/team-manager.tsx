"use client";

import { useEffect, useState } from "react";

interface Member { id: string; email: string; fullName: string | null; role: string; status: string }
interface Invite { id: string; email: string; role: string; token: string; expiresAt: string }
interface TeamData { myRole: string; members: Member[]; invitations: Invite[] }

const inputCls = "h-9 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TeamManager({ slug }: { slug: string }) {
  const [data, setData] = useState<TeamData | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/dashboard/companies/${slug}/team`);
    if (res.ok) setData(await res.json());
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const isOwner = data?.myRole === "owner";

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setLink(null);
    const res = await fetch(`/api/dashboard/companies/${slug}/team/invite`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, role }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && d.token) { setLink(`${window.location.origin}/team/accept/${d.token}`); setEmail(""); void load(); }
    else setErr(d?.error?.message ?? "Couldn't send the invite.");
  }
  async function changeRole(id: string, r: string) {
    await fetch(`/api/dashboard/companies/${slug}/team/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: r }) });
    void load();
  }
  async function remove(id: string) {
    await fetch(`/api/dashboard/companies/${slug}/team/${id}`, { method: "DELETE" });
    void load();
  }
  async function revoke(id: string) {
    await fetch(`/api/dashboard/companies/${slug}/invitations/${id}`, { method: "DELETE" });
    void load();
  }

  if (!data) return null;

  return (
    <div>
      <div className="text-sm font-medium">Team</div>
      <p className="mb-2 text-xs text-muted-foreground">Owners can invite managers to help run this profile.</p>

      <div className="space-y-2">
        {data.members.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span className="min-w-0 truncate">{m.fullName ? `${m.fullName} · ` : ""}{m.email}</span>
            <span className="flex items-center gap-2">
              {isOwner && m.role !== "owner" ? (
                <>
                  <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} className={`${inputCls} h-8 text-xs`}>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button onClick={() => remove(m.id)} className="text-xs text-danger hover:underline">Remove</button>
                </>
              ) : (
                <span className="rounded bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">{m.role}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {data.invitations.length > 0 && (
        <div className="mt-2 space-y-1">
          {data.invitations.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Pending: {i.email} ({i.role})</span>
              {isOwner && <button onClick={() => revoke(i.id)} className="hover:underline">Revoke</button>}
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <>
          <form onSubmit={invite} className="mt-3 flex flex-wrap items-end gap-2">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@email.com" className={`${inputCls} min-w-0 flex-1`} />
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
              <option value="manager">Manager</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button disabled={busy} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">Invite</button>
          </form>
          {err && <p className="mt-1 text-xs text-danger">{err}</p>}
          {link && (
            <p className="mt-2 break-all rounded-md bg-muted p-2 text-xs">
              Share this link with them to join: <span className="font-mono">{link}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
