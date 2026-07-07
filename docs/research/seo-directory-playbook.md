# SEO Playbook for Large Directory / Marketplace Sites (2025–2026)
### Grounded research brief for TechFirms — a country-scoped tech-company reputation directory

**Scope:** programmatic SEO at scale, internal linking, schema.org (with Google's self-serving-review trap), sitemaps, canonicals, faceted navigation / crawl budget, Core Web Vitals for Next.js, and per-page OG images. Confidence flags and sources inline.

---

## 1. Programmatic SEO without a thin-content / scaled-content-abuse penalty

The pSEO model (one template × thousands of data rows) is exactly how directories scale — and exactly what Google's **Scaled Content Abuse** policy targets. Google's Aug 2025 and Dec 2025 core/spam updates tightened enforcement, and the pattern most penalized is the "keyword-swap doorway": 1,000 pages identical except a city or service name ([getpassionfruit](https://www.getpassionfruit.com/blog/programmatic-seo-traffic-cliff-guide), [seo-marketing.koeln](https://seo-marketing.koeln/en/programmatic-seo-scaling-visibility-without-triggering-a-google-spam-penalty/)). Google's own definition of *doorway pages* is low-value pages built to rank for narrow query variants that funnel users to the same destination.

**What survives (practitioner consensus, medium confidence):**
- **Unique data per page, not unique prose.** Each leaderboard must differ on *real* data — company sets, ratings, funding, employee-sentiment aggregates — not just a swapped country string. This is TechFirms' natural moat: four proprietary trust signals + an AI Company Intelligence Score are hard to templatize thinly.
- **Quality gate before publish.** Sources recommend an eligibility rule: don't publish a `top AI companies in [country]` page unless you have ≥ N qualifying companies with sufficient data density; otherwise it's a soft-404/thin page ([blogseo](https://www.blogseo.io/blog/programmatic-seo-quality-rules-avoid-thin-content)). Rough practitioner targets: ≥ 500 words of genuinely differentiated content, and meaningful uniqueness vs. sibling pages (numbers vary by source; treat as directional, not Google-official).
- **Pruning loop.** Monitor Search Console for "Duplicate/Soft 404" and de-index or consolidate low-value combos rather than leaving them crawlable forever.

> **Reality check:** No official word-count or "% unique" threshold exists — those numbers are blog heuristics. The *durable* signal is genuine per-page value, which for TechFirms = data, not filler.

---

## 2. Schema.org markup — and the self-serving-review landmine

**Critical, high confidence — this directly hits TechFirms' core feature.** Google's Review Snippet docs state: *"If the entity that's being reviewed controls the reviews about itself, their pages that use `LocalBusiness` or any other type of `Organization` structured data are ineligible for the star review feature."* This applies to native testimonials **and** embedded third-party widgets ([Google review-snippet docs](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)).

Implication: TechFirms hosts reviews *about* other companies on its own domain. Because TechFirms is a **third party** (not the reviewed entity, and not controlled by it), review/AggregateRating markup on a company profile is generally **permitted** — this is the same posture as Clutch/G2/Trustpilot. The forbidden pattern would be a company marking up its *own* reviews on its *own* site. Keep the distinction crisp in implementation.

Additional Google rules to encode:
- **Visibility parity:** marked-up review content must be visible on the page, and it must be *immediately obvious* the page has reviews. `ratingValue`/`reviewCount` in JSON-LD must **exactly match** the on-page numbers.
- **`ratingCount` or `reviewCount` required** for AggregateRating; use a dot decimal (`4.4`, not `4,4`).
- **One review target:** don't attach one rating to multiple "things" ([Search Engine Journal](https://www.searchenginejournal.com/google-reminds-websites-to-use-one-review-target/560861/)).

| Page type | Schema types to emit |
|---|---|
| Company profile | `Organization` + `AggregateRating` + `Review` (+ `Service`), `BreadcrumbList` |
| Country leaderboard | `ItemList` (ranked, `position` on each `ListItem`), `BreadcrumbList`, optional `FAQPage` |
| Any page with Q&A | `FAQPage` (only for genuine on-page FAQs) |

> **ItemList caveat (high confidence):** Google's *carousel* rich result only supports Recipe, Course, Movie, Restaurant ([Carousel docs](https://developers.google.com/search/docs/appearance/structured-data/carousel)) — so leaderboards **won't** earn a carousel SERP feature. Still emit `ItemList`: it clarifies ranking/order for crawlers and LLMs (aligned with the "be the cited source" goal). All items must be the same type and the markup must mirror visible content/order.

---

## 3. Scaled internal linking

Directory link equity dies in orphan pages. Use a **hub-and-spoke** model: country/service hub pages → individual company profiles, with company profiles linking back up to their relevant leaderboards ([digitalapplied](https://www.digitalapplied.com/blog/internal-linking-strategy-2026-large-site-architecture-guide)). Practitioner data: bidirectional pillar/cluster linking moved one site from 40% → 70% Googlebot page coverage. Maintain a generated link map (every URL: primary keyword, hub assignment, links-out/links-in) rather than ad-hoc links. For TechFirms this is programmable: each profile auto-links to `[service] in [country]`, `[service] globally`, and sibling companies; each leaderboard cross-links adjacent countries and adjacent services.

---

## 4. Faceted navigation & crawl budget (Google-official)

From [Google's faceted-navigation crawling doc](https://developers.google.com/crawling/docs/faceted-navigation):
- **Preferred:** `robots.txt` **disallow** filter-parameter URLs (e.g. `disallow: /*?*rating=`, keep `allow: /*?service=all$`), **or** URL-**fragment** (`#`) based filters which "have no impact on crawling."
- **Less effective / not recommended as primary:** `rel=canonical` ("generally less effective in the long term" — Google still must crawl to see it) and `rel=nofollow` (requires nofollow on *every* anchor to that URL).
- If facet URLs must be indexable: use `&` as the standard param separator, keep a consistent param order, and **return HTTP 404** for empty filter combinations (don't redirect).
- Google's doc notably does **not** recommend `noindex` here (noindex still burns crawl budget since the page is crawled).

**For TechFirms:** make only *curated, high-value* filter combos real indexable URLs (e.g. `top-ai-development-companies/saudi-arabia`); render all other user-facing filters (rating slider, team size, min reviews) as **JS/fragment filters that never mint crawlable URLs**, and disallow any stray parameter patterns in robots.txt.

---

## 5. Sitemaps & canonicals for a large site

- **Limits:** 50,000 URLs and 50 MB per sitemap file; use a **sitemap index** above that ([Next.js generateSitemaps](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps)).
- **Next.js App Router:** use `sitemap.ts` with **`generateSitemaps()`**, which shards to `/sitemap/[id].xml` — compute `id * 50000` offsets against Postgres. Segment by type (profiles / leaderboards / static) for cleaner indexing diagnostics.
- **Canonical:** self-referencing canonical on every primary page; canonicalize pagination and sorted variants to the base leaderboard; never canonicalize a country page to a different country. Don't rely on canonical to fix crawl budget (§4).

---

## 6. Core Web Vitals targets (Next.js)

Google "good" thresholds at the **75th percentile** of real users (CrUX) ([Google CWV docs](https://developers.google.com/search/docs/appearance/core-web-vitals)):

| Metric | Good | Notes for Next.js |
|---|---|---|
| **LCP** | ≤ 2.5 s | `next/image` with `priority` on hero; SSR/RSC; CDN; fast TTFB |
| **INP** | ≤ 200 ms | (replaced FID Mar 2024) minimize client JS, prefer Server Components, break long tasks |
| **CLS** | ≤ 0.1 | width/height on all images, reserve space, `font-display: swap` |

Only ~48% of mobile pages pass all three (2025 Web Almanac) — a real edge if TechFirms nails it. SSR is already mandated in the stack; keep leaderboard interactivity (filters, sorting) from bloating client JS to protect INP.

---

## 7. Per-page OG images

Use Next.js **`opengraph-image.tsx`** route files + the **`ImageResponse`** API (`next/og`, built on Satori/resvg — flexbox + CSS subset only) ([Next.js opengraph-image docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)). Colocate at each dynamic segment so it receives route params; default size 1200×630. Generate branded cards per profile (company name, rating, CIS score) and per leaderboard (`Top AI Companies in Saudi Arabia 2026` + top-3). Consider caching/persisting generated images rather than rendering on every crawl to control cost; edge runtime speeds cold starts.

---

## Recommendations for TechFirms (prioritized)

1. **P0 — Get review markup posture right.** Emit `Organization`+`AggregateRating`+`Review` on profiles as a *third-party* directory (allowed), but enforce visible-content parity and exact number matching. Do **not** let any company control markup of its own reviews. Validate with Rich Results Test.
2. **P0 — Data-density quality gate.** Block auto-publish of any leaderboard/profile below a minimum-data threshold; this is the single biggest defense against the Scaled Content Abuse policy.
3. **P0 — Faceted nav discipline.** Only curated `service × country` combos become crawlable URLs; all other filters are JS/fragment-based; robots.txt disallows parameter patterns.
4. **P1 — Sharded sitemap index** via `generateSitemaps()`, segmented by type; self-referencing canonicals; 404 on empty facets.
5. **P1 — Programmatic hub-and-spoke internal linking** generated from the DB (profile ↔ leaderboards ↔ siblings ↔ adjacent countries).
6. **P1 — `ItemList` on leaderboards** (with `position`) for LLM/crawler clarity even without a carousel SERP feature; `BreadcrumbList` sitewide; `FAQPage` only where real FAQs exist.
7. **P2 — CWV budget:** LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1 at p75; guard INP as filters grow.
8. **P2 — Per-page OG images** via `ImageResponse`, cached, showing rating + CIS score.
9. **Ongoing — Pruning loop** on Search Console soft-404/duplicate signals.

---

## Sources
- Google — Managing crawling of faceted navigation: https://developers.google.com/crawling/docs/faceted-navigation
- Google — Review snippet (Review, AggregateRating) structured data: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Google — Carousel (ItemList) structured data: https://developers.google.com/search/docs/appearance/structured-data/carousel
- Google — Breadcrumb (BreadcrumbList) structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google — General structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google — Understanding Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Google — Crawl budget management: https://developers.google.com/crawling/docs/crawl-budget
- Search Engine Journal — Google reminds websites to use one review target: https://www.searchenginejournal.com/google-reminds-websites-to-use-one-review-target/560861/
- Next.js — generateSitemaps: https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
- Next.js — sitemap.xml metadata file: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Next.js — opengraph-image / twitter-image: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- Next.js — ImageResponse: https://nextjs.org/docs/app/api-reference/functions/image-response
- Passionfruit — Programmatic SEO without traffic loss: https://www.getpassionfruit.com/blog/programmatic-seo-traffic-cliff-guide
- BlogSEO — Programmatic SEO quality rules to avoid thin content: https://www.blogseo.io/blog/programmatic-seo-quality-rules-avoid-thin-content
- seo-marketing.koeln — Scaling without a Google spam penalty: https://seo-marketing.koeln/en/programmatic-seo-scaling-visibility-without-triggering-a-google-spam-penalty/
- DigitalApplied — Internal linking strategy for large sites 2026: https://www.digitalapplied.com/blog/internal-linking-strategy-2026-large-site-architecture-guide
- web.dev — How Core Web Vitals thresholds were defined: https://web.dev/articles/defining-core-web-vitals-thresholds
