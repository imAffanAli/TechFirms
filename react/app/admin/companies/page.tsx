import Link from "next/link";
import { api } from "@/lib/api";
import { CompanyVerify } from "@/components/company-verify";

export const dynamic = "force-dynamic";

interface C { slug: string; name: string; listingStatus: string; verified: boolean; claimed: boolean; source: string | null; ownerEmail: string | null; country: string | null }

export default async function AdminCompanies({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  let items: C[] = [];
  try {
    items = (await api<{ items: C[] }>(`/api/v1/admin/companies${q ? `?search=${encodeURIComponent(q)}` : ""}`)).items;
  } catch {
    items = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
      <p className="mt-1 text-muted-foreground">{items.length} shown. Search and verify.</p>
      <form className="mt-4">
        <input name="q" defaultValue={q ?? ""} placeholder="Search by name…" className="h-9 w-full max-w-xs rounded-md border border-input bg-card px-3 text-sm" />
      </form>
      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">No companies found.</p>}
        {items.map((c) => (
          <div key={c.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 text-sm">
              <Link href={`/companies/${c.slug}`} className="font-medium hover:text-primary">{c.name}</Link>
              <div className="text-xs text-muted-foreground">{c.country ?? "—"} · {c.listingStatus}{c.ownerEmail ? ` · owner ${c.ownerEmail}` : ""} · {c.source}</div>
            </div>
            <CompanyVerify slug={c.slug} verified={c.verified} />
          </div>
        ))}
      </div>
    </div>
  );
}
