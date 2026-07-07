# TechFirms — Build Sequence (Implementation Plan)

> Status: Draft v1 · Last updated 2026-07-08

This is the **ordered, checkbox execution plan** — the "build this, then this" backlog a developer follows day to day. It expands the eight phases in [18 — Roadmap & Build Plan](18-roadmap-and-build-plan.md) into granular, verifiable steps, and points at the spec that governs each one. Every decision here conforms to the locked [`research/_canon.md`](research/_canon.md); where a value is a hypothesis (e.g. prices) it is tagged `(validate)`.

**Architecture recap (already decided & scaffolded).** Two folders at the repo root: `react/` = Next.js 16 App Router (React 19, Tailwind v4, SSR/ISR — mandatory for SEO + LLM citability); `node/` = Node 22 + TypeScript + Express 5 + Prisma backend (REST API, scraper worker, CIS scoring engine, Anthropic AI, pg-boss queue). The frontend fetches from the `node/` REST API server-side during SSR/ISR. Database = PostgreSQL (local `techfirms`; prod Supabase). See [17 — Tech Architecture](17-tech-architecture-and-infra.md).

**Golden rules that never change:** SSR on every public page · the CIS is computed deterministically (AI only narrates) · rankings are never for sale · scrape logged-off public facts only, never editorial text · ship each milestone as a working deploy.

---

## Milestone map

| Milestone | Theme | Maps to Phase (doc 18) |
|---|---|---|
| **M0** | Foundations & tooling | Phase 1 |
| **M1** | Auth, roles & admin skeleton | Phase 1 |
| **M2** | Scraping & seeding pipeline | Phase 2 |
| **M3** | Directory + company profiles | Phase 3 |
| **M4** | Query / lead-gen + admin queries | Phase 4 |
| **M5** | Claim flow + business dashboard | Phase 5 |
| **M6** | CIS scoring + country leaderboards | Phase 6 |
| **M7** | Programmatic SEO + GEO + sitemaps | Phase 7 |
| **M8** | AI summaries, sentiment & moderation | Phase 8 |
| **M9** | Monetization flags, polish & launch | Cross-phase |

---

## M0 — Foundations & tooling
**Goal:** a running skeleton of both apps, the schema migrated, and the design system wired.

- [x] Initialize `techfirms/` as its own git repo; push `docs/` to GitHub.
- [x] Scaffold `react/` (Next.js 16, React 19, Tailwind v4, ESLint, `@/*` alias).
- [x] Scaffold `node/` (Express 5 API `src/index.ts` with `/health` + `/api/v1/health`, pg-boss worker `src/worker.ts`, zod-validated env, pino logger, Prisma client singleton).
- [x] Add the full Prisma schema from [06 — Data Model](06-data-model-and-schema.md) at `node/prisma/schema.prisma` (23 models, 10 enums; `prisma format` + `prisma generate` pass).
- [x] Wire brand tokens (Signal Teal / Ink Navy / Intelligence Violet), Geist+Inter+Geist Mono fonts, `next-themes` dark mode, `cn()` util, and a base `Button` on the frontend; `next build` passes.
- [ ] Start Postgres locally and run the **first migration**: `cd node && npm run prisma:migrate` (creates all tables). Commit `prisma/migrations/`.
- [ ] Seed the reference taxonomy: the 10 `Service` rows and launch `Country`/`City` rows (KSA, UAE, Pakistan) via `src/scripts/seed.ts` (`npm run db:seed`).
- [ ] Add shared response types in `node/src/types/` and a Zod schema module per resource (reused by API + validation).
- [ ] Add CI (GitHub Actions): install, `npm run typecheck` + `lint` + `build` for both apps on push/PR.
- [ ] Add `AGENTS.md`/`CLAUDE.md` conventions and a `.env.example` in each app (done for both).

**Done when:** both apps boot locally, `prisma migrate` has created the schema, `GET /api/v1/health` responds, the themed home page renders in light + dark, and CI is green.

---

## M1 — Auth, roles & admin skeleton
**Goal:** authenticated users with the four roles, protected routes, and an empty admin shell.

- [ ] Backend auth: implement sign-up/sign-in issuing a session (JWT/HTTP-only cookie) against the `User` model; hash passwords (argon2/bcrypt). *(Prod may swap to Supabase Auth — keep an auth adapter boundary so the switch is isolated.)*
- [ ] Role model: `Role` enum `visitor | business_owner | admin | super_admin`; `requireRole()` Express middleware in `node/src/middleware/auth.ts`.
- [ ] Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- [ ] Frontend: auth pages under `react/app/(auth)/`; a session helper for Server Components; middleware gate for `/dashboard/*` and `/admin/*`.
- [ ] Admin shell: `react/app/admin/layout.tsx` + empty dashboard at `/admin` (KPI tiles stubbed) — spec in [12 — Admin Panel](12-admin-panel-spec.md).
- [ ] `AuditLog` write helper (`logAdminAction(actor, action, entity, before, after)`) used by every future admin mutation.

