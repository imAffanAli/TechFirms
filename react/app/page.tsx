import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, Sparkles, Trophy } from "lucide-react";

const SIGNALS = [
  { icon: ShieldCheck, title: "Trust signals", desc: "Domain age, funding, certifications & social proof." },
  { icon: Trophy, title: "Country leaderboards", desc: "Gartner-style quadrants, ranked per country & service." },
  { icon: Sparkles, title: "Intelligence Score", desc: "A deterministic 0–100 CIS, narrated by AI — never for sale." },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-brand-500" /> Now indexing Saudi Arabia · UAE · Pakistan
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          The reputation layer for{" "}
          <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
            technology companies
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Customer reviews, employee sentiment, and public trust signals — combined into one AI-computed
          Company Intelligence Score, and ranked into country leaderboards.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg">
            <Search /> Find the right tech partner
          </Button>
          <Button size="lg" variant="outline">
            View leaderboards
          </Button>
        </div>
      </section>

      {/* Signal cards */}
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-20 sm:grid-cols-3">
        {SIGNALS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-6 text-left">
            <Icon className="text-brand-600" />
            <h3 className="mt-3 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      {/* Scaffold note — remove once real pages land (see docs/19-build-sequence.md) */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        TechFirms · scaffold home · design tokens from{" "}
        <code className="tabular">docs/03-design-system.md</code>
      </footer>
    </main>
  );
}
