import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthNav } from "@/components/auth-nav";

const NAV = [
  { href: "/companies", label: "Companies" },
  { href: "/leaderboard", label: "Leaderboards" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block size-5 rounded bg-gradient-to-br from-brand-500 to-violet-600" />
          <span>TechFirms</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <AuthNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
