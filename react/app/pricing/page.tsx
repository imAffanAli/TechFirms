import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — list and grow on TechFirms",
  description: "Free company listings and claims. Optional Featured, Sponsored, and Verified-Plus visibility — rankings are never for sale.",
};

const TIERS = [
  { name: "Listing", price: "Free", tagline: "Every tech company, indexed.", features: ["Public profile & Company Intelligence Score", "Customer reviews & trust signals", "Appears in directory & leaderboards"], cta: { label: "Browse directory", href: "/companies" } },
  { name: "Claim", price: "Free", tagline: "Take control of your profile.", features: ["Edit your profile & respond to reviews", "Business dashboard & incoming leads", "Invite clients for verified reviews"], cta: { label: "Find & claim your company", href: "/companies" }, highlight: true },
  { name: "Featured", price: "$49–99/mo", tagline: "Stand out with a badge.", features: ["Featured badge on your card", "Priority in category pages", "Everything in Claim"], cta: { label: "Contact sales", href: "mailto:sales@techfirms.com" } },
  { name: "Sponsored", price: "$300–1,500/mo", tagline: "Top-of-directory placement.", features: ["Labeled slot above organic results", "Scoped by country and/or service", "Impression & click reporting"], cta: { label: "Contact sales", href: "mailto:sales@techfirms.com" } },
  { name: "Verified-Plus", price: "$199–399/mo", tagline: "Deeper trust verification.", features: ["Verified-Plus badge", "Company vetting & credit check", "Everything in Featured"], cta: { label: "Contact sales", href: "mailto:sales@techfirms.com" } },
  { name: "Pay-per-lead", price: "$40–150 / lead", tagline: "Only pay for qualified leads.", features: ["No monthly fee", "Qualified, deduped project briefs", "Rate lead quality — refunds on bad leads"], cta: { label: "Contact sales", href: "mailto:sales@techfirms.com" } },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Listings and claims are free. Optional paid tiers add visibility — but <strong>rankings are never for sale</strong>: sponsored placements are always labeled and never influence the Company Intelligence Score or organic order.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className={`flex flex-col rounded-xl border p-5 ${t.highlight ? "border-primary ring-1 ring-primary/30" : "border-border"} bg-card`}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <span className="tabular text-sm font-semibold text-primary">{t.price}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-brand-600" /> <span>{f}</span></li>
              ))}
            </ul>
            <Link href={t.cta.href} className={`mt-5 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium ${t.highlight ? "bg-primary text-primary-foreground hover:bg-brand-800" : "border border-border hover:bg-muted"}`}>{t.cta.label}</Link>
          </div>
        ))}
      </div>

      <p className="mt-8 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Prices are indicative and being validated. Regional pricing applies (Gulf markets ~1.3–1.5×, Pakistan ~40–50% of global). See <Link href="/methodology" className="text-primary hover:underline">how ranking works</Link> — sponsorship and rank are strictly separate.
      </p>
    </main>
  );
}
