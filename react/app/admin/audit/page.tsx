import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

interface A { id: string; action: string; entityType: string; entityId: string; actor: string | null; createdAt: string }

export default async function AdminAudit() {
  let items: A[] = [];
  try {
    items = (await api<{ items: A[] }>("/api/v1/admin/audit")).items;
  } catch {
    items = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
      <p className="mt-1 text-muted-foreground">Recent admin + moderation actions (latest 100).</p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">When</th><th className="p-2">Actor</th><th className="p-2">Action</th><th className="p-2">Entity</th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="whitespace-nowrap p-2 text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="p-2">{a.actor ?? "—"}</td>
                <td className="p-2 font-medium">{a.action}</td>
                <td className="p-2 text-muted-foreground">{a.entityType} {a.entityId.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="p-6 text-muted-foreground">No audit entries yet.</p>}
      </div>
    </div>
  );
}
