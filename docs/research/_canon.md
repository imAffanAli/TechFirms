# TechFirms — Canonical Decisions (LOCKED)

> Status: Locked v1 · 2026-07-07. This file is the single source of truth. Every doc MUST conform to the names, values, hexes, URLs, and weights below. If a doc needs to deviate, it must call it out explicitly as an "Open decision," not silently contradict this.

Synthesized from the research briefs in `docs/research/`. Where a value is a hypothesis to validate (e.g. prices), it is tagged `(validate)`.

---

## 1. Product identity & terminology

- **Product name:** TechFirms.
- **One-liner:** An AI-first reputation layer & directory for technology companies — customer reviews + employee-sentiment aggregates + public trust signals + an AI-computed **Company Intelligence Score**, organized into country-scoped, Gartner-style leaderboards, built so LLMs cite it.
- **The score is named:** **Company Intelligence Score (CIS)**, scale **0–100**. Always this name/abbreviation.
- **Core trust signals (always in this order):** 1) Customer Reviews, 2) Employee Sentiment, 3) Trust Signals, 4) Market Activity.
- **Quadrant names (fixed):** **Leaders, Challengers, Rising Stars, Niche Players.**
- **Leaderboard axes (fixed):** X = **Market Presence**, Y = **Client Satisfaction**.
- **Listing lifecycle states:** `unclaimed` (claimed=false, verified=false) → `claimed` → `verified`.
- **Roles (fixed enum):** `visitor`, `business_owner`, `admin`, `super_admin`.
- **Query status pipeline (fixed):** `New → Forwarded → Contacted → Closed`.
- **Claim verification methods (fixed):** work-email domain match **OR** DNS TXT record → admin approval.
- **Review source enum:** `native | imported`.

---

## 2. Brand & design tokens (LOCKED — from design-branding.md)

**Thesis:** deep **teal-cyan** primary ("Signal Teal") + near-black **navy** anchor ("Ink Navy") + a single **violet** AI accent reserved for the CIS. Teal = trust + tech + intelligence, and dodges Clutch/G2 red, Gartner navy, and invisible corporate blue. **Never use red as an accent — red is errors only.**

### Primary — "Signal Teal"
```
teal-50  #ECFDFB   teal-100 #CFF9F3   teal-200 #A0F0E7   teal-300 #64E1D6
teal-400 #2CC7BD   teal-500 #11A69E (brand core/logo)     teal-600 #0C8A85
teal-700 #0F6E6B (primary button bg, links on white)      teal-800 #135755
teal-900 #144846   teal-950 #05302F
```
### Anchor — "Ink Navy" (headers, footers, dark hero, authority surfaces)
```
navy-950 #0A1B2E (primary dark anchor)   navy-900 #0E2438   navy-800 #16324A
```
### AI accent — "Intelligence Violet" (reserve EXCLUSIVELY for the CIS: score chip, AI badge, teal→violet gradient ring)
```
violet-500 #7C5CFC   violet-600 #6D3EF0 (AI CTA/score chip)   violet-700 #5A2FCC
```
### Neutrals — cool slate (Tailwind slate scale)
```
gray-50 #F8FAFC  100 #F1F5F9  200 #E2E8F0  300 #CBD5E1  400 #94A3B8
500 #64748B  600 #475569  700 #334155  800 #1E293B  900 #0F172A  950 #020617
```
### Semantic (500 base / 600 default / 700 = accessible text-on-white). Danger is errors/destructive ONLY.
```
success 500 #22C55E / 600 #16A34A / 700 #15803D
warning 500 #F59E0B / 600 #D97706 / 700 #B45309
danger  500 #EF4444 / 600 #DC2626 / 700 #B91C1C
info    500 #3B82F6 / 600 #2563EB / 700 #1D4ED8
```
### Dark-mode surfaces (ship dark + light from launch)
```
bg #0A0F1A   surface #111A2B   surface-2 #1B2740   border #26334D
text #F1F5F9   text-dim #94A3B8   accent-on-dark = teal-400 #2CC7BD
```
### Marketing surfaces only
- Warm off-white background **`#F7F5F2`** (Pantone "Cloud Dancer" family) for marketing/landing pages; keep cool slate in-product.

### Accessibility (WCAG 2.2 AA baseline, enforce in CI)
- Links/body-accent on white = **teal-700** (6.06:1). Primary button = **teal-700 bg / white text** (6.06:1). On dark, promote accent to **teal-400** (9.16:1). Secondary text ≥ **gray-500**. Never put normal body text in teal-500 or lighter on white.

