import { api } from "@/lib/api";
import { UserRow } from "@/components/user-row";

export const dynamic = "force-dynamic";

interface U { id: string; email: string; fullName: string | null; role: string; suspended: boolean; companies: number; createdAt: string }

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  let items: U[] = [];
  try {
    items = (await api<{ items: U[] }>(`/api/v1/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`)).items;
  } catch {
    items = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      <p className="mt-1 text-muted-foreground">{items.length} shown. Change roles or suspend accounts.</p>
      <form className="mt-4">
        <input name="q" defaultValue={q ?? ""} placeholder="Search by email…" className="h-9 w-full max-w-xs rounded-md border border-input bg-card px-3 text-sm" />
      </form>
      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">No users found.</p>}
        {items.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 text-sm">
              <span className="font-medium">{u.email}</span>
              {u.suspended && <span className="ml-2 text-xs font-medium text-danger">suspended</span>}
              <div className="text-xs text-muted-foreground">{u.fullName ? `${u.fullName} · ` : ""}{u.companies} companies · joined {new Date(u.createdAt).toLocaleDateString()}</div>
            </div>
            <UserRow id={u.id} role={u.role} suspended={u.suspended} />
          </div>
        ))}
      </div>
    </div>
  );
}
