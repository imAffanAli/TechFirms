# GEO / LLM SEO Research Brief for TechFirms (2025–2026)

**Scope:** Evidence-based assessment of Generative Engine Optimization (GEO) as TechFirms' claimed moat — separating what is empirically supported from what is vendor hype. Prepared 2026-07-07.

---

## 1. Verdict up front: what actually works vs. speculative

| Tactic | Evidence strength | Verdict |
|---|---|---|
| Quotable stats + cited quotations in-copy ("answer blocks") | **Strong** (Princeton GEO / KDD 2024, +40% visibility) | **Works — do it** |
| Third-party mentions & citations (G2, Reddit, Trustpilot, news) | **Strong** (Ahrefs 75k brands: r=0.664) | **Works — highest leverage** |
| Freshness / date-stamping + recurring refresh | **Strong** (Perplexity 3.2x for <30d content) | **Works** |
| Structured data (Schema.org) + clean semantic HTML | **Moderate** (68% of AI-Overview citations use schema; correlational) | **Works — cheap, do it** |
| SSR / crawlable HTML (no client-only rendering) | **Strong** (table stakes; AI crawlers rarely run JS) | **Mandatory** |
| **llms.txt** | **Weak/none** (no major LLM confirmed to use it) | **Speculative — ship it, expect ~0 return** |

**Bottom line for the pitch:** GEO is a *real* discipline with peer-reviewed backing, but the moat is NOT llms.txt or any single file. The moat is being the *entity that authoritative third parties cite* for "best tech companies in [country]," plus dense, dated, quotable leaderboard pages. That is defensible and compounding; llms.txt is not.

---

## 2. llms.txt: the honest picture

