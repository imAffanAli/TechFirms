# Technical Architecture & Infrastructure

> Status: Draft v1 · Last updated 2026-07-07

This document is the build spec for how TechFirms runs in production: the system topology, the locked stack choices with rationale, the monorepo layout, environment/config, security posture, CI/CD, and the scalability + cost path from 1K to 10K firms. It is the operational counterpart to the data model and the scraping pipeline — those are cross-linked, not repeated here. Everything below conforms to `docs/research/_canon.md` (LOCKED). Where a genuine founder decision remains, it is flagged in "Open questions" at the end.

---

## 1. System architecture

TechFirms is two deployables that share one database and one Prisma schema: a **Next.js web app** (Vercel) that serves all public SSR/ISR pages, the business dashboard, and the admin panel; and a **separate long-running worker** (Railway) that scrapes, enriches, scores, and triggers cache revalidation. They never share a process. The worker never runs on Vercel; the web app never opens a headless browser.

```mermaid
flowchart TB
    subgraph client[Clients]
        U[Visitors / Business owners / Admins]
        BOT[LLM + search crawlers]
    end

    subgraph vercel[Vercel Pro — apps/web]
        WEB[Next.js 15 App Router<br/>SSR + ISR pages]
        OG["next/og ImageResponse<br/>1200x630 OG cards"]
        API[Route handlers<br/>/api/v1 read-only + webhooks]
        MW[Middleware<br/>Supabase session + role gate]
    end

    subgraph railway[Railway — apps/worker]
        POLL[pg-boss consumer loop]
        SCRAPE[Playwright + Cheerio + axios<br/>scrape and enrich]
        SCORE[CIS scoring engine<br/>weekly recompute]
        SYNC[Search + revalidate sync]
    end

    subgraph data[Supabase]
        PG[(Postgres<br/>source of truth<br/>+ pg-boss queue<br/>+ tsvector search)]
        AUTH[Supabase Auth]
        STOR[Supabase Storage<br/>logos + assets]
    end

    MEILI[Meilisearch<br/>added past ~5K firms]
    ANTH[Anthropic API<br/>Claude models]
    STRIPE[Stripe]
    EMAIL[Resend]
    SENTRY[Sentry + Axiom]

    U --> WEB
    BOT --> WEB
    WEB --> MW --> PG
    WEB --> AUTH
    WEB --> OG
    WEB --> STOR
    WEB -.->|read| MEILI
    API --> PG
    STRIPE -->|webhook| API

    POLL --> PG
    SCRAPE --> PG
    SCRAPE --> STOR
    SCORE --> PG
    SCORE --> ANTH
    SYNC -->|revalidateTag| API
    SYNC --> MEILI
    POLL --> EMAIL

    WEB --> SENTRY
    railway --> SENTRY
```

**Request/data flow in one line:** crawlers and users hit statically-regenerated HTML from Vercel's edge cache; the worker rebuilds facts + scores in Postgres on a cadence, then fires `revalidateTag` so the next request re-renders fresh HTML. Postgres is always the source of truth; Meilisearch and the ISR cache are derived and disposable.

---

## 2. Stack choices (decisive, with rationale)

Every row here is LOCKED per `_canon.md` §7. Rationale is condensed from the research briefs.

