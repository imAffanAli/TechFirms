import Link from "next/link";
import { Search, ShieldCheck, Sparkles, Trophy, ArrowRight } from "lucide-react";

const SIGNALS = [
  { icon: ShieldCheck, title: "Trust signals", desc: "Domain age, funding, certifications & social proof." },
  { icon: Trophy, title: "Country leaderboards", desc: "Gartner-style quadrants, ranked per country & service." },
  { icon: Sparkles, title: "Intelligence Score", desc: "A deterministic 0–100 CIS, narrated by AI — never for sale." },
];

const FEATURED = [
  { href: "/leaderboard/saudi-arabia/ai-development", label: "AI Development · Saudi Arabia" },
  { href: "/leaderboard/united-arab-emirates/custom-software", label: "Custom Software · UAE" },
  { href: "/leaderboard/pakistan/web-development", label: "Web Development · Pakistan" },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-14 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-brand-500" /> Now indexing Saudi Arabia · UAE · Pakistan
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          The reputation layer for{" "}
          <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">technology companies</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Customer reviews, employee sentiment, and public trust signals — combined into one AI-computed Company Intelligence Score, and ranked into country leaderboards.
        </p>

        <form action="/companies" className="mx-auto mt-8 flex max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              placeholder="Search 'AI development', 'cloud', a company…"
              className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-brand-800">
            Search
          </button>
        </form>

        <p className="mt-3 text-sm text-muted-foreground">
          Not sure where to start? <Link href="/get-quote" className="font-medium text-primary hover:underline">Tell us your project and get matched →</Link>
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Featured:</span>
          {FEATURED.map((f) => (
            <Link key={f.href} href={f.href} className="rounded-full border border-border px-3 py-1 hover:border-primary hover:text-primary">
              {f.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-10 sm:grid-cols-3">
        {SIGNALS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-6 text-left">
            <Icon className="text-brand-600" />
            <h3 className="mt-3 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
        <Link href="/companies" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          Browse the full directory <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
