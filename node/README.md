# TechFirms — Backend (`node/`)

Node 22 + TypeScript + Express + Prisma. Serves the public REST API, runs the scraper/enrichment worker, the CIS scoring engine, Anthropic AI integration, and pg-boss scheduled jobs. See [`../docs/17-tech-architecture-and-infra.md`](../docs/17-tech-architecture-and-infra.md) and the build order in [`../docs/19-build-sequence.md`](../docs/19-build-sequence.md).

## Setup

```bash
cp .env.example .env         # set DATABASE_URL / DIRECT_URL / ANTHROPIC_API_KEY
npm install
npm run prisma:generate      # generate the Prisma client
npm run prisma:migrate       # create/apply the schema (needs Postgres running)
npm run dev                  # API on http://localhost:4000  (GET /health)
npm run worker               # background worker (separate process)
```

## Layout

```
src/
├─ index.ts            # Express API entrypoint
├─ worker.ts           # pg-boss background worker (scraper, scoring, AI)
├─ config/env.ts       # validated environment (zod)
├─ db/prisma.ts        # Prisma client singleton
├─ utils/logger.ts     # pino logger
├─ middleware/         # error handling, (later) auth/role gate
├─ api/v1/             # public REST routers (docs/16)
├─ services/           # domain logic: scoring, matching, enrichment (docs/08, 11)
├─ jobs/               # queue handlers & schedules (docs/07)
└─ scripts/            # seed / maintenance scripts
prisma/
└─ schema.prisma       # full data model (docs/06) — 23 models, 10 enums
```

The Prisma schema in `prisma/schema.prisma` is the one specified in [`../docs/06-data-model-and-schema.md`](../docs/06-data-model-and-schema.md).