**Done when:** a user can register/log in, roles are enforced by middleware, and `/admin` is reachable only by `admin`/`super_admin`.

---

## M2 — Scraping & seeding pipeline
**Goal:** ~1,000 real firms in the DB as `unclaimed`, with AI-written neutral descriptions. Depends on M0.

- [ ] Stand up pg-boss in the worker: create queues `scrape:list`, `scrape:company`, `enrich:company`, `describe:company` (`boss.createQueue` + `boss.work`). Pattern & compliance in [07 — Scraping Pipeline](07-scraping-and-seeding-pipeline.md).
- [ ] HTTP layer: shared client with honest User-Agent (+ bot info URL), timeout, `robots.txt` + `Crawl-delay` honored, rate-limit ≥1 req/2s. Cheerio for parsing; Playwright only where JS-rendered.
- [ ] Persistence: write raw pulls to `RawScrapeRecord` (`source` + `sourceId` unique); **upsert `Company` by a stable key and never wipe** claimed edits (mirror the CapitalForAll store pattern).
- [ ] Normalize: name/slug, services→`ServiceCategory`, team size, hourly rate (amount+currency), country/city, founded year.
- [ ] Enrich: RDAP domain age, crt.sh SSL, GitHub org activity → `TrustSignal` (skip LinkedIn follower scraping; certs = self-attest + upload). Legality per [07](07-scraping-and-seeding-pipeline.md) / research.
- [ ] AI descriptions: `describe:company` job calls Claude (Haiku 4.5) to write a neutral ~100-word profile **from the company's own site** — never copied text. See [11 — AI Features](11-ai-features-spec.md).
- [ ] Re-runnable: diff detection so a re-scrape updates facts without clobbering `claimed`/`verified` fields; dead-letter + retry-with-backoff; log every request.
- [ ] Seed run: crawl the target directory, insert ~1,000 firms as `listingStatus=unclaimed`, `verified=false`.

**Done when:** ~1,000 firms exist with normalized facts + trust signals + AI descriptions, the job is idempotent on re-run, and a compliance log exists.

---

## M3 — Directory + company profiles
**Goal:** public, server-rendered directory and profile pages with JSON-LD. Backend endpoints first, then UI.

**Backend (build first):**
- [ ] `GET /api/v1/companies` — filter (service, country, city, team size, hourly rate, min budget, rating), sort, paginate. Postgres `tsvector` + GIN full-text search.
- [ ] `GET /api/v1/companies/:slug` — full profile payload (facts, services w/ focus %, reviews, employee sentiment aggregates, trust signals, CIS placeholder).
- [ ] `GET /api/v1/services`, `GET /api/v1/countries`.

**Frontend (depends on the above):**
- [ ] `/companies` directory — Clutch-style cards (logo, name, verified/claimed badges, star rating, review count, tagline, location, rate, CTAs). Filters via querystring (not indexable); see [04 — IA](04-information-architecture-and-sitemap.md).
- [ ] `/companies/[slug]` profile (SSR) — header with score-badge slot (placeholder until M6), tabs: Overview / Customer Reviews / Employee Sentiment / Trust Signals / AI Intelligence Summary; sticky **Get a Quote** CTA; **Claim this profile** banner on every `unclaimed` listing.
- [ ] JSON-LD: `Organization` + `AggregateRating` + `Review` on profiles, `ItemList` on the directory, `BreadcrumbList` site-wide. Rules in [09 — SEO](09-seo-playbook.md).
- [ ] `/services/[service]` category hub pages.

**Done when:** the directory filters/sorts/paginates against real data, profiles render server-side with valid structured data, and Lighthouse SEO is clean.

---

## M4 — Query / lead-gen flow + admin query management
**Goal:** visitors submit queries that land in admin (and later, dashboards). Depends on M3 + M1.

- [ ] Backend: `POST /api/v1/queries` (fields: project type, budget range, timeline, description, contact) with Zod validation, honeypot + rate-limit + consent. Writes `Query` (`isDirect` when targeted) and `QueryMatch` rows.
- [ ] Direct entry: "Get a Quote" on a profile → `Query` targeting that company.
- [ ] Matched entry: homepage matcher → AI (Sonnet 5) suggests 3–5 eligible firms → `QueryMatch` per firm (sponsored **excluded** from matching). Logic in [14 — Query Flow](14-query-and-leadgen-flow.md) + [11 — AI Features](11-ai-features-spec.md).
- [ ] Admin query management ([12](12-admin-panel-spec.md)): list every query, status pipeline `New → Forwarded → Contacted → Closed`, assigned company link, notes, CSV export.
- [ ] Lead-quality controls: dedupe, budget floors, spam scoring; every action writes `AuditLog`.

