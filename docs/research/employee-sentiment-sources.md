# Employee-Sentiment Data Layer — Sources, Legal Constraints & Compliant Approach

Research brief for TechFirms (reputation layer for tech companies). Scope: the six major employee-review sources, what aggregate signals are publicly visible, API availability/cost, and the ToS/legal envelope for scrape vs. display vs. link-out. Date: 2026-07-07.

## 1. Source-by-source landscape

| Source | Public aggregate signals | Official API? | Realistic access cost | Notes |
|---|---|---|---|---|
| **Glassdoor** | Overall (1–5), Culture & Values, Work/Life Balance, Compensation & Benefits, Career Opportunities, Senior Management; **% Recommend to a Friend**; **% CEO Approval**; DEI rating | **No public API.** Closed to public in 2021; since 2024 enterprise-partner-only, undisclosed pricing ([glassdoor.com/developer](https://www.glassdoor.com/developer/index.htm)) | Enterprise partnership (opaque, likely 5-figure+) or 3rd-party scrape | Owned by Recruit Holdings (same parent as Indeed). Richest signal set; most defensively litigious. |
| **Indeed Company Reviews** | Overall (1–5) + sub-ratings: Work/Life Balance, Compensation/Benefits, Job Security/Advancement, Management, Culture; % who'd recommend | No open official API for reviews | 3rd-party scrape only | Also Recruit Holdings; deepening backend integration with Glassdoor. |
| **AmbitionBox** (India) | Overall (e.g. 4.0/5), Work/Life Balance, Culture, Career, Salary/Compensation, Job Security, % recommend; 10M+ monthly users | No public API | Apify actor (~$1–10 / 1k results) | Best coverage for **India/Pakistan-adjacent** IT-services firms — highly relevant to TechFirms' Pakistan market. |
| **Comparably** | Structured culture/comp/leadership scores, letter grades, comp broken down by gender/ethnicity/role; culture "labels" | No public API | Scrape | Owned by ZoomInfo. Strong structured culture taxonomy. |
| **kununu** (DACH/Europe) | Overall score, work-environment ratings, salary comparison, gender-pay-gap, employer transparency score | No public API | Scrape | Owned by New Work SE (XING). Europe-focused; low MENA/Pakistan relevance. |
| **Blind** | Verified-employee discussion + total-comp data; company "Buzz" sentiment; not a clean 1–5 aggregate | No public API | Scrape (hard; email-verified walls) | 8M+ verified professionals. Qualitative, US-tech-heavy; hard to normalize. |

Sources: [Glassdoor ratings help](https://help.glassdoor.com/s/article/Ratings-on-Glassdoor), [AmbitionBox/Glassdoor overview](https://www.glassdoor.co.in/Reviews/AmbitionBox-com-Reviews-E810170.htm), [Blind top-10 sites](https://www.teamblind.com/blog/top-10-company-review-sites-for-researching-employers-in-2025/), [Built In alternatives](https://builtin.com/articles/glassdoor-alternatives-employer-branding-reputation).

**Key structural takeaway:** *No source offers a usable public/affordable official API.* Glassdoor explicitly shut open developer access (2021) and restricts to enterprise partners (2024) ([DEV: Glassdoor API 2026](https://dev.to/agenthustler/glassdoor-api-in-2026-why-developers-are-switching-to-web-scraping-na0)). Every viable path is scraping or buying pre-scraped datasets.

## 2. Third-party data acquisition — real prices

- **Bright Data Glassdoor datasets:** 35.4M+ company records / 28.5M+ review records; **$250 per 100K records = $0.0025/record**, min order $250 ([brightdata.com/products/datasets/glassdoor](https://brightdata.com/products/datasets/glassdoor), [pricing/datasets](https://brightdata.com/pricing/datasets)). Free Glassdoor scraper tier ~5K records/month.
- **Apify actors** (Glassdoor, Indeed, AmbitionBox reviews scrapers): pay-per-result, typically **$1–10 per 1,000 results**; light Cheerio actors bill compute at ~$0.20/CU ([Apify pricing](https://apify.com/pricing), [use-apify pricing](https://use-apify.com/docs/what-is-apify/apify-pricing)). Named actors exist for [Indeed reviews](https://apify.com/memo23/apify-indeed-reviews/api) and [AmbitionBox reviews](https://apify.com/getdataforme/ambitionbox-reviews-scraper/api).
- **RapidAPI "Real-Time Glassdoor Data"**: free basic → ~$150/mo MEGA tier ([RapidAPI pricing](https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-glassdoor-data/pricing)).

Buying Bright Data's pre-built dataset is the cheapest, most defensible bulk option; per-company on-demand refresh via Apify is best for the "top companies in [country]" leaderboard cadence.

## 3. Legal landscape (US case law) — the load-bearing part

**Scraping *public* data is broadly lawful under CFAA, but contract + copyright are the real battlegrounds.**

- **hiQ v. LinkedIn (9th Cir., Apr 2022):** scraping *publicly accessible* data does **not** violate the CFAA ([Justia](https://law.justia.com/cases/federal/appellate-courts/ca9/17-16783/17-16783-2022-04-18.html)). **But** the case *ended badly for the scraper*: Dec-2022 consent judgment — **$500K against hiQ for breach of LinkedIn's user agreement**, plus a permanent injunction to stop scraping and destroy derived data ([Privacy World](https://www.privacyworld.blog/2022/12/linkedins-data-scraping-battle-with-hiq-labs-ends-with-proposed-judgment/)). Lesson: CFAA safe ≠ contract safe, and creating a logged-in **account** (accepting ToS) is what sinks you.
- **Meta v. Bright Data (N.D. Cal., Jan 23 2024):** summary judgment for the scraper. Judge Chen held Meta's ToS govern "your use" by *account holders*; **logged-off scraping of public data is not "use" and is not barred**, and the perpetual "survival" anti-scraping clause was **unenforceable** ([FBM analysis](https://www.fbm.com/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/), [Bright Data](https://brightdata.com/blog/web-data/court-rules-in-favor-of-bright-data-in-meta-v-bright-data-case)). Meta dropped its remaining claim, waiving appeal.
- **X Corp v. Bright Data (N.D. Cal., May 9 2024):** court dismissed X's breach-of-ToS claims as **preempted by the Copyright Act** ("conflict preemption") — a platform can't use its ToS to build a "private copyright system" that lets it exclude others from *public* content it only holds a non-exclusive license to ([Skadden](https://www.skadden.com/insights/publications/2024/05/district-court-adopts-broad-view), [Goldman blog](https://blog.ericgoldman.org/archives/2024/05/x-corp-v-bright-data-is-the-decision-weve-been-waiting-for-guest-blog-post.htm)). Strongly pro-scraper for *public* data.

**Copyright of review content — Feist doctrine:**
- **Facts and numbers are not copyrightable** (*Feist v. Rural Telephone*, 1991) — an aggregate star rating, % recommend, or CEO-approval number is an uncopyrightable fact ([Justia](https://supreme.justia.com/cases/federal/us/499/340/)).
- The **verbatim prose of an individual review IS copyrightable** (original expression). Copying full review text is the high-risk act; reproducing the numeric aggregates is low-risk.

**Net legal read (moderate-high confidence, US law only):** displaying *aggregate numbers* + *linking out* to the source is the lowest-risk posture. Reproducing full third-party review *text* is the riskiest. The 2024 rulings favor scrapers **only when logged-off / no account / public data / no ToS acceptance.** Contract exposure spikes the moment you create an account or click-accept a ToS.

**Caveats:** these are US district/circuit decisions, not Supreme Court; the 9th Circuit is scraper-friendlier than other circuits. GDPR/UK-GDPR (kununu, EU data subjects), India's DPDP Act (AmbitionBox), and Saudi PDPL / UAE PDPL add **personal-data** obligations independent of US copyright — anonymous aggregate numbers largely sidestep these, but individual reviews may constitute personal data.

## 4. Recommendations for TechFirms

**Launch (v1) — "store aggregates + link out":**
1. **Display only aggregate numbers**, never verbatim review text: overall score, sub-scores (culture, comp, WLB, career), % recommend, CEO approval. These are Feist-uncopyrightable facts.
2. **Always attribution + deep link out** to the source profile ("Employee sentiment: 4.0/5 on Glassdoor — see 57 reviews →"). Link-out reduces both copyright and unfair-competition exposure and is defensible as factual reporting.
3. **Acquire via logged-off scraping or bought datasets** — start with **Bright Data's Glassdoor dataset ($0.0025/record)** for bulk, **Apify actors** for on-demand leaderboard refresh. **Never create logged-in accounts or click-accept ToS** on any source (this is the hiQ trap).
4. **Store a normalized sentiment schema** now: `{source, overall, culture, comp, wlb, career, recommend_pct, ceo_approval_pct, review_count, as_of_date, source_url}`. This feeds the AI Company Intelligence Score and future native reviews without re-architecting.
5. **Prioritize sources by market:** Glassdoor + Indeed (global/MENA), **AmbitionBox (Pakistan/India IT-services — best regional coverage)**, kununu only if you expand to DACH. Deprioritize Blind (no clean aggregate, hard to scrape, US-tech-only).
6. **Cache with timestamps + "as of" labels.** Show recency; refresh leaderboards on a schedule. Keep raw scraped text out of the DB where possible — store computed aggregates, not source prose.

**v2 — native anonymous employee reviews:**
7. Build **first-party anonymous reviews** to own the data outright (eliminates all scraping/copyright dependency and becomes a moat). Model it after Glassdoor's dimension set for comparability.
8. Gate quality with email-domain verification (Blind's model) to fight astroturfing; this also strengthens the "trust layer" positioning.
9. Keep aggregates from external sources as a *fallback/enrichment* layer, clearly labeled, always link-out.

**Do / Don't summary:** ✅ aggregates + link-out + logged-off collection + bought datasets + timestamps. ❌ full review text, logged-in accounts, ToS click-accept, reproducing personal data of named reviewers, presenting stale numbers as current.

## Sources
- https://www.glassdoor.com/developer/index.htm
- https://help.glassdoor.com/s/article/Ratings-on-Glassdoor
- https://dev.to/agenthustler/glassdoor-api-in-2026-why-developers-are-switching-to-web-scraping-na0
- https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-glassdoor-data/pricing
- https://brightdata.com/products/datasets/glassdoor
- https://brightdata.com/pricing/datasets
- https://apify.com/pricing
- https://use-apify.com/docs/what-is-apify/apify-pricing
- https://apify.com/memo23/apify-indeed-reviews/api
- https://apify.com/getdataforme/ambitionbox-reviews-scraper/api
- https://www.glassdoor.co.in/Reviews/AmbitionBox-com-Reviews-E810170.htm
- https://www.teamblind.com/blog/top-10-company-review-sites-for-researching-employers-in-2025/
- https://builtin.com/articles/glassdoor-alternatives-employer-branding-reputation
- https://law.justia.com/cases/federal/appellate-courts/ca9/17-16783/17-16783-2022-04-18.html
- https://www.privacyworld.blog/2022/12/linkedins-data-scraping-battle-with-hiq-labs-ends-with-proposed-judgment/
- https://www.fbm.com/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/
- https://brightdata.com/blog/web-data/court-rules-in-favor-of-bright-data-in-meta-v-bright-data-case
- https://www.skadden.com/insights/publications/2024/05/district-court-adopts-broad-view
- https://blog.ericgoldman.org/archives/2024/05/x-corp-v-bright-data-is-the-decision-weve-been-waiting-for-guest-blog-post.htm
- https://supreme.justia.com/cases/federal/us/499/340/
