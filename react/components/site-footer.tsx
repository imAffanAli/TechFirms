import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block size-4 rounded bg-gradient-to-br from-brand-500 to-violet-600" />
          <span className="font-medium text-foreground">TechFirms</span>
          <span>· the reputation layer for tech companies</span>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/companies" className="hover:text-foreground">Companies</Link>
          <Link href="/leaderboard" className="hover:text-foreground">Leaderboards</Link>
          <Link href="/methodology" className="hover:text-foreground">Methodology</Link>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-6 pb-6 text-xs text-muted-foreground/70">
        Rankings are never for sale — sponsorship never influences the Company Intelligence Score.
      </p>
    </footer>
  );
}