**Done when:** both entry points create queries visible in `/admin` with a working status pipeline and CSV export.

---

## M5 — Claim flow + business dashboard
**Goal:** owners claim, verify, and manage their profile. Depends on M1 + M3.

- [ ] Backend claim: `POST /api/v1/claims` (method = work-email domain match **or** DNS TXT), `GET/POST` verification, admin approve/reject. `Claim` + `ClaimStatus`.
- [ ] Verification: email-domain code flow; DNS TXT token (`techfirms-verify=…`) resolve + match; lockouts + expiry per [05 — Flows](05-user-flows-and-journeys.md).
- [ ] On approval: `Company.listingStatus=claimed`, set `claimOwnerId`, grant `business_owner`.
- [ ] Dashboard ([13](13-business-dashboard-spec.md)) at `/dashboard`: edit profile (facts locked/moderated), respond to reviews, view incoming queries.
- [ ] Verified reviews: `ReviewInvitation` with unique one-time links (`/r/[token]`), expiry, reviewer verification → `CustomerReview` (`source=native`).
- [ ] Dashboard analytics: profile views, query volume, leaderboard-position trend (charts).
- [ ] Monetization surfaces stubbed (Featured / Sponsored / Verified-Plus upsell) — flags only, gated. See [15 — Monetization](15-monetization-and-pricing.md).

**Done when:** an owner can claim + verify a profile, edit it, receive queries, and invite a client who leaves a verified review.

---

## M6 — CIS scoring engine + country leaderboards
**Goal:** the deterministic Company Intelligence Score and Gartner-style leaderboards. Depends on M2–M5 data.

- [ ] Scoring service ([08](08-scoring-and-leaderboards.md)): CIS = Customer Reviews **40%** · Employee Sentiment **25%** · Trust Signals **20%** · Market Activity **15%**; each sub-signal normalized 0–100; renormalize on missing signals.
- [ ] Reviews model: Bayesian shrinkage (prior m≈8 @ 3.5★), recency half-life ≈12 months.
- [ ] Cohorts: rank within **country × service**, median split → quadrants **Leaders / Challengers / Rising Stars / Niche Players** (X = Market Presence, Y = Client Satisfaction).
- [ ] Eligibility gate: ≥5 verified reviews AND ≥3 recent to appear on a leaderboard.
- [ ] Persistence: write `IntelligenceScore` (+ AI-narrated 3-sentence justification via Sonnet 5), `ScoreSnapshot` history; `Leaderboard` + `LeaderboardSnapshot`.
- [ ] Jobs: `score:recompute` weekly (pg-boss schedule) → `revalidateTag` on affected profiles/leaderboards; monthly frozen snapshots.
- [ ] Fake-review detection at MVP: velocity/burst, near-duplicate embeddings, shared-domain/IP reviewer graph.
- [ ] Backend: `GET /api/v1/leaderboard/:country`, `GET /api/v1/leaderboard/:country/:service`.
- [ ] Frontend: `/leaderboard/[country]` and `/leaderboard/[country]/[service]` — Recharts quadrant scatter (logo bubbles) **plus an HTML `<table>` equivalent** (for GEO), rank table with month-over-month movement; score badge component live on profiles.
- [ ] `/methodology` page — publish the formula + weights (trust + LLM-citation moat).

**Done when:** every eligible firm has a CIS + justification, leaderboards render (chart + table) per country/service, and re-score triggers revalidation.

---

## M7 — Programmatic SEO + GEO + sitemaps
**Goal:** the scaled, LLM-citable content layer. Depends on M6.

- [ ] Programmatic pages: `/best-[service]-companies-in-[country]` and `-in-[city]` — unique AI intro (300+ words, refreshed monthly), top-10 table, FAQ block. Gate auto-publish below a minimum-data threshold (anti-thin-content). See [09](09-seo-playbook.md).
- [ ] **Answer blocks**: a 40–60 word, dated, number-bearing, entity-named summary at the top of every profile & leaderboard (highest-ROI GEO lever). See [10 — GEO](10-geo-llm-optimization.md).
- [ ] Dynamic sitemaps via `generateSitemaps()` sharded 50k/50MB under a sitemap index (companies, categories, countries, leaderboards); regenerate daily with real `lastmod`.
- [ ] Faceted-nav control: only curated `service × country` (+top city) combos crawlable; `robots.txt` disallows filter params; empty combos return HTTP 404.
- [ ] `llms.txt` at root (adapt `docs/llms.txt.sample`) — ship as free insurance, not the moat.
- [ ] Per-page OG images via `next/og` `ImageResponse` (score-badge card, 1200×630).
- [ ] `/reports/[country]` — monthly "State of Tech Companies in [Country]" long-form data pages.
- [ ] Public read-only `GET /api/v1/*` documented (OpenAPI) as the machine-readable source; stand up AI-citation tracking to measure the thesis.

