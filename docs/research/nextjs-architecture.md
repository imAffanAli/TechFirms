# TechFirms — Production Architecture Research Brief (Next.js 14+ / Postgres / Playwright Worker)

**Scope:** Recommended production stack for an SSR-first directory site (Next.js App Router + Postgres/Prisma) with a *separate* Playwright scraping worker on a job queue. Priority markets: Saudi/UAE, Pakistan, global. Content model: country-scoped leaderboards + company profiles.

**Bottom line up front:** Host the web app on **Vercel Pro** (or Fly.io if cost-sensitive at scale), keep the **Playwright worker OFF the web platform** on a long-running container (**Railway or Fly.io**), use **Neon or Supabase Postgres** (lean Supabase for the bundled Auth), **Prisma with a pooled connection string + singleton**, **ISR + on-demand `revalidateTag`** for directory/leaderboard/profile pages, **Postgres `tsvector` at launch → Meilisearch past ~5K firms**, and **pg-boss** for the queue (Postgres-native, no Redis).

---

## 1. Web Hosting: Vercel vs Self-host/VPS vs Fly.io

| Option | Cost signal | Best for | Trade-off |
|---|---|---|---|
| **Vercel Pro** | $20/seat/mo; $20 flex credit; 1 TB transfer included then $0.15/GB; compute $0.128/CPU-hr (Active CPU billing) ([pricing](https://vercel.com/docs/functions/usage-and-pricing), [breakdown](https://flexprice.io/blog/vercel-pricing-breakdown)) | Fastest path; first-party ISR/PPR/Server Actions support ([Vercel](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images)) | Bills balloon at high traffic; not for long-running work |
| **Fly.io** | ~$1.94/mo shared 256 MB VM; ~$15/mo dedicated 2 GB; +$2/mo IPv4 ([Ritza](https://ritza.co/articles/gen-articles/cloud-hosting-providers/fly-io-vs-vercel/)) | Container control, persistent processes, cheaper at scale | You own Docker/`output: standalone`, reverse proxy, cache config |
| **Self-host VPS (Hetzner + Coolify)** | ~€18/mo handles millions of requests; ~10–20% of Vercel at scale ([DanubeData](https://danubedata.ro/blog/best-vercel-alternatives-nextjs-hosting-2025)) | Max cost control | "Cheap until you're debugging prod at 2am" — ops burden |

**Vercel's Sept 2025 pricing** moved to a credit model: a $20/mo flexible credit offsets compute + bandwidth; **Fluid Compute** (Active-CPU billing since June 2025) only meters CPU-active ms, not I/O wait — cutting bills up to ~90% for I/O-heavy request handlers, which describes a DB-backed directory well ([Vercel docs](https://vercel.com/docs/functions/usage-and-pricing), [Flexprice](https://flexprice.io/blog/vercel-pricing-breakdown)).

**Recommendation:** Start on **Vercel Pro** for the web app — first-party App Router/ISR support and Fluid Compute make an SSR directory economical early. Revisit Fly.io/VPS only if the monthly bill crosses ~$200–500. **Never run Playwright on Vercel** — Chromium + fonts + Sharp blow past the 250 MB serverless bundle limit and scans run minutes per job, impossible on a function timeout ([Railway pattern](https://charlesjones.dev/blog/railway-infrastructure-choice-non-serverless-deployments)).

## 2. Where the Scraping Worker Runs (never inside the web app)

The worker needs a **long-running container** with Chromium, system fonts, and Sharp. Two clean patterns:

- **Railway** — put web + worker in one project with private networking (`.railway.internal`); worker uses a custom Dockerfile for Playwright/Chromium; Redis service can power the queue ([Railway](https://railway.com/deploy/playwright-with-nodejs), [Charles Jones](https://charlesjones.dev/blog/railway-infrastructure-choice-non-serverless-deployments)).
- **Fly.io** — add a second `[processes]` group in `fly.toml`; `fly deploy` ships web + worker Machines from the same image, scaled independently ([Fly](https://fly.io/rails/)).

**Recommendation:** Run the Playwright worker as a **dedicated Railway service** (or Fly worker process group) reading jobs from Postgres. Railway's integrated private networking is the least-friction for a two-service (web + worker) topology. Keep the browser pool isolated; scale worker replicas separately from web.

## 3. Database: Supabase vs Neon

| | **Supabase** | **Neon** |
|---|---|---|
| Model | BaaS on dedicated Postgres (Auth, Storage, Realtime bundled) | Serverless Postgres, compute/storage separated, scale-to-zero |
| Cold start | **None** (always-on compute) | ~500 ms cold start on idle ([Bytebase](https://www.bytebase.com/blog/neon-vs-supabase/)) |
| Pooling | Supavisor (Elixir), hit 1M-connection benchmark 2024 | Own serverless proxy/driver, lower overhead |
| Pricing | Pro $25/mo + overages; bundles auth/storage/realtime | Pro ~$19/mo + usage; scale-to-zero saves on idle |
| Auth | Included (`@supabase/ssr` cookie sessions) | Not included — bring your own |

Neon wins for bursty/branch-heavy dev workflows; Supabase wins for full-stack apps that want auth/storage/realtime in one bill ([DevToolsAcademy](https://www.devtoolsacademy.com/blog/neon-vs-supabase), [Bytebase](https://www.bytebase.com/blog/neon-vs-supabase/)). For an always-on public directory (SEO pages hit constantly), **Neon's cold start is a real SSR latency risk** unless you keep a min-compute floor.

**Recommendation:** **Supabase** — no cold-start on public SSR pages, mature Supavisor pooling, and it bundles the Auth + Storage you'd otherwise assemble separately (relevant for company logos / OG assets). Neon is a strong alternative if you don't use Supabase Auth and want scale-to-zero economics; if chosen, run a non-zero compute floor for the public site.

## 4. Auth & Roles (visitor / business_owner / admin / super_admin)

| | **Supabase Auth** | **Clerk** |
|---|---|---|
| Pricing after free tier | $0.00325/MAU after 50K free | $0.02/MAU after 10K free |
| At 100K MAU | ~**$187/mo** | ~**$1,825/mo** ([Medium](https://medium.com/better-dev-nextjs-react/clerk-vs-supabase-auth-vs-nextauth-js-the-production-reality-nobody-tells-you-a4b8f0993e1b)) |
| RBAC | Manual — roles via DB + RLS policies | Turnkey Orgs + roles (up to 10, `org:role`); custom roles need B2B add-on **$100/mo** ([Clerk](https://clerk.com/articles/organizations-and-role-based-access-control-in-nextjs)) |
| Next.js DX | `@supabase/ssr` cookie sessions in RSC/middleware/routes (much improved 2025–26) | Drop-in `<SignIn/>`, `<UserButton/>`, ~5-line middleware |

**Recommendation:** **Supabase Auth.** Your four roles are simple and app-owned — model them as a `role` enum on the user row and enforce in middleware + Prisma queries (and RLS if you expose PostgREST). It's ~10x cheaper at scale than Clerk and co-locates with the DB you're already running. Choose Clerk only if you want polished B2B org invitations out-of-the-box and can absorb the per-MAU cost. The community consensus: "Supabase Auth if you're on Supabase" ([Makerkit](https://makerkit.dev/blog/tutorials/better-auth-vs-clerk)).

## 5. Prisma Patterns

- **Two URLs:** runtime `url` = pooled connection (Supavisor/PgBouncer, append `?pgbouncer=true`); `directUrl` = direct connection for `prisma migrate` — the schema engine needs a single non-pooled connection ([Prisma docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)).
- **Singleton client** on `globalThis` to survive Next.js hot-reload in dev; fresh instance per serverless deploy in prod ([digitalapplied](https://www.digitalapplied.com/blog/prisma-orm-production-guide-nextjs)).
- **Serverless connection limit:** start `connection_limit=1` per function and let the pooler multiplex ([Prisma](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections)).
- **Schema fit:** normalize the four trust signals into related tables (`Company`, `Review`, `EmployeeSentiment`, `TrustSignal`, `IntelligenceScore`) with a `Country`/`Service` taxonomy; add a generated `tsvector` column + GIN index for search (below).
- Consider **Prisma Accelerate** only if you go all-serverless and hit cold-connection pain; on Supabase's own pooler it's usually redundant.

## 6. Rendering & Caching (directory / profile / leaderboard)

Directory content is read-heavy, SEO-critical, and updated in batches by the scraper — the textbook case for **ISR + on-demand revalidation**, not pure SSR ([Next.js ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration)).

| Page type | Strategy |
|---|---|
| Country leaderboards ("top AI dev companies in Saudi Arabia 2026") | **ISR** with long `revalidate` (e.g. hours) + **`revalidateTag('leaderboard:sa:ai')`** fired by the worker after a re-score |
| Company profiles | **ISR** per-slug, tagged `company:{id}`; on-demand revalidate when a scrape/score updates that firm |
| Search results / filtered lists | **SSR** (dynamic, query-dependent) |
| Owner/admin dashboards | **SSR**, `no-store`, auth-gated |

Use `revalidateTag()`/`revalidatePath()` from the worker (or an API route the worker calls) so fresh scrapes/scores publish instantly while cached HTML still serves during regeneration ([revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath), [how revalidation works](https://nextjs.org/docs/app/guides/how-revalidation-works)). This keeps pages LLM-crawlable static HTML (good for your "LLMs cite us" goal) while staying current.

## 7. Search: Postgres `tsvector` → Meilisearch

Launch with **Postgres full-text search** (generated `tsvector` column + GIN index) — zero extra infra, fine for filtering firms by name/service/country at low volume ([Supabase](https://supabase.com/blog/postgres-full-text-search-vs-the-rest)). Known limits: strict token matching ("lambo" ≠ "Lamborghini"), no real typo tolerance (pg_trgm only partially helps), and not tuned for sub-50ms search-as-you-type ([Nomadz](https://nomadz.pl/en/blog/postgres-full-text-search-or-meilisearch-vs-typesense)).

**Migration path:** keep Postgres as source of truth; **add Meilisearch (or Typesense) past ~5K firms** or when search becomes a growth lever — both handle misspellings and word proximity that Postgres can't, and scale independently. Sync via the worker on each firm update ([Medium](https://medium.com/@simbatmotsi/postgres-full-text-search-vs-meilisearch-vs-elasticsearch-choosing-a-search-stack-that-scales-fcf17ef40a1b)). Meilisearch is the lighter, more DX-friendly default for a directory.

## 8. Background Jobs / Queue

| Option | Infra | Throughput | Note |
|---|---|---|---|
| **pg-boss** | Postgres only (SKIP LOCKED, ACID) | ~100–200 jobs/s | No Redis; reuses your DB ([GitHub](https://github.com/timgit/pg-boss)) |
| **BullMQ** | Requires Redis | thousands/s | Priorities, flows, rate-limit; overkill early |
| **Inngest** | Managed, no infra | per-run pricing | Step durability, deploys with Next.js; cost grows with volume |
| DB-polling worker | Postgres | low | Simplest; what many reference projects use |

**Recommendation:** **pg-boss.** Scrape jobs are low-throughput (minutes each), and adding Redis just for queuing is "engineering overhead pg-boss avoids" ([PkgPulse](https://www.pkgpulse.com/guides/bullmq-vs-bee-queue-vs-pg-boss-job-queues-nodejs-2026)). It gives ACID scheduling/retries in the DB you already run. Move to **BullMQ** only if you later need thousands of jobs/sec. **Inngest** is the pick only if you want zero worker infra and accept per-run pricing.

## 9. Images / CDN / OG Generation

- **OG cards:** Use Next.js `ImageResponse` (`@vercel/og` = Satori + Resvg → PNG) via `opengraph-image.tsx` per dynamic route (`[country]/[service]`, company slug). Vercel auto-adds `Cache-Control` for edge caching. Constraint: **flexbox only, no CSS grid**, subset of properties ([Next.js](https://nextjs.org/docs/app/api-reference/functions/image-response), [Vercel](https://vercel.com/docs/og-image-generation)). Dynamic OG per leaderboard/profile materially boosts social + LLM link previews.
- **Company logos / assets:** Supabase Storage (or Cloudflare R2 if self-hosting) behind `next/image`; the worker uses Sharp to normalize/resize on ingest.

## 10. Observability

- **Sentry** for errors/traces (Team $26/mo billed annually, 50K errors) — stack traces, breadcrumbs, release tracking; the app-level layer.
- **Axiom** for logs at the data level — free Personal tier (500 GB ingest, 30-day retention), paid from $25/mo/1TB; native Vercel integration ([SoloDevStack](https://solodevstack.com/blog/sentry-vs-axiom-solo-developers)).

**Recommendation:** **Sentry** from day one (catch scraper + SSR errors), add **Axiom** when scraper log volume needs querying. They're complementary, not either/or.

---

## Recommendations for TechFirms (concrete stack)

1. **Web:** Vercel Pro (App Router SSR + ISR, Fluid Compute). Re-evaluate Fly.io if bill > ~$200/mo.
2. **Worker:** Dedicated Railway service (or Fly worker process group) running Playwright + Sharp in a custom Docker image — **never on Vercel**.
3. **DB:** Supabase Postgres (no cold start for public SSR, bundled Auth/Storage). Neon acceptable if you skip Supabase Auth and set a compute floor.
4. **Auth:** Supabase Auth; roles as a `role` enum enforced in middleware + Prisma (~10x cheaper than Clerk at scale).
5. **Prisma:** pooled `url` (`?pgbouncer=true`) + `directUrl` for migrations, `globalThis` singleton, `connection_limit=1` in serverless.
6. **Rendering:** ISR + on-demand `revalidateTag` for leaderboards/profiles (worker triggers revalidation); SSR for search/dashboards.
7. **Search:** Postgres `tsvector`/GIN at launch → Meilisearch past ~5K firms (Postgres stays source of truth, worker syncs).
8. **Queue:** pg-boss (Postgres-native); BullMQ only if throughput demands it.
9. **OG/Images:** `ImageResponse` per-route dynamic cards; Supabase Storage + `next/image` for logos.
10. **Observability:** Sentry now, Axiom when log volume grows.

**Confidence:** High on hosting split, queue, rendering, and Prisma patterns (well-documented, consistent sources). Medium on Supabase-vs-Neon — depends on whether you commit to Supabase Auth; both are production-grade. **Hype flag:** Inngest's "zero infra" is real but per-run pricing bites at scrape scale; pg-boss is the safer default for a scraper-heavy workload.

---

## Sources

- https://vercel.com/docs/functions/usage-and-pricing
- https://flexprice.io/blog/vercel-pricing-breakdown
- https://danubedata.ro/blog/best-vercel-alternatives-nextjs-hosting-2025
- https://ritza.co/articles/gen-articles/cloud-hosting-providers/fly-io-vs-vercel/
- https://www.buildwithmatija.com/blog/nextjs-16-self-hosted-alternatives-flyio-cloud-run-vps
- https://railway.com/deploy/playwright-with-nodejs
- https://charlesjones.dev/blog/railway-infrastructure-choice-non-serverless-deployments
- https://fly.io/rails/
- https://www.bytebase.com/blog/neon-vs-supabase/
- https://www.devtoolsacademy.com/blog/neon-vs-supabase
- https://makerkit.dev/blog/tutorials/better-auth-vs-clerk
- https://medium.com/better-dev-nextjs-react/clerk-vs-supabase-auth-vs-nextauth-js-the-production-reality-nobody-tells-you-a4b8f0993e1b
- https://clerk.com/articles/organizations-and-role-based-access-control-in-nextjs
- https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
- https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections
- https://www.digitalapplied.com/blog/prisma-orm-production-guide-nextjs
- https://nextjs.org/docs/app/guides/incremental-static-regeneration
- https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- https://nextjs.org/docs/app/guides/how-revalidation-works
- https://supabase.com/blog/postgres-full-text-search-vs-the-rest
- https://nomadz.pl/en/blog/postgres-full-text-search-or-meilisearch-vs-typesense
- https://medium.com/@simbatmotsi/postgres-full-text-search-vs-meilisearch-vs-elasticsearch-choosing-a-search-stack-that-scales-fcf17ef40a1b
- https://github.com/timgit/pg-boss
- https://www.pkgpulse.com/guides/bullmq-vs-bee-queue-vs-pg-boss-job-queues-nodejs-2026
- https://www.buildmvpfast.com/blog/inngest-vs-trigger-dev-vs-bullmq-background-jobs-nextjs-2026
- https://nextjs.org/docs/app/api-reference/functions/image-response
- https://vercel.com/docs/og-image-generation
- https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images
- https://solodevstack.com/blog/sentry-vs-axiom-solo-developers
