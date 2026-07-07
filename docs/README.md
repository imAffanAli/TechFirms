# TechFirms — Documentation

**TechFirms** is an AI-first reputation layer and directory for technology companies. It aggregates customer reviews, employee-sentiment signals, and public trust signals into an AI-computed **Company Intelligence Score (CIS, 0–100)**, then organizes companies into country-scoped, Gartner-style leaderboards (Leaders, Challengers, Rising Stars, Niche Players). It launches Saudi Arabia → UAE → Pakistan first — high-intent markets underserved by Clutch/G2/DesignRush — and is engineered from the ground up to be the source that LLMs and answer engines cite for "the best tech companies in [country]."

This folder is the complete product, design, data, and build documentation. The canonical, locked decisions live in [`research/_canon.md`](research/_canon.md) — every numbered doc conforms to it.

## How to read these docs

- **New engineer:** Start with [00 — Overview & Vision](00-overview-and-vision.md), then [17 — Tech Architecture & Infra](17-tech-architecture-and-infra.md) and [06 — Data Model & Schema](06-data-model-and-schema.md). Then read the pipelines you'll touch: [07 — Scraping & Seeding](07-scraping-and-seeding-pipeline.md), [08 — Scoring & Leaderboards](08-scoring-and-leaderboards.md), [11 — AI Features](11-ai-features-spec.md), [16 — Public API](16-public-api-spec.md). Keep [`research/_canon.md`](research/_canon.md) open as your source of truth, and follow [18 — Roadmap & Build Plan](18-roadmap-and-build-plan.md) for sequencing.
- **Designer:** Start with [03 — Design System](03-design-system.md), then [04 — Information Architecture & Sitemap](04-information-architecture-and-sitemap.md) and [05 — Personas, User Flows & Journeys](05-user-flows-and-journeys.md). Reference [12](12-admin-panel-spec.md)/[13](13-business-dashboard-spec.md)/[14](14-query-and-leadgen-flow.md) for the screens you'll design, and the brand tokens in [`research/_canon.md`](research/_canon.md) §2.
- **Founder / investor:** Start with [00 — Overview & Vision](00-overview-and-vision.md), then [01 — Market & Competitor Analysis](01-market-and-competitor-analysis.md), [15 — Monetization & Pricing](15-monetization-and-pricing.md), and [18 — Roadmap & Build Plan](18-roadmap-and-build-plan.md). For the "why we get cited by AI" thesis, read [10 — GEO / LLM Optimization](10-geo-llm-optimization.md).

---

## Table of contents

### Strategy
| Doc | Description |
|---|---|
| [00 — Product Overview & Vision](00-overview-and-vision.md) | What TechFirms is, the CIS thesis, and the AI-citability wedge. |
| [01 — Market & Competitor Analysis](01-market-and-competitor-analysis.md) | Clutch, G2, DesignRush, techreviewer.co and the open KSA/Pakistan lane. |
| [02 — User Research & Feature-Gap Analysis](02-user-research-and-feature-gaps.md) | What buyers, vendors, and job-seekers actually want; incumbent gaps. |
| [18 — Roadmap & Phased Build Plan](18-roadmap-and-build-plan.md) | Phased milestones from seed data to self-serve monetization. |

### Design & UX
| Doc | Description |
|---|---|
| [03 — Design System (Brand, Tokens, Components)](03-design-system.md) | Signal Teal / Ink Navy / Intelligence Violet, type scale, shadcn components. |
| [04 — Information Architecture & Sitemap](04-information-architecture-and-sitemap.md) | Route map, navigation, and the indexable page taxonomy. |
| [05 — Personas, User Flows & Journey Maps](05-user-flows-and-journeys.md) | Personas and end-to-end flows for buyers, owners, and admins. |

### Data & AI
| Doc | Description |
|---|---|
| [06 — Data Model & Database Schema](06-data-model-and-schema.md) | Prisma models, enums, and relationships (source of truth for the DB). |
| [07 — Scraping & Seed-Data Pipeline](07-scraping-and-seeding-pipeline.md) | Legal, logged-off, facts-only scraping and enrichment worker. |
| [08 — Intelligence Score & Country Leaderboards](08-scoring-and-leaderboards.md) | CIS weights, Bayesian reviews model, cohort quadrants. |
| [11 — AI Features Spec (Anthropic Integration)](11-ai-features-spec.md) | The five Claude use-cases and prompt-injection defenses. |

### Growth
| Doc | Description |
|---|---|
| [09 — SEO Playbook (Technical & Programmatic)](09-seo-playbook.md) | Programmatic SEO, structured data, sitemaps, Core Web Vitals. |
| [10 — GEO / LLM / Answer-Engine Optimization](10-geo-llm-optimization.md) | Answer blocks, third-party citation as the real moat, llms.txt. |
| [16 — Public & Internal API Specification](16-public-api-spec.md) | `/api/v1` read API surface and internal contracts. |

### Product Specs
| Doc | Description |
|---|---|
| [12 — Admin Panel Specification](12-admin-panel-spec.md) | Moderation, claim approval, tier/sponsorship overrides, audit log. |
| [13 — Business (Claimed Company) Dashboard Spec](13-business-dashboard-spec.md) | Claimed-company profile management, analytics, review invitations. |
| [14 — Query / Lead-Generation Flow Spec](14-query-and-leadgen-flow.md) | Buyer query → AI matching → forwarded lead pipeline. |
| [15 — Monetization & Pricing Strategy](15-monetization-and-pricing.md) | Featured/Sponsored/Verified-Plus ladder and regional pricing. |