**Done when:** programmatic pages are indexable with unique data-dense content, sitemaps + answer blocks + `llms.txt` are live, and Core Web Vitals pass (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1).

---

## M8 — AI summaries, sentiment & moderation
**Goal:** the remaining AI use-cases from [11 — AI Features](11-ai-features-spec.md). Depends on M3/M5/M6.

- [ ] Review **sentiment** (Haiku 4.5) on every `CustomerReview`; feed the reviews sub-signal.
- [ ] CIS **justification** summaries regenerated on each recompute (Sonnet 5) — deterministic score, AI narration only.
- [ ] Review/claim **moderation assist** (Haiku 4.5): spam/fake risk score + rationale surfaced in the admin queue.
- [ ] Query **matching** refinement (Sonnet 5) with transparency + no pay-to-play bias.
- [ ] Guardrails across all five: prompt-injection defense on scraped/user text, no fabricated facts, JSON-schema outputs, human-in-the-loop for consequential actions; batch + prompt-cache for cost.

**Done when:** all five AI features run with evals/spot-checks in place and injection defenses verified.

---

## M9 — Monetization flags, polish & launch
**Goal:** ship the first real leaderboards and the monetization scaffolding.

- [ ] Monetization schema live (`listingStatus`, `tier`, `Sponsorship{country,category,slotRank,dates}`, `badges[]`, `billing`, dormant `leadRouting`); admin override to set tier/sponsorship manually; impression/click tracking. Sponsored is labeled and **never** affects CIS/rank. See [15](15-monetization-and-pricing.md).
- [ ] Accessibility (WCAG AA) + mobile-responsive sweep across all pages; empty/error states.
- [ ] Observability: Sentry (errors) + Axiom (logs) in both apps; uptime + job-failure alerts.
- [ ] Launch the first three GTM leaderboards: **AI Development (KSA)**, **Custom Software (UAE)**, **Web Development (Pakistan)**.
- [ ] Launch checklist: canonical URLs, robots/sitemaps submitted, JSON-LD validated, backups/DR, rate limits.

**Done when:** the three GTM leaderboards are public and citable, monetization can be toggled per company by an admin, and the launch checklist is complete.

---

## Endpoint build order (backend)

| Order | Endpoint | Milestone |
|---|---|---|
| 1 | `GET /api/v1/health` | M0 ✅ |
| 2 | `POST /auth/{register,login,logout}`, `GET /auth/me` | M1 |
| 3 | `GET /companies`, `GET /companies/:slug` | M3 |
| 4 | `GET /services`, `GET /countries` | M3 |
| 5 | `POST /queries`, admin query endpoints | M4 |
| 6 | `POST /claims` + verification, dashboard mutations | M5 |
| 7 | `GET /leaderboard/:country[/:service]` | M6 |
| 8 | `GET /reports/:country`, OpenAPI docs | M7 |

## Route build order (frontend)

| Order | Route | Milestone |
|---|---|---|
| 1 | `/` (home) | M0 ✅ (scaffold) |
| 2 | `/(auth)/*`, `/admin` shell | M1 |
| 3 | `/companies`, `/companies/[slug]`, `/services/[service]` | M3 |
| 4 | homepage matcher + query forms | M4 |
| 5 | `/claim/[slug]`, `/dashboard/*`, `/r/[token]` | M5 |
| 6 | `/leaderboard/[country]`, `/leaderboard/[country]/[service]`, `/methodology` | M6 |
| 7 | `/best-[service]-companies-in-[country]`, `/reports/[country]`, `/llms.txt`, sitemaps | M7 |

---

## Cross-cutting workstreams (run continuously)

- **Design system** — extend `components/ui/*` from [03](03-design-system.md) as pages need them (cards, badges, tabs, tables, star rating, score badge, filters).
- **SEO/GEO** — JSON-LD, answer blocks, and freshness stamping applied to each new page type as it ships, not retrofitted.
- **Testing** — Vitest unit tests for scoring/normalization/matching; Playwright e2e for claim, query, and review flows.
- **Observability** — structured logs + error tracking from M0; add per-job metrics as the worker grows.
- **Accessibility** — AA contrast, focus rings, keyboard nav, and `prefers-reduced-motion` checked per component.
- **Security** — Zod validation on every input, rate limiting, secrets in env only, scraper compliance logging.

## Definition of Done per deployable increment

Each milestone ships as a **working deployment**: public pages are server-rendered and crawlable, the UI is mobile-responsive, inputs are validated, new pages carry correct JSON-LD, and CI (typecheck + lint + build for both apps) is green.