### Typography
- **Headings/display:** Geist (Geist Sans). **Body/UI:** Inter. **Numeric/data/mono:** Geist Mono with tabular figures (`tnum`) for ranks/scores/funding. **RTL (Saudi/UAE Arabic):** Noto Sans Arabic.
- Self-host via `next/font`. Modular scale **1.25 major-third, base 16px**. Body line-height 1.5–1.6; headings 1.1–1.2; display tracking −0.01 to −0.02em.
- Font CSS vars: `--font-display:"Geist"`, `--font-sans:"Inter"`, `--font-mono:"Geist Mono"`.

### Other tokens
- **Icons:** Lucide. **Radius:** base `0.5rem` (shadcn default; cards `0.75rem`, pills full). **Spacing:** 4px base scale. **Component lib:** shadcn/ui (Radix under the hood). **Charts:** Recharts, themed to tokens.
- Skip: neon/glow effects, heavy glassmorphism (wrong signal for a trust brand).

---

## 3. URL & routing scheme (LOCKED)

| Purpose | Route |
|---|---|
| Home | `/` |
| Directory (facets via querystring) | `/companies?service=&country=&...` |
| Company profile | `/companies/[slug]` |
| Country leaderboard | `/leaderboard/[country]` |
| Country + service leaderboard | `/leaderboard/[country]/[service]` |
| Programmatic SEO (country) | `/best-[service]-companies-in-[country]` |
| Programmatic SEO (city) | `/best-[service]-companies-in-[city]` |
| Service category hub | `/services/[service]` |
| Country report | `/reports/[country]` ("State of Tech Companies in [Country]") |
| Methodology (public, builds trust + GEO) | `/methodology` |
| Claim a profile | `/claim/[slug]` |
| Business dashboard | `/dashboard/...` |
| Admin | `/admin/...` |
| Public read-only API | `/api/v1/...` |
| LLM manifest | `/llms.txt` |

- **Slug rules:** company slug = kebab-case of name + numeric disambiguation on collision; country slug = readable (`saudi-arabia`, `united-arab-emirates`, `pakistan`) with ISO-3166 code stored alongside; service slug per table below.
- **Indexation:** only curated `service × country` (and top `city`) combos are crawlable canonical URLs. Directory filter params (rating/size/rate sliders) stay as querystring/fragment and are **not** indexable; `robots.txt` disallows filter params; empty filter combos return **HTTP 404**. Self-referencing canonicals everywhere.
- **Page titles for leaderboards/pSEO:** month-stamped, e.g. `Top AI Development Companies in Saudi Arabia — July 2026`.

---

## 4. Service taxonomy (LOCKED — name → slug)

| Service | Slug |
|---|---|
| AI Development | `ai-development` |
| Custom Software Development | `custom-software` |
| Web Development | `web-development` |
| Mobile App Development | `mobile-app-development` |
| Cloud | `cloud` |
| DevOps | `devops` |
| Data Engineering | `data-engineering` |
| Cybersecurity | `cybersecurity` |
| IT Staff Augmentation | `it-staff-augmentation` |
| UI/UX Design | `ui-ux-design` |

Company↔Service is many-to-many with a **focus %** on the join.

---

## 5. Launch markets & go-to-market focus (LOCKED)