### Platform
| Doc | Description |
|---|---|
| [17 — Technical Architecture & Infrastructure](17-tech-architecture-and-infra.md) | Next.js + Supabase + Railway worker, ISR strategy, monorepo layout. |

### Research Appendix (`research/`)
Primary research briefs the numbered docs are synthesized from. **[`research/_canon.md`](research/_canon.md) is the locked source of truth.**

| File | Description |
|---|---|
| [`research/_canon.md`](research/_canon.md) | **Canonical locked decisions** — names, hexes, weights, URLs, models. |
| [`research/competitors-landscape.md`](research/competitors-landscape.md) | Competitor landscape overview. |
| [`research/clutch.md`](research/clutch.md) | Deep-dive on Clutch. |
| [`research/techreviewer.md`](research/techreviewer.md) | Deep-dive on techreviewer.co (traffic + market signal). |
| [`research/user-sentiment.md`](research/user-sentiment.md) | Buyer / user sentiment and feature-gap research. |
| [`research/employee-sentiment-sources.md`](research/employee-sentiment-sources.md) | Employee-sentiment data sources and legal posture. |
| [`research/scraping-legal-tech.md`](research/scraping-legal-tech.md) | Scraping legality, techniques, and reusable patterns. |
| [`research/scoring-methodology.md`](research/scoring-methodology.md) | CIS scoring & leaderboard methodology research. |
| [`research/seo-directory-playbook.md`](research/seo-directory-playbook.md) | SEO playbook for directory sites. |
| [`research/geo-llm-optimization.md`](research/geo-llm-optimization.md) | GEO / LLM answer-engine optimization evidence base. |
| [`research/monetization-pricing.md`](research/monetization-pricing.md) | Monetization and pricing research. |
| [`research/design-branding.md`](research/design-branding.md) | Brand and design-token research. |
| [`research/nextjs-architecture.md`](research/nextjs-architecture.md) | Next.js architecture and stack research. |
| [`research/_source-master-build-prompt.md`](research/_source-master-build-prompt.md) | Original master build prompt (source input). |

---

## Canonical decisions at a glance

> Pulled from [`research/_canon.md`](research/_canon.md) (Locked v1 · 2026-07-07). If anything below conflicts with a numbered doc, the canon wins.

**Brand colors**
- Primary — Signal Teal: core/logo `#11A69E` (teal-500); primary button & links-on-white `#0F6E6B` (teal-700); accent-on-dark `#2CC7BD` (teal-400).
- Anchor — Ink Navy: `#0A1B2E` (navy-950).
- AI accent — Intelligence Violet (CIS only): `#6D3EF0` (violet-600).
- Marketing background: warm off-white `#F7F5F2`. **Red (`#EF4444`) = errors only, never an accent.**

**Fonts**
- Display/headings: **Geist** · Body/UI: **Inter** · Numeric/data/mono: **Geist Mono** (`tnum`) · Arabic RTL: **Noto Sans Arabic**.
- CSS vars: `--font-display:"Geist"`, `--font-sans:"Inter"`, `--font-mono:"Geist Mono"`. Scale: 1.25 major-third, base 16px.

**Company Intelligence Score (CIS) weights**
- Customer Reviews **40%** · Employee Sentiment **25%** · Trust Signals **20%** · Market Activity **15%** (renormalize when a signal is missing).
- Reviews: Bayesian shrinkage (prior m ≈ 8 @ C ≈ 3.5★), recency half-life ≈ 12 months.
- Leaderboard gate: ≥5 verified reviews AND ≥3 recent (≤18 months). Cohorts = country × service, median split. Recompute weekly; freeze monthly snapshots.

**Key URL patterns**
- Company profile: `/companies/[slug]` · Directory: `/companies?service=&country=`
- Leaderboard: `/leaderboard/[country]` and `/leaderboard/[country]/[service]`
- Programmatic SEO: `/best-[service]-companies-in-[country]` (and `-in-[city]`)
- Service hub: `/services/[service]` · Country report: `/reports/[country]` · Methodology: `/methodology`
- Claim: `/claim/[slug]` · Dashboard: `/dashboard/...` · Admin: `/admin/...` · API: `/api/v1/...` · LLM manifest: `/llms.txt`

**Stack:** Next.js 14+/15 App Router (SSR/ISR) · Tailwind + shadcn/ui + Recharts · Supabase Postgres + Prisma · Supabase Auth · dedicated Railway/Fly scraper worker (Docker, pg-boss queue) · Anthropic Claude (Haiku 4.5 / Sonnet 5 / Opus 4.8) · Stripe · Sentry + Axiom.

---

## Status & next steps

- **Docs:** Numbered docs `00`–`18` and the research appendix are complete; `research/_canon.md` is locked at v1 (2026-07-07). This README is the entry point.
- **Immediate next steps:**
  1. Scaffold the monorepo (`apps/web`, `apps/worker`, `packages/db`, `packages/ui`) and land the Prisma schema from [06](06-data-model-and-schema.md).
  2. Stand up the scraping/enrichment worker ([07](07-scraping-and-seeding-pipeline.md)) and seed ~1,000 firms as `unclaimed`.
  3. Implement the deterministic CIS + leaderboards ([08](08-scoring-and-leaderboards.md)) and the answer-block leaderboard template ([10](10-geo-llm-optimization.md)).
  4. Ship the first three GTM leaderboards: AI Development (KSA), Custom Software (UAE), Web/Custom Software (Pakistan).
- **Open items to validate:** all pricing figures in [15](15-monetization-and-pricing.md) are hypotheses (`validate`); AI-citation tracking must be instrumented to prove the GEO thesis; confirm Claude model pricing against the API docs at build time.
