import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

// Live + future admin sections.
const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/queries", label: "Queries" },
  { href: "/admin/claims", label: "Claims" },
];
const SOON = ["Companies", "Reviews"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!isAdmin(user)) redirect("/login?next=/admin");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-8">
      <aside className="w-44 shrink-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</div>
        <nav className="mt-3 space-y-1 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-md px-3 py-1.5 font-medium hover:bg-muted">{l.label}</Link>
          ))}
          {SOON.map((label) => (
            <span key={label} className="flex items-center justify-between rounded-md px-3 py-1.5 text-muted-foreground/60">
              {label} <span className="text-[10px] uppercase">soon</span>
            </span>
          ))}
        </nav>
        <p className="mt-4 px-3 text-xs text-muted-foreground/70">Signed in as {user?.email}</p>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
