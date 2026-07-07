# TechFirms

**An AI-first reputation layer and directory for technology companies.** TechFirms aggregates customer reviews, employee-sentiment signals, and public trust signals into a deterministically-computed **Company Intelligence Score (CIS, 0–100)**, then organizes companies into country-scoped, Gartner-style leaderboards (Leaders · Challengers · Rising Stars · Niche Players). It launches **Saudi Arabia → UAE → Pakistan** first — high-intent markets underserved by Clutch/G2/DesignRush — and is engineered from the ground up to be the source that search engines **and LLMs cite** for "the best tech companies in [country]."

> 📚 **Full product, design, data & build documentation lives in [`docs/`](docs/).** Start at [`docs/README.md`](docs/README.md). The locked, canonical decisions (brand hexes, fonts, score weights, URL patterns, stack) are in [`docs/research/_canon.md`](docs/research/_canon.md). The step-by-step build order is in [`docs/19-build-sequence.md`](docs/19-build-sequence.md).

## Repository layout

```
techfirms/
├─ react/     # Frontend — Next.js 15 (App Router, SSR/ISR). Public site, dashboards, admin.
├─ node/      # Backend — Node 22 + TypeScript + Express + Prisma. REST API, scraper worker,
│             #           scoring engine, AI integration, pg-boss job queue.
└─ docs/      # The complete spec set (00–19) + cited research appendix.
```

The frontend renders **server-side** (mandatory for SEO + LLM citability) and fetches data from the `node/` REST API at request time. The backend owns the database, the scraping/enrichment pipeline, the CIS scoring engine, AI features, and scheduled jobs.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 · React 19 · Tailwind · shadcn/ui · Recharts · Geist/Inter fonts |
| Backend | Node 22 · TypeScript · Express · Prisma · pg-boss · Zod · Pino |
| Database | PostgreSQL (local: `techfirms`; prod: Supabase) |
| AI | Anthropic Claude (Haiku 4.5 / Sonnet 5 / Opus 4.8) |
| Scraping | Playwright + Cheerio (facts-only, logged-off, compliant) |

## Getting started (local dev)

> Requires Node 22+, npm 10+, and a local PostgreSQL with a `techfirms` database.

```bash
# Backend
cd node
cp .env.example .env        # then fill in DATABASE_URL, ANTHROPIC_API_KEY, etc.
npm install
npm run prisma:generate
npm run prisma:migrate      # create the schema
npm run dev                 # starts the API on http://localhost:4000

# Frontend (separate terminal)
cd react
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                 # starts the site on http://localhost:3000
```

## Status

Planning and scaffolding phase. The documentation suite is complete; application code is being built out following [`docs/19-build-sequence.md`](docs/19-build-sequence.md).

---

<sub>Design principle: rankings are **never** for sale — sponsorship is always labeled and never influences the Company Intelligence Score. See [`docs/15-monetization-and-pricing.md`](docs/15-monetization-and-pricing.md).</sub>
