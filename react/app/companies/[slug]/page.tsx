import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MapPin, Users, Calendar, ShieldCheck, Award, Code2 } from "lucide-react";
import { getCompany } from "@/lib/data";
import type { CompanyDetail } from "@/lib/types";
import { fmtRate, fmtMoney, fmtEmployees, quadrantLabel } from "@/lib/format";
import { LogoAvatar } from "@/components/logo-avatar";
import { ScoreBadge } from "@/components/score-badge";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) return { title: "Company not found" };
  const loc = [c.hqCity?.name, c.hqCountry?.name].filter(Boolean).join(", ");
  return {
    title: `${c.name} — reviews, ratings & Company Intelligence Score`,
    description: c.tagline ?? c.description ?? `${c.name}${loc ? ` in ${loc}` : ""} on TechFirms.`,
  };
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "reviews", label: "Customer Reviews" },
  { id: "employees", label: "Employee Sentiment" },
  { id: "trust", label: "Trust Signals" },
  { id: "ai", label: "AI Intelligence Summary" },
];

function Bar({ label, value, max = 5 }: { label: string; value: number | null; max?: number }) {
  const pct = value == null ? 0 : Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular font-medium">{value == null ? "—" : max === 5 ? value.toFixed(1) : value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function jsonLd(c: CompanyDetail) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.name,
    url: c.website ?? undefined,
    description: c.description ?? c.tagline ?? undefined,
    slogan: c.tagline ?? undefined,
    foundingDate: c.foundedYear ? String(c.foundedYear) : undefined,
    address: c.hqCountry
      ? { "@type": "PostalAddress", addressCountry: c.hqCountry.name, addressLocality: c.hqCity?.name ?? undefined }
      : undefined,
  };
  if (c.rating != null && c.reviewCount > 0) {
    ld.aggregateRating = { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.reviewCount, bestRating: 5 };
    ld.review = c.reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.reviewerName ?? "Verified client" },
      reviewRating: { "@type": "Rating", ratingValue: r.ratingOverall, bestRating: 5 },
      reviewBody: r.body ?? undefined,
    }));
  }
  return ld;
}