| Layer | Choice | Why (not the alternative) |
|---|---|---|
| Web framework | **Next.js 15, App Router**, SSR/ISR | SSR is mandatory — AI + search crawlers don't run JS; App Router gives first-party ISR + `revalidateTag`. |
| Web hosting | **Vercel Pro** | First-party App Router/ISR/OG support + Fluid Compute (Active-CPU billing) makes an I/O-bound directory cheap early. Revisit Fly.io/Hetzner only past ~$200–500/mo. |
| Worker hosting | **Dedicated Railway service** (Docker) | Playwright + Chromium + Sharp blow past Vercel's 250 MB bundle and run minutes per job — impossible on a function. Railway private networking (`.railway.internal`) is least-friction for a 2-service topology. Fly worker process group is the fallback. |
| Database | **Supabase Postgres** | No cold start on always-on public SSR (Neon's ~500 ms idle wake is an SSR latency risk); mature Supavisor pooling; bundles Auth + Storage we'd otherwise assemble. Neon only if we drop Supabase Auth and set a compute floor. |
| ORM | **Prisma** | Pooled `url` (`?pgbouncer=true`) + `directUrl` for migrations; `globalThis` singleton; `connection_limit=1` per serverless function. |
| Auth | **Supabase Auth** | Four app-owned roles modeled as a `role` enum — ~10× cheaper than Clerk at scale (~$187 vs ~$1,825/mo at 100K MAU) and co-located with the DB. Clerk's turnkey orgs aren't worth the per-MAU + $100/mo B2B add-on here. |
| Search | **Postgres `tsvector` + GIN** at launch → **Meilisearch** past ~5K firms | Zero extra infra early; Postgres stays source of truth, worker syncs to Meilisearch when typo-tolerance/proximity become growth levers. |
| Queue / jobs | **pg-boss** (Postgres-native, `SKIP LOCKED`) | Scrape jobs are low-throughput (minutes each); adding Redis just to queue is overhead. BullMQ only if we ever need thousands of jobs/sec; Inngest's per-run pricing bites at scrape scale. |
| AI | **Anthropic API (Claude)** | Haiku 4.5 for high-volume sentiment/moderation/description drafts; Sonnet 5 for query→firm matching + CIS justification; Opus 4.8 for hardest eval. Model IDs locked in `_canon.md` §8. |
| OG images | **`next/og` `ImageResponse`**, 1200×630 | Per-route dynamic score-badge cards via `opengraph-image.tsx`; edge-cached. Flexbox subset only, no CSS grid. |
| Image/asset CDN | **Supabase Storage** behind `next/image` | Worker normalizes/resizes logos with Sharp on ingest. |
| Email | **Resend** (React Email templates) | Claim verification, review-invitation links, query notifications. Transactional only at launch. |
| Payments | **Stripe** | Featured/Sponsored/Verified-Plus tiers; manual invoicing acceptable pre-self-serve. Webhooks land on a Vercel route handler. |
| Observability | **Sentry** (errors/traces) + **Axiom** (logs) | Sentry day one for scraper + SSR errors; Axiom when scraper log volume needs querying. |

### Rendering & caching strategy (per page type)

The directory is read-heavy, SEO-critical, and updated in batches by the worker — the textbook case for ISR + on-demand revalidation, not pure SSR.

| Page type | Route | Strategy |
|---|---|---|
| Country leaderboard | `/leaderboard/[country]`, `/leaderboard/[country]/[service]` | **ISR** long `revalidate` (hours) + worker fires `revalidateTag('leaderboard:{country}:{service}')` after re-score |
| Company profile | `/companies/[slug]` | **ISR** per-slug, tagged `company:{id}`; on-demand revalidate when a scrape/score updates that firm |
| Programmatic SEO | `/best-[service]-companies-in-[country]`, `/services/[service]`, `/reports/[country]` | **ISR**, tag per `service×country`; regenerate on monthly snapshot |
| Directory / filtered search | `/companies?service=&country=&...` | **SSR** (dynamic, query-dependent), not indexable for filter params |
| Methodology, home | `/methodology`, `/` | **ISR**, long revalidate |
| Dashboard / admin | `/dashboard/...`, `/admin/...` | **SSR**, `no-store`, auth-gated |
| Read-only API | `/api/v1/...` | Route handler, `s-maxage` edge cache |

The worker calls an internal revalidation route (bearer-token protected) rather than importing Next internals, so fresh scrapes/scores publish instantly while stale HTML still serves during regeneration — keeping every public page crawlable static HTML.

---

## 3. Repository structure

Monorepo (pnpm workspaces + Turborepo). One Prisma schema is the shared contract between web and worker.

```text
techfirms/
├─ apps/
│  ├─ web/                     # Next.js 15 — public site, dashboard, admin, /api
│  │  ├─ app/                  # App Router routes (see §2 table)
│  │  ├─ middleware.ts         # Supabase session + role gate
│  │  └─ package.json
│  └─ worker/                  # Railway Docker service — never on Vercel
│     ├─ src/
│     │  ├─ queue.ts           # pg-boss registration + poll loop
│     │  ├─ jobs/              # scrape, enrich, score, sync-search, revalidate
│     │  ├─ scrape/            # Playwright + Cheerio + shared axios client
│     │  └─ scoring/           # deterministic CIS engine
│     ├─ Dockerfile           # Chromium + fonts + Sharp base image
│     └─ package.json
├─ packages/
│  ├─ db/                      # Prisma schema + client singleton + migrations
│  │  ├─ prisma/schema.prisma  # SINGLE source of truth for both apps
│  │  └─ src/client.ts         # globalThis singleton export
│  ├─ ui/                      # shadcn/ui components, tokens, Tailwind preset
│  ├─ core/                    # shared domain logic: scoring types, zod schemas, enums
│  └─ config/                  # eslint, tsconfig, tailwind base
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

**Schema sharing:** `packages/db` owns `schema.prisma` and exports a typed singleton (`import { prisma } from '@techfirms/db'`). Both `apps/web` and `apps/worker` depend on it; there is exactly one generated client and one migration history. Shared enums (`Role`, `ListingStatus`, `ReviewSource`, `ClaimStatus`, `QueryStatus`, `Quadrant`, `ServiceCategory`, `SponsorshipTier`) and Zod validators live in `packages/core` so validation is identical on ingest and on API. Model names are locked in `_canon.md` §12 — full field definitions live in [Data Model & Schema](06-data-model-and-schema.md).

```ts
// packages/db/src/client.ts
import { PrismaClient } from '@prisma/client';
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
```

---

## 4. Environment & configuration

Local dev uses the existing Postgres already on this machine (`PGDATABASE=techfirms`). Prisma reads a single `DATABASE_URL`, so locally we compose it from the existing PG vars. Prod adds pooled + direct URLs, Anthropic, Supabase, Stripe, storage, and revalidation secrets.

```bash
# .env.local — composed from the existing local Postgres
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=1234
PGDATABASE=techfirms
DATABASE_URL="postgresql://postgres:1234@localhost:5432/techfirms?schema=public"
DIRECT_URL="postgresql://postgres:1234@localhost:5432/techfirms?schema=public"
```

| Variable | Scope | Purpose |
|---|---|---|
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | local | Existing local Postgres (`techfirms`); source for local `DATABASE_URL`. |
| `DATABASE_URL` | web + worker | Prisma runtime. Prod = Supavisor **pooled** (`?pgbouncer=true&connection_limit=1`). |
| `DIRECT_URL` | migrations | Non-pooled connection for `prisma migrate` (schema engine needs one direct conn). |
| `ANTHROPIC_API_KEY` | worker (+ web for on-demand) | Claude API for the 5 AI use-cases (`_canon.md` §8). |
| `NEXT_PUBLIC_SUPABASE_URL` | web | Supabase project URL (client + SSR auth). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | Public anon key for `@supabase/ssr` cookie sessions. |
| `SUPABASE_SERVICE_ROLE_KEY` | worker + server | Privileged server-side ops (never shipped to client). |
| `SUPABASE_STORAGE_BUCKET` | web + worker | Bucket for logos/OG assets (e.g. `company-assets`). |
| `STRIPE_SECRET_KEY` | web (server) | Charges/subscriptions for tiers. |
| `STRIPE_WEBHOOK_SECRET` | web (server) | Verify Stripe webhook signatures. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | web | Checkout on client. |
| `RESEND_API_KEY` | web + worker | Transactional email (claims, review invites, query alerts). |
| `MEILI_HOST` / `MEILI_MASTER_KEY` | web + worker | Search (only once past ~5K firms). |
| `REVALIDATE_SECRET` | web + worker | Bearer token the worker uses to call the web app's revalidate route. |
| `SENTRY_DSN` / `AXIOM_TOKEN` / `AXIOM_DATASET` | both | Error + log observability. |
| `WORKER_ID` | worker | Identifies a replica for job leasing + stale-job reaping. |
| `SCRAPE_RATE_MS` (default `2000`) / `MAX_JOBS_PER_TICK` | worker | Compliance rate-limit (≥1 req/2s) + drain guard. |

Secrets live in Vercel/Railway encrypted env stores; nothing sensitive is `NEXT_PUBLIC_`. `.env*` is gitignored; a committed `.env.example` documents every key above.

---

## 5. Security

- **Authz model.** Roles are the locked enum `visitor | business_owner | admin | super_admin` on the `User` row. `apps/web/middleware.ts` resolves the Supabase session, loads the role, and gates route groups: `/dashboard/*` requires `business_owner` **and** ownership of the target `Company` (checked against `claim_owner_id`); `/admin/*` requires `admin`/`super_admin`; destructive admin ops (merge, re-score, tier override) require `super_admin`. Every mutating query re-checks role/ownership in the server action — middleware is a gate, not the authorization of record. Every admin action writes an `AuditLog` row.
- **Input validation.** Shared Zod schemas in `packages/core` validate all inbound data — query-flow submissions, claim requests, review invitations, API params — on both web routes and worker ingest. Prisma parameterizes all queries (no string SQL); the one raw `tsvector` query uses parameter binding.
- **Rate limiting.** Public write endpoints (query submission, claim request, review submission) and `/api/v1/*` are rate-limited per IP + per session via a Postgres-backed sliding window (no extra infra); abusive bursts return `429`. This also feeds fake-review velocity/burst detection (`_canon.md` §6).
- **Secrets.** Encrypted platform env stores only; service-role and Stripe keys are server/worker-only; Stripe webhooks verified with `STRIPE_WEBHOOK_SECRET`; the worker→web revalidate route requires `REVALIDATE_SECRET`.
- **PII handling.** Company-level facts are stored freely. Individual reviewer contact details are minimized and access-controlled (visible only to admins and the owning claimed business). No scraping of personal employee contact data — employee signals are **aggregates only + attribution + link-out** at launch (`_canon.md` §9). Prefer role addresses (`info@`, `careers@`). Soft-delete (`deletedAt`) on user-editable rows supports erasure requests.
- **Scraper compliance.** Golden rule: never log in, never create accounts, never accept click-wrap; scrape logged-off public **facts only**, never editorial/review prose (regenerate via Claude); honor `robots.txt` + `Crawl-delay`; rate-limit ≥1 req/2s (`SCRAPE_RATE_MS`); honest User-Agent with bot info URL; log every request (timestamp/URL/status) into `ScrapeJob`/`RawScrapeRecord`; treat a Cloudflare/DataDome challenge as a "no." Detail in [Scraping & Seeding Pipeline](07-scraping-and-seeding-pipeline.md).
- **Backup / DR.** Supabase daily automated backups + PITR (Pro). Weekly `pg_dump` to Supabase Storage/R2 retained 30 days. Recovery drill quarterly. Migrations are forward-only and reversible-by-design (`prisma migrate`), applied to staging before prod. Search index and ISR cache are derived — rebuildable from Postgres, so not part of RPO.

---

## 6. CI/CD, testing, and environments

Three environments:

| Env | Web | Worker | Database |
|---|---|---|---|
| **local** | `next dev` | `tsx watch` | existing local `techfirms` Postgres |
| **staging** | Vercel preview | Railway staging service | Supabase staging project |
| **prod** | Vercel production | Railway production service | Supabase production project |

**Pipeline (GitHub Actions):** on PR → `pnpm turbo lint typecheck test build` runs across affected packages; Vercel auto-builds a preview deploy; a WCAG contrast check runs in CI (enforce AA per `_canon.md` §2). Merge to `main` → Vercel promotes to production and Railway deploys the worker image. `prisma migrate deploy` runs as a release step against prod using `DIRECT_URL`, gated behind a passing staging migration. Turborepo remote cache keeps builds fast.

**Testing strategy:**
- **Unit** (Vitest): the deterministic CIS scoring engine (Bayesian shrinkage m≈8/C≈3.5★, recency half-life ≈12mo, weights 40/25/20/15), normalization helpers, Zod validators. Scoring math is pure and fully unit-tested — the score is computed deterministically; Claude only narrates.
- **Integration:** Prisma queries + pg-boss job handlers against an ephemeral Postgres (Docker) with seed fixtures; scrape parsers tested against saved HTML fixtures (no live network in CI).
- **E2E** (Playwright): claim flow, query/lead flow, review submission, admin moderation, leaderboard render + its HTML-table equivalent.
- **AI guardrails:** golden-set tests that Claude prompts resist injection from scraped/user text and never emit the CIS number themselves.

---

## 7. Scalability path & cost envelope

Scaling is deliberately deferred until data volume forces each step; nothing here is premature.

```mermaid
flowchart LR
    A[1K firms<br/>Launch] --> B[~5K firms<br/>Add Meilisearch]
    B --> C[10K firms<br/>Scale worker replicas]
    C --> D[>25K firms<br/>Revisit Fly.io / Hetzner if bill > 200-500/mo]
```

- **Search:** Postgres `tsvector`+GIN handles 1K–5K firms comfortably; introduce Meilisearch at ~5K when typo tolerance/search-as-you-type matter. Worker syncs on each firm update.
- **Worker:** single replica handles 1K seed + weekly re-scores. At 10K, run 2–3 replicas — pg-boss `SKIP LOCKED` + `WORKER_ID` leasing + stale-job reaping make horizontal scaling safe. Scrape throughput is bounded by the ≥2s compliance delay, not compute.
- **Web:** ISR means added firms cost near-zero at read time — cache serves crawlers; only re-scored pages regenerate. Fluid Compute keeps I/O-bound SSR cheap.
- **DB:** Supabase Pro compute floor covers 10K firms + their reviews/signals/snapshots; watch connection count (pooled, `connection_limit=1`) and add read scaling only if leaderboard aggregation gets hot.

**Cost envelope (monthly, USD, order-of-magnitude):**

| Item | ~1K firms | ~10K firms |
|---|---|---|
| Vercel Pro | $20–40 | $60–150 |
| Supabase Pro | $25 | $25–60 |
| Railway worker | $10–20 | $30–60 |
| Anthropic API | $20–60 | $80–250 |
| Meilisearch (Railway/Cloud) | $0 (not yet) | $15–40 |
| Resend | $0–20 | $20 |
| Sentry + Axiom | $26 | $50–90 |
| Stripe | usage % | usage % |
| **Total** | **~$100–190** | **~$280–670** |

At the ~$200–500/mo web threshold, re-evaluate Fly.io/Hetzner for the web app; the DB, worker, and queue choices carry forward unchanged.

---

## 8. Open questions / decisions needed

- **Meilisearch host:** self-host on Railway vs Meilisearch Cloud — decide when crossing ~5K firms (cost vs ops).
- **Neon fallback:** only revisit if we ever drop Supabase Auth; would require a non-zero compute floor for public SSR. Currently not planned.
- **Crunchbase funding data:** free tier gone ($49–99/mo). Confirm whether Market Activity's funding sub-signal launches paid or defers to GitHub/RDAP-only at v1.
- **Certification verification API:** IAF CertSearch ceased 2026-01-01; validate the Global ACI successor before wiring ISO verification. Ship self-attestation + report upload now.
- **Regional data residency:** KSA/UAE/EU outreach may raise data-residency/GDPR questions — get local counsel before scaling beyond facts-only storage.
```