import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanies, getServices, getCountries } from "@/lib/data";
import { fmtRate } from "@/lib/format";
import { StarRating } from "@/components/star-rating";

export const dynamic = "force-dynamic";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const now = { m: "July", y: 2026 }; // stamped; refreshed by the monthly regen job

function parse(slug: string): { service: string; country: string } | null {
  const m = slug.match(/^best-(.+)-companies-in-(.+)$/);
  return m ? { service: m[1]!, country: m[2]! } : null;
}

async function resolve(slug: string) {
  const p = parse(slug);
  if (!p) return null;
  const [services, countries] = await Promise.all([getServices(), getCountries()]);
  const service = services.find((s) => s.slug === p.service);
  const country = countries.find((c) => c.slug === p.country);
  if (!service || !country) return null;
  const data = await getCompanies({ service: p.service, country: p.country, sort: "cis", pageSize: "12" });
  return { service, country, data };
}

export async function generateMetadata({ params }: { params: Promise<{ pseo: string }> }): Promise<Metadata> {
  const { pseo } = await params;
  const r = await resolve(pseo);
  if (!r) return { title: "Not found" };
  const title = `Top ${r.service.name} Companies in ${r.country.name} — ${now.m} ${now.y}`;
  return { title, description: `The best ${r.service.name.toLowerCase()} companies in ${r.country.name}, ranked by TechFirms' Company Intelligence Score. Compare ${r.data?.total ?? 0} verified firms by rating, reviews, and price.` };
}

export default async function ProgrammaticPage({ params }: { params: Promise<{ pseo: string }> }) {
  const { pseo } = await params;
  const r = await resolve(pseo);
  if (!r) notFound();
  const { service, country, data } = r;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const top3 = items.slice(0, 3).map((c, i) => `${i + 1}) ${c.name}`).join(", ");

  const rates = items.map((c) => [c.hourlyRateMin, c.hourlyRateMax]).flat().filter((x): x is number => x != null);
  const cur = items[0]?.rateCurrency ?? "USD";
  const rateRange = rates.length ? fmtRate(Math.min(...rates), Math.max(...rates), cur) : null;
  const avgRating = items.length ? (items.reduce((a, c) => a + (c.rating ?? 0), 0) / items.filter((c) => c.rating != null).length).toFixed(1) : null;

  const answer = total
    ? `As of ${now.m} ${now.y}, the top ${service.name.toLowerCase()} companies in ${country.name}, ranked by TechFirms' Company Intelligence Score (customer reviews, employee sentiment, and trust signals), are: ${top3}. TechFirms tracks ${total} ${service.name.toLowerCase()} ${total === 1 ? "company" : "companies"} in ${country.name}.`
    : `TechFirms does not yet track enough ${service.name.toLowerCase()} companies in ${country.name} to publish a ranking.`;

  const faqs = [
    { q: `How are the top ${service.name.toLowerCase()} companies in ${country.name} ranked?`, a: `Each company gets a Company Intelligence Score (0–100) — a deterministic composite of customer reviews (40%), employee sentiment (25%), public trust signals (20%), and market activity (15%). Rankings are never for sale. See the methodology for details.` },
    { q: `How many ${service.name.toLowerCase()} companies are in ${country.name}?`, a: `TechFirms currently tracks ${total} ${service.name.toLowerCase()} ${total === 1 ? "company" : "companies"} in ${country.name}${avgRating ? `, with an average client rating of ${avgRating}/5 among the top firms` : ""}.` },
    ...(rateRange ? [{ q: `What does a ${service.name.toLowerCase()} project cost in ${country.name}?`, a: `Hourly rates among the top ${service.name.toLowerCase()} companies in ${country.name} typically range ${rateRange}. Actual project cost depends on scope, team size, and timeline.` }] : []),
  ];

  const ld = [
    { "@context": "https://schema.org", "@type": "ItemList", name: `Top ${service.name} Companies in ${country.name}`, itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: `https://techfirms.com/companies/${c.slug}` })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://techfirms.com/" },
      { "@type": "ListItem", position: 2, name: "Leaderboards", item: "https://techfirms.com/leaderboard" },
      { "@type": "ListItem", position: 3, name: `${service.name} in ${country.name}`, item: `https://techfirms.com/${pseo}` },
    ] },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="text-sm text-muted-foreground">
        <Link href="/leaderboard" className="hover:text-foreground">Leaderboards</Link> / <Link href={`/leaderboard/${country.slug}`} className="hover:text-foreground">{country.name}</Link> / <span className="text-foreground">{service.name}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Top {service.name} Companies in {country.name} — {now.m} {now.y}</h1>

      <p className="mt-4 rounded-lg border border-border bg-muted/40 p-4 leading-relaxed">{answer}</p>

      <div className="mt-6 space-y-3 text-muted-foreground">
        <p>
          Choosing a {service.name.toLowerCase()} partner in {country.name} is a high-stakes decision. TechFirms ranks every firm by the <Link href="/methodology" className="text-primary hover:underline">Company Intelligence Score</Link> — a transparent, deterministic blend of verified customer reviews, employee sentiment, and public trust signals such as domain age, certifications, and funding. Unlike pay-to-play directories, placement here can never be purchased.
        </p>
        <p>
          Below are the top-ranked {service.name.toLowerCase()} companies in {country.name}{rateRange ? `, with hourly rates typically ranging ${rateRange}` : ""}. Each links to a full profile with review breakdowns, employee sentiment, trust signals, and an AI-written intelligence summary. Use the <Link href={`/leaderboard/${country.slug}/${service.slug}`} className="text-primary hover:underline">full leaderboard</Link> to see the quadrant chart and complete ranking.
        </p>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Top {Math.min(items.length, 10)} {service.name} companies in {country.name}</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Company</th>
              <th className="px-4 py-2 font-medium">Rating</th>
              <th className="px-4 py-2 font-medium">Rate</th>
              <th className="px-4 py-2 text-right font-medium">CIS</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 10).map((c, i) => (
              <tr key={c.slug} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="tabular px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/companies/${c.slug}`} className="font-medium hover:text-primary">{c.name}</Link>
                  <div className="text-xs text-muted-foreground">{[c.hqCity?.name, c.hqCountry?.name].filter(Boolean).join(", ")}</div>
                </td>
                <td className="px-4 py-3">{c.rating != null ? <span className="inline-flex items-center gap-1.5"><StarRating value={c.rating} size={13} showValue={false} /> <span className="tabular">{c.rating.toFixed(1)}</span> <span className="text-muted-foreground">({c.reviewCount})</span></span> : "—"}</td>
                <td className="tabular px-4 py-3">{fmtRate(c.hourlyRateMin, c.hourlyRateMax, c.rateCurrency) ?? "—"}</td>
                <td className="tabular px-4 py-3 text-right font-semibold">{c.cis ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Frequently asked questions</h2>
        <div className="mt-3 space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm">
        <Link href={`/leaderboard/${country.slug}/${service.slug}`} className="text-primary hover:underline">See the full {service.name} leaderboard for {country.name} →</Link>
      </p>
    </main>
  );
}