- **Priority markets:** 1) Saudi Arabia (KSA), 2) United Arab Emirates (UAE), 3) Pakistan → then global. Rationale: high-intent, under-served by US/EU-centric Clutch/G2/DesignRush; techreviewer.co traffic already skews India/US/**Pakistan #3**, and there are **no KSA/Pakistan dedicated leaderboards** among incumbents — an open SEO/GEO lane.
- **First 3 leaderboards to seed for GTM:** AI Development in Saudi Arabia · Custom Software in UAE · Web/Custom Software in Pakistan.

---

## 6. Company Intelligence Score & leaderboard methodology (LOCKED — from scoring-methodology.md)

- **Composite weights (fixed):** Customer Reviews **40%**, Employee Sentiment **25%**, Trust Signals **20%**, Market Activity **15%**. Each sub-signal normalized to 0–100; renormalize weights when a signal is missing.
- **Reviews model:** Bayesian shrinkage — prior **m ≈ 8** reviews at **C ≈ 3.5★ (≈70/100)**; exponential **recency decay, half-life ≈ 12 months**.
- **Cohort scoring:** rank within **country × service-category cohorts** using **median splits** (not global absolute cutoffs) so US giants don't flatten Pakistan/KSA boards.
- **Leaderboard eligibility gate:** **≥5 verified reviews AND ≥3 recent** (within 18 months) to appear on a "best in [country]" board.
- **Quadrant mapping (median split):** Leaders = top-right (high Presence + high Satisfaction); Challengers = high Presence / lower Satisfaction; Rising Stars = high Satisfaction / lower Presence (the emerging-market story); Niche Players = low/low.
- **Determinism rule:** the CIS is **computed deterministically**; Claude only *narrates* a 3-sentence justification — the LLM never emits the number. Recompute **weekly**; publish **monthly frozen snapshots** and store history for month-over-month movement.
- **Transparency:** publish the formula + weights at `/methodology` (LLM-citation moat); keep **fraud-detection signals secret**.
- **Fake-review detection (MVP, 3 cheap wins):** velocity/burst + co-bursting; near-duplicate text via embedding similarity; shared-domain/IP reviewer-graph clustering.

---

## 7. Tech stack (LOCKED — from nextjs-architecture.md)

| Layer | Choice | Notes |
|---|---|---|
| Web framework | **Next.js 14+/15 App Router**, SSR/ISR | SSR mandatory for SEO + LLM crawlability |
| Styling/UI | **Tailwind + shadcn/ui**, Recharts | tokens per §2 |
| Web hosting | **Vercel Pro** | revisit Fly.io/Hetzner only past ~$200–500/mo |
| Database | **Supabase Postgres** + **Prisma** | no cold-start for always-on SSR; Supavisor pooling |
| Auth | **Supabase Auth** | `role` enum enforced in middleware + Prisma (cheaper than Clerk at scale) |
| Scraper/worker | **Dedicated Railway (or Fly) service**, Docker | **never on Vercel**; Playwright + Cheerio + axios; reads jobs from Postgres |
| Job queue | **pg-boss** (Postgres-native, no Redis) | DB-polling pattern acceptable (mirrors CapitalForAll) |
| Search | **Postgres `tsvector` + GIN** at launch → **Meilisearch** past ~5K firms | Postgres stays source of truth |
| AI | **Anthropic API (Claude)** | model IDs in §8 |
| OG images | **`next/og` `ImageResponse`** (flexbox subset), 1200×630 | per-route, cached |
| Payments | **Stripe** | manual invoicing acceptable pre-self-serve |
| Observability | **Sentry** (errors) + **Axiom** (logs) | |
| Rendering strategy | **ISR + on-demand `revalidateTag`** for leaderboards/profiles (worker triggers revalidation after re-score); **SSR** for search + auth-gated dashboards | |

- **Repo:** monorepo — `apps/web`, `apps/worker`, `packages/db` (Prisma schema shared), `packages/ui`.
- **Local dev DB (existing `.env`):** `PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=1234 PGDATABASE=techfirms`. Prod adds `DATABASE_URL` (pooled, `?pgbouncer=true`), `DIRECT_URL` (migrations), `ANTHROPIC_API_KEY`, Supabase keys, `STRIPE_*`, storage.

---

## 8. AI / Claude models (LOCKED — use latest Claude)

- Model IDs: **Opus 4.8 = `claude-opus-4-8`**, **Sonnet 5 = `claude-sonnet-5`**, **Haiku 4.5 = `claude-haiku-4-5-20251001`**.
- Default mapping: **Haiku 4.5** for high-volume classification/summarization (review sentiment, moderation triage, description drafts), **Sonnet 5** for query-matching & CIS justification, **Opus 4.8** for the hardest reasoning/eval. Confirm pricing against Claude API docs at build time.
- Five AI use-cases: (1) neutral company description generation, (2) review sentiment, (3) query→firm matching, (4) CIS 3-sentence justification, (5) review/claim moderation assist. All must resist prompt injection from scraped/user text and never fabricate facts.

---

## 9. Scraping & data-sourcing posture (LOCKED — from scraping-legal-tech.md + employee-sentiment-sources.md)

- **Golden rule:** never log in, never create accounts, never accept a click-wrap. Scrape **logged-off public FACTS only**; **never copy editorial text or review prose** (regenerate all copy via Claude). Honor `robots.txt` + `Crawl-delay`; rate-limit **≥1 req/2s**; honest User-Agent with a bot info URL; log every request (timestamp/URL/status). Treat a Cloudflare/DataDome challenge as a "no" — no spoofing arms race.
- **Seed target:** ~1,000 top tech firms; insert as `claimed=false, verified=false`.
- **Enrichment sources:** RDAP domain age (free), crt.sh/WhoisJSON SSL (free tier), **GitHub REST API** org activity (5,000 req/hr free) — covers 3 of 4 trust signals cheaply/legally. Crunchbase = paid ($49–99/mo). **Skip LinkedIn follower scraping** (no compliant path). Certifications = **self-attestation + report upload** (IAF CertSearch ceased 2026-01-01; SOC 2 has no public registry).
- **Employee sentiment:** **aggregates only + attribution + link-out at launch** (facts = uncopyrightable; verbatim review text = copyrightable, high risk). Acquire via bought datasets (Bright Data ~$0.0025/record) or Apify refresh — **do NOT base MVP on live Glassdoor scraping** (API closed 2021, Cloudflare, ToS ban). Store normalized schema with an `as_of` timestamp. **Native anonymous email-verified employee reviews ship in v2** (becomes the moat).
- **Reusable patterns (proven in CapitalForAll on this machine):** shared axios client w/ realistic UA + timeout; Cheerio parsing; a persistent store that **upserts by a stable key and never wipes history**; normalization helpers; offset paging + deep backfill; separate worker process; DB-polling queue with poll interval, `MAX_JOBS_PER_TICK`, draining guard, `WORKER_ID`, and **stale-job reaping** (requeue if a worker crashed mid-job).

---

## 10. SEO & GEO posture (LOCKED — from seo-directory-playbook.md + geo-llm-optimization.md)

- **SSR everything on public pages** (AI crawlers don't run JS); zero client-only content.
- **Structured data:** `Organization` + `AggregateRating` + `Review` on profiles (permitted — TechFirms is a *third party* rating *other* companies; ensure visible-content parity and exact `ratingValue`/`reviewCount`), `ItemList` (with `position`) on directories/leaderboards, `BreadcrumbList` site-wide, `FAQPage` on category pages.
- **pSEO defense = data density, not prose.** Gate auto-publish below a minimum-data threshold; each page carries the 4 proprietary trust signals + CIS. Avoid keyword-swap doorway pages (Google tightened Scaled-Content-Abuse in Aug + Dec 2025).
- **Core Web Vitals (p75):** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- **Sitemaps:** sharded 50,000 URLs / 50 MB via `generateSitemaps()` under a sitemap index; regenerate daily; real `lastmod`.
- **GEO reality:** `llms.txt` = ship it as free insurance but **expect ~0 return — it is NOT the moat.** The real levers (evidence-backed): (a) **third-party brand mentions/citations** (correlate ~3× stronger than backlinks with AI citation) — treat "get mentioned" as a growth KPI; (b) **answer blocks** — a 40–60 word dated, number-bearing, entity-named summary near the top of every profile/leaderboard (peer-reviewed ~+40% AI visibility); (c) **freshness** (auto `dateModified`, roll year-tokens, regenerate leaderboards on cadence); (d) structured data + SSR; (e) an **HTML `<table>` equivalent for every chart**. Per-engine citation pools barely overlap — instrument AI-citation tracking to *measure* the claim.

---

## 11. Monetization (LOCKED shape; prices = validate — from monetization-pricing.md)

- **Trust rule (non-negotiable):** "Sponsored" is always visually labeled and **never influences the CIS or organic rank.** Sell visibility, not objective rank — this protects LLM citability and defuses the #1 user grievance (pay-to-play).
- **Phased ladder:** Unclaimed (free) → Claim (free, lead capture) → **Featured badge $49–99/mo** `(validate)` → **Sponsored placement $300–1,500/mo** `(validate)` → **Verified-Plus $199–399/mo** `(validate)` → **Pay-per-qualified-lead $40–150/lead** `(validate, ~month 9–12)`.
- **Regional pricing:** KSA/UAE ≈ **1.3–1.5×** global; Pakistan ≈ **40–50%** of global.
- **Build the flags now** even before pricing ships: `listingStatus`, `tier`, `sponsorship{country, category, slotRank, dates}`, `badges[]`, `billing`, dormant `leadRouting`; a "Claim this profile" CTA on every unclaimed listing; an admin override to set tier/sponsorship manually (sales closes deals); impression/click tracking to prove ROI.

---

## 12. Canonical Prisma model names (LOCKED — use these exact names)

`User`, `Company`, `Service`, `CompanyService` (join, `focusPct`), `OfficeLocation`, `Country`, `City`, `CustomerReview`, `EmployeeSentiment`, `TrustSignal`, `IntelligenceScore`, `ScoreSnapshot`, `Query`, `QueryMatch`, `Claim`, `ReviewInvitation`, `Leaderboard`, `LeaderboardSnapshot`, `Sponsorship`, `AuditLog`, `ScrapeSource`, `ScrapeJob`, `RawScrapeRecord`.

Enums: `Role`, `ListingStatus`, `ReviewSource`, `ClaimStatus`, `QueryStatus`, `VerificationMethod`, `Quadrant`, `ServiceCategory`, `SponsorshipTier`.

Conventions: PascalCase models, camelCase fields, `createdAt`/`updatedAt` on every table, soft-delete via `deletedAt` where user-editable, store scrape provenance as `source` + `sourceId` (unique together) for dedupe/upsert, multi-currency rate fields store amount + ISO currency.