export default async function CompanyProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) notFound();

  const loc = [c.hqCity?.name, c.hqCountry?.name].filter(Boolean).join(", ");
  const rate = fmtRate(c.hourlyRateMin, c.hourlyRateMax, c.rateCurrency);
  const emp = fmtEmployees(c.employeeRangeMin, c.employeeRangeMax);
  const s = c.intelligenceScore;
  const es = c.employeeSentiment;
  const ts = c.trustSignals;
  const answer =
    s && c.rating != null
      ? `As of July 2026, ${c.name}${loc ? ` (${loc})` : ""} holds a Company Intelligence Score of ${s.cis}/100 on TechFirms — placing it in the ${quadrantLabel(s.quadrant)} quadrant — based on ${c.reviewCount} customer reviews averaging ${c.rating.toFixed(1)}/5${es ? `, employee sentiment of ${es.overallRating}/5` : ""}, and public trust signals.`
      : `${c.name}${loc ? ` is a technology company in ${loc}` : ""} tracked on TechFirms.`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(c)) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <Link href="/companies" className="hover:text-foreground">Companies</Link>
        {c.hqCountry && (
          <>
            {" / "}
            <Link href={`/leaderboard/${c.hqCountry.slug}`} className="hover:text-foreground">{c.hqCountry.name}</Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{c.name}</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start">
        <LogoAvatar name={c.name} logoUrl={c.logoUrl} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{c.name}</h1>
            {c.verified && <Badge variant="verified"><ShieldCheck size={12} /> Verified</Badge>}
            {c.claimed && !c.verified && <Badge variant="brand">Claimed</Badge>}
            {c.listingStatus === "unclaimed" && <Badge variant="outline">Unclaimed</Badge>}
          </div>
          {c.tagline && <p className="mt-1 text-muted-foreground">{c.tagline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {c.rating != null && (
              <span className="flex items-center gap-1.5"><StarRating value={c.rating} size={15} /> <span>({c.reviewCount} reviews)</span></span>
            )}
            {loc && <span className="flex items-center gap-1.5"><MapPin size={14} /> {loc}</span>}
            {rate && <span className="tabular flex items-center gap-1.5">{rate}</span>}
            {emp && <span className="flex items-center gap-1.5"><Users size={14} /> {emp} employees</span>}
            {c.foundedYear && <span className="flex items-center gap-1.5"><Calendar size={14} /> Est. {c.foundedYear}</span>}
          </div>
        </div>
      </div>

      {/* Answer block (GEO) */}
      <p className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">{answer}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="min-w-0 space-y-10">
          {/* section nav */}
          <nav className="flex flex-wrap gap-2 border-b border-border pb-3 text-sm">
            {SECTIONS.map((sec) => (
              <a key={sec.id} href={`#${sec.id}`} className="rounded-md px-3 py-1 text-muted-foreground hover:bg-muted hover:text-foreground">{sec.label}</a>
            ))}
          </nav>

          {/* Overview */}
          <section id="overview" className="scroll-mt-20">
            <h2 className="text-xl font-semibold">Overview</h2>
            {c.description && <p className="mt-3 text-muted-foreground">{c.description}</p>}
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Service focus</h3>
            <div className="mt-3 space-y-3">
              {c.services.map((sv) => (
                <div key={sv.slug}>
                  <div className="flex justify-between text-sm">
                    <Link href={`/services/${sv.slug}`} className="hover:text-primary">{sv.name}</Link>
                    <span className="tabular text-muted-foreground">{sv.focusPct ?? 0}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${sv.focusPct ?? 0}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Fact label="Min project" value={fmtMoney(c.minProjectSize, c.rateCurrency)} />
              <Fact label="Hourly rate" value={rate} />
              <Fact label="Team size" value={emp} />
              <Fact label="Founded" value={c.foundedYear ? String(c.foundedYear) : null} />
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews" className="scroll-mt-20">
            <h2 className="text-xl font-semibold">Customer Reviews <span className="text-muted-foreground">({c.reviewCount})</span></h2>
            <div className="mt-4 space-y-4">
              {c.reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
              {c.reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.reviewerName ?? "Verified client"}</div>
                      <div className="text-sm text-muted-foreground">{[r.reviewerTitle, r.reviewerCompany].filter(Boolean).join(", ")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.verified && <Badge variant="verified">Verified</Badge>}
                      <StarRating value={r.ratingOverall} size={14} />
                    </div>
                  </div>
                  {r.body && <p className="mt-2 text-sm text-muted-foreground">“{r.body}”</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Employee sentiment */}
          <section id="employees" className="scroll-mt-20">
            <h2 className="text-xl font-semibold">Employee Sentiment</h2>
            {es ? (
              <div className="mt-4 rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                  <div className="tabular text-3xl font-bold">{es.overallRating?.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">
                    Overall · {es.recommendPct}% would recommend · {es.reviewCount} employee reviews
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Bar label="Culture" value={es.culture} />
                  <Bar label="Compensation" value={es.compensation} />
                  <Bar label="Work–life balance" value={es.workLifeBalance} />
                  <Bar label="Leadership" value={es.leadership} />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Aggregated from <a href={es.sourceUrl} className="underline" rel="nofollow noopener" target="_blank">{es.sourceName}</a> · as of {new Date(es.asOf).toLocaleDateString()}. TechFirms stores aggregates and links out.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">No employee-sentiment data yet.</p>
            )}
          </section>

          {/* Trust signals */}
          <section id="trust" className="scroll-mt-20">
            <h2 className="text-xl font-semibold">Trust Signals</h2>
            {ts ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Fact label="Domain age" value={ts.domainAgeYears != null ? `${ts.domainAgeYears} years` : null} icon={<Globe size={14} />} />
                <Fact label="SSL" value={ts.sslValid ? "Valid" : ts.sslValid === false ? "Invalid" : null} icon={<ShieldCheck size={14} />} />
                <Fact label="GitHub activity" value={ts.githubOrgActivity != null ? `${ts.githubOrgActivity}` : null} icon={<Code2 size={14} />} />
                <Fact label="Funding raised" value={fmtMoney(ts.fundingRaised, ts.fundingCurrency)} icon={<Award size={14} />} />
                {ts.certifications.length > 0 && (
                  <div className="sm:col-span-2">
                    <div className="text-sm text-muted-foreground">Certifications</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {ts.certifications.map((cert) => <Badge key={cert} variant="brand">{cert}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">No trust-signal data yet.</p>
            )}
          </section>

          {/* AI summary */}
          <section id="ai" className="scroll-mt-20">
            <h2 className="text-xl font-semibold">AI Intelligence Summary</h2>
            {s ? (
              <div className="mt-4 rounded-lg border border-violet-600/30 bg-violet-600/5 p-5">
                <div className="flex items-start gap-4">
                  <ScoreBadge cis={s.cis} size={64} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Company Intelligence Score</span>
                      {s.quadrant && <Badge variant="ai">{quadrantLabel(s.quadrant)}</Badge>}
                    </div>
                    {s.justification && <p className="mt-2 text-sm text-muted-foreground">{s.justification}</p>}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Bar label="Customer reviews (40%)" value={s.reviewsScore} max={100} />
                  <Bar label="Employee sentiment (25%)" value={s.sentimentScore} max={100} />
                  <Bar label="Trust signals (20%)" value={s.trustScore} max={100} />
                  <Bar label="Market activity (15%)" value={s.marketScore} max={100} />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  The CIS is computed deterministically; the summary is AI-narrated. See the <Link href="/methodology" className="underline">methodology</Link>.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">Not yet rated.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="flex justify-center"><ScoreBadge cis={s?.cis ?? null} size={80} /></div>
            {s?.quadrant && <div className="mt-2"><Badge variant="brand">{quadrantLabel(s.quadrant)}</Badge></div>}
            <a href="#quote" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary font-medium text-primary-foreground hover:bg-brand-800">Get a Quote</a>
            {c.website && (
              <a href={c.website} target="_blank" rel="nofollow noopener" className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border text-sm hover:bg-muted">
                <Globe size={15} /> Visit website
              </a>
            )}
            {c.listingStatus === "unclaimed" && (
              <Link href={`/claim/${c.slug}`} className="mt-3 block text-xs text-primary hover:underline">Claim this profile</Link>
            )}
          </div>
          <div id="quote" className="scroll-mt-20 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            The quote / lead-gen form ships in milestone M4 (see docs/14). It will send your project brief to {c.name} and the TechFirms team.
          </div>
        </aside>
      </div>
    </main>
  );
}

function Fact({ label, value, icon }: { label: string; value: string | null; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="tabular mt-0.5 font-medium">{value ?? "—"}</div>
    </div>
  );
}