**What it is:** A proposed standard (Markdown file at `/llms.txt`) proposed by Jeremy Howard on **3 Sept 2024**. Uses H2 headers to point LLMs at high-value content (docs, policies, product taxonomies) — conceptually robots.txt/sitemap.xml for LLMs. ([Ahrefs](https://ahrefs.com/blog/what-is-llms-txt/))

**Adoption:** Real but shallow. ~28% of studied domains (38,360 of 137,000) publish a valid file; notable adopters include Anthropic, Stripe, Cloudflare, Cursor, Vercel, Mintlify. ([Ahrefs](https://ahrefs.com/blog/what-is-llms-txt/), [Codersera](https://codersera.com/blog/llms-txt-complete-guide-2026/))

**Does anything read it? Largely no.**
- **97% of llms.txt files receive zero requests** in a typical month. One audit of 500M+ AI-bot visits found only **408 requests** targeted llms.txt directly. ([Ahrefs](https://ahrefs.com/blog/what-is-llms-txt/), [longato.ch](https://www.longato.ch/llms-recommendation-2025-august/))
- Google's **Gary Illyes (July 2025)** confirmed Google does not support it and has no plans to. Google's John Mueller compared it to the deprecated keywords meta tag: *"AFAIK none of the AI services have said they're using LLMs.TXT… why not just check the site directly?"* ([Ahrefs](https://ahrefs.com/blog/what-is-llms-txt/))
- OpenAI (GPTBot), Anthropic, and Meta crawlers honor robots.txt but none *officially* consume llms.txt. Anthropic publishes one but does not claim its crawlers use it.
- **Where it does help:** IDE coding agents (Cursor, Continue, Cline) and some MCP integrations. Irrelevant to TechFirms' consumer/LLM-answer use case.

**Recommendation:** Auto-generate `/llms.txt` and `/llms-full.txt` (near-zero cost with Next.js route handlers) as cheap insurance, but treat expected ROI as **zero**. Do not put it in the investor deck as the moat.

---

## 3. How the engines actually select and cite sources

Key structural fact: **source pools barely overlap.** Analyses of ~680M citations found only **11–12% domain overlap between ChatGPT and Perplexity**, and only **~12% of AI-cited URLs overlap with Google's top-10 results.** You must optimize per-engine, and classic SEO rank is a weak proxy. ([authoritytech](https://authoritytech.io/curated/ai-citation-11-percent-platform-overlap-per-engine-audit-2026), [Discovered Labs](https://discoveredlabs.com/blog/ai-citation-patterns-how-chatgpt-claude-and-perplexity-choose-sources))

| Engine | Retrieval behavior | Favored sources | Freshness sensitivity |
|---|---|---|---|
| **ChatGPT** (search) | ~87% alignment with Bing's top results | **Wikipedia 47.9%** of top-10 cites; Yelp, BBB, G2/Capterra, local media | Weak explicit freshness signal |
| **Perplexity** | Live retrieval; ~1 in 3 cites rank in Google top-10 | **Reddit 46.7%**, YouTube 13.9% | **Strongest** — indexes in hours; <30d content gets 3.2x cites |
| **Claude** | No browsing by default; training data (~Jan 2025); browse/Citations API when enabled | Trustworthy/technical sources; Constitutional-AI bias | Weak (training-cutoff bound) |
| **Gemini / Google AI Overviews** | Grounded in Google index | Schema-marked, high-authority pages; ~85% of cites <2yrs old | Moderate–strong |

Implication for TechFirms: **Wikipedia + Reddit + G2/Capterra/Trustpilot presence** is disproportionately valuable because those three surfaces feed the two biggest engines. A leaderboard nobody discusses on Reddit or references on Wikipedia will be under-cited by Perplexity and ChatGPT regardless of on-page quality.

---

## 4. The "answer block" / quotable-statistic tactic (best-supported lever)

The **Princeton/IIT-Delhi GEO paper (KDD 2024, GEO-bench = 10,000 queries, 9 strategies)** is the strongest primary evidence in the space. It found content edits that add **statistics, cited quotations, and source citations lift visibility in AI answers by up to ~40%.** "Statistics Addition," "Cite Sources," and "Quotation Addition" were the top-performing strategies. ([arXiv](https://arxiv.org/pdf/2311.09735), [Princeton](https://collaborate.princeton.edu/en/publications/geo-generative-engine-optimization/))

Corroborating practitioner data: statistics +22% visibility, verifiable quotations +37%. ([arfadia](https://blog.arfadia.com/ai-search-geo-statistics-2026-sourced-updated/))

**Copy-pasteable pattern (an "answer block"):** a 40–60 word, self-contained passage that (a) states one extractable claim, (b) contains a specific number, (c) includes a date, (d) names the entity/country explicitly. Example for TechFirms:

> *"As of Q2 2026, the top-rated AI development company in Saudi Arabia is [X], with a TechFirms Company Intelligence Score of 92/100 across 148 verified reviews (source: TechFirms, updated July 2026)."*

Structure pages as **200–400 word sections under clear H2/H3s, with bulleted lists, tables, and FAQ blocks** — all three major engines extract at the passage level. ([Discovered Labs](https://discoveredlabs.com/blog/ai-citation-patterns-how-chatgpt-claude-and-perplexity-choose-sources))

---

## 5. Structured data & semantic HTML

Correlational but consistent: **68% of AI-Overview-cited pages use structured data**; schema-marked pages are cited ~2.5–3.2x more often in several vendor studies (treat exact multipliers as directional, not causal). Microsoft's Bing PM has confirmed schema helps Copilot's LLMs parse content; Google says schema is *not required* for AI Mode but schema-marked pages are *preferred* among citation candidates. ([Stackmatix](https://www.stackmatix.com/blog/structured-data-ai-search), [globerunner](https://globerunner.com/structured-data-schema-markup-ai-2026/))

For TechFirms, ship: `Organization`, `Review`/`AggregateRating`, `ItemList` (for leaderboards), `FAQPage`, `BreadcrumbList`, and `Article` (with `datePublished`/`dateModified`). Note: Google **removed FAQ rich *results*** from SERPs, but FAQ *markup* still aids LLM parsing — keep it for GEO, don't expect SERP stars. ([yositeup](https://yositeup.com/blog/structured-data-seo-2026-guide))

SSR is non-negotiable: AI crawlers generally do not execute client-side JS, so Next.js App Router SSR/streaming with fully-rendered HTML is a hard requirement, not a nicety.

---

## 6. Brand mentions & third-party citations (the real moat)

The single strongest quantified signal in the literature:
- **Ahrefs (75,000 brands): brand web mentions correlate with AI citation at r=0.664 — ~3x stronger than backlinks (r=0.218).** Mentions count *even without a hyperlink.* ([search result summary; Ahrefs study](https://ahrefs.com/blog/what-is-llms-txt/))
- **SE Ranking:** domains active on G2/Capterra/Trustpilot see ~**3x** higher ChatGPT citation rates; strong Reddit/Quora presence ~**4x**. ([search-derived](https://tely.ai/blog/10-generative-engine-optimization-geo-ranking-factors-for-2025))
- Princeton and follow-on work document a **citation bias toward authoritative third-party ("earned") sources over brand-owned content.**

This is directly on-strategy: TechFirms' output (leaderboards, scores, review aggregates) is inherently *citable third-party data*. The growth motion is to get the *TechFirms brand and its leaderboards mentioned on Reddit, Wikipedia, industry blogs, and press* — so the engines learn "TechFirms" as the entity associated with "best tech companies in [country]."

---

## 7. Freshness

- **65% of AI-bot traffic** targets content published/updated within the past year; only 6% cites content older than 6 years. ([writesonic](https://writesonic.com/blog/how-content-freshness-affects-ai-citations))
- ~**half of AI-cited content is <13 weeks old**; content <30 days old earns ~3.2x more citations (Perplexity especially). A page loses ~50% of citation potential within 12 months. ([arfadia](https://blog.arfadia.com/ai-search-geo-statistics-2026-sourced-updated/), [authoritytech](https://authoritytech.io/blog/content-freshness-seo-ai-2026))

TechFirms' country leaderboards should carry a visible, *real* `dateModified` and be re-generated on a cadence (weekly/monthly), with year in the URL/title ("…2026") rolled forward. This is a natural fit for the Playwright scraping worker + scheduled regeneration.

---

## 8. Recommendations for TechFirms

1. **Bake answer blocks into the leaderboard template.** Every profile and country page opens with a 40–60 word, dated, number-bearing, entity-named summary (see §4). This is the highest-ROI, lowest-effort lever and is peer-reviewed.
2. **Make third-party citation a product & growth KPI, not an afterthought.** Seed and monitor TechFirms mentions on Reddit (r/webdev, country subreddits), Quora, G2/Capterra, and pursue a Wikipedia/Wikidata entity. This is the actual moat (r=0.664).
3. **Ship full Schema.org coverage** (`ItemList`, `Review`, `AggregateRating`, `Organization`, `FAQPage`, `Article` with dates). Cheap, correlational upside, and aligns with your data model.
4. **Enforce SSR everywhere** — no client-only leaderboard rendering. Verify with "view source" that rankings/scores are in raw HTML.
5. **Freshness pipeline:** auto-stamp real `dateModified`, roll year-tokens forward, regenerate leaderboards on a schedule. Target refresh <90 days for priority markets (Saudi/UAE/Pakistan).
6. **Generate llms.txt/llms-full.txt** as free insurance — but do **not** position it as the moat internally or to investors. Evidence says ~0 return today.
7. **Optimize per-engine:** Reddit/YouTube presence for Perplexity; Wikipedia/entity clarity + G2 for ChatGPT; schema + authority for Google AI Overviews. Don't assume Google rank transfers (only ~12% overlap).
8. **Measure, don't assume.** Stand up AI-citation tracking (Profound/Evertune-style or in-house prompt panels across ChatGPT/Perplexity/Gemini) so the "we are the cited source" claim is instrumented, not asserted.

---

## Sources

- Ahrefs — What Is llms.txt: https://ahrefs.com/blog/what-is-llms-txt/
- Codersera — llms.txt guide 2026: https://codersera.com/blog/llms-txt-complete-guide-2026/
- Longato — Why AI crawlers ignore llms.txt (2025 audit): https://www.longato.ch/llms-recommendation-2025-august/
- Princeton GEO paper (arXiv PDF): https://arxiv.org/pdf/2311.09735
- Princeton publication record: https://collaborate.princeton.edu/en/publications/geo-generative-engine-optimization/
- Discovered Labs — AI citation patterns: https://discoveredlabs.com/blog/ai-citation-patterns-how-chatgpt-claude-and-perplexity-choose-sources
- authoritytech — 11% platform overlap audit: https://authoritytech.io/curated/ai-citation-11-percent-platform-overlap-per-engine-audit-2026
- authoritytech — content freshness 2026: https://authoritytech.io/blog/content-freshness-seo-ai-2026
- Tely AI — 10 GEO ranking factors (SE Ranking data): https://tely.ai/blog/10-generative-engine-optimization-geo-ranking-factors-for-2025
- Stackmatix — structured data for AI search: https://www.stackmatix.com/blog/structured-data-ai-search
- Globerunner — structured data/schema AI 2026: https://globerunner.com/structured-data-schema-markup-ai-2026/
- Yositeup — structured data 2026 / FAQ removal: https://yositeup.com/blog/structured-data-seo-2026-guide
- Writesonic — content freshness & AI citations: https://writesonic.com/blog/how-content-freshness-affects-ai-citations
- Arfadia — AI search/GEO statistics 2026: https://blog.arfadia.com/ai-search-geo-statistics-2026-sourced-updated/
