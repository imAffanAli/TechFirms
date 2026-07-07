# Web Scraping for Directory Seeding (2025–2026): Legal, Technical & Enrichment Brief

Prepared for TechFirms — a country-scoped "reputation layer" directory. This brief covers what you can legally scrape to seed profiles, how modern anti-bot systems will fight you, and which enrichment APIs to buy vs. scrape. Bottom line up front: **scrape facts, license or API the rest, never copy editorial text/reviews, and treat contract (ToS) + GDPR — not the CFAA — as your real risk.**

---

## 1. Legal landscape

### The CFAA is largely off the table for public data
The *hiQ v. LinkedIn* saga (2017–2022) established in the Ninth Circuit that scraping **publicly accessible** data (no login, no auth bypass) does **not** violate the Computer Fraud and Abuse Act — there is no "unauthorized access" when there's no access gate ([Wikipedia](https://en.wikipedia.org/wiki/HiQ_Labs_v._LinkedIn); [Ninth Circuit opinion PDF](https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/18/17-16783.pdf)). **But hiQ still lost the war**: the November 2022 settlement entered a **$500,000 judgment** against hiQ for breach of LinkedIn's user agreement plus common-law **trespass to chattels** and **misappropriation**, with a permanent injunction to stop scraping and destroy all derived data ([Proskauer](https://newmedialaw.proskauer.com/2022/12/08/hiq-and-linkedin-reach-proposed-settlement-in-landmark-scraping-case/); [Morgan Lewis](https://www.morganlewis.com/blogs/sourcingatmorganlewis/2022/12/linkedin-v-hiq-landmark-data-scraping-suit-provides-guidance-to-data-scrapers-and-web-operators)). Note the settlement is **not precedential**. Lesson: the exposure moved from federal computer-crime law to **contract and state tort law**.

### Meta v. Bright Data — the key 2024 win for scrapers
On **23 January 2024**, Judge Chen (N.D. Cal.) granted Bright Data summary judgment: Facebook/Instagram ToS govern *"your use"* of the product, so an entity scraping **logged-off** (no account authenticated) *"stands in the same shoes as a visitor to whom the terms cannot apply."* Logged-off scraping of public data — and its resale — did **not** breach contract ([Proskauer](https://newmedialaw.proskauer.com/2024/01/24/california-court-issues-noteworthy-decision-on-breach-of-contract-claims-in-web-scraping-dispute/); [Quinn Emanuel](https://www.quinnemanuel.com/the-firm/news-events/client-alert-meta-v-bright-data-significant-decision-for-web-scraping-industry/)). Meta dropped the case in Feb 2024, waiving appeal ([TechCrunch](https://techcrunch.com/2024/02/26/meta-drops-lawsuit-against-web-scraping-firm-bright-data-that-sold-millions-of-instagram-records/)). **Practical rule: never log in, never create fake accounts, never accept a click-wrap.** LinkedIn sued **Proxycurl (Nubela)** in Jan 2025 precisely for *"creating hundreds of thousands of fake accounts"* to scrape — Proxycurl **shut down entirely by July 2025** ([Linked API guide](https://linkedapi.io/guides/how-to-scrape-linkedin)). Fake accounts convert a contract dispute into CFAA + fraud.

### Three separate legal buckets (don't conflate them)
| Bucket | Protects | Your exposure |
|---|---|---|
| **ToS / breach of contract** | Site's rules of use | High **if** you click-through/log in; low if logged-off & no assent (Meta v. Bright Data) |
| **Copyright** | *Expression* — editorial text, review prose, curated descriptions | High if you copy text; **facts are not copyrightable** |
| **EU sui generis database right** (Directive 96/9/EC) | "Substantial investment" in obtaining/verifying/presenting a DB | Extraction of a *substantial part* is infringing, independent of copyright |

Copyright protects only the *expression* of facts, not facts themselves ([EC digital-strategy](https://digital-strategy.ec.europa.eu/en/policies/protection-databases)). The EU **sui generis** right is separate from copyright and is **not** cleared by the AI/TDM exception — so mass extraction for AI training can still infringe ([Kluwer Copyright Blog](https://legalblogs.wolterskluwer.com/copyright-blog/protecting-university-repositories-from-aggressive-web-scraping-using-database-rights-to-retain-control-over-academic-content/)). Critically, the CJEU (*Ryanair v PR Aviation*) held that where data is **not** protected by IP, operators may still impose **contractual** screen-scraping bans via T&Cs ([Pinsent Masons](https://www.pinsentmasons.com/out-law/news/website-operators-can-prohibit-screen-scraping-of-unprotected-data-via-terms-and-conditions-says-eu-court-in-ryanair-case)). So in the EU your defense is "we scraped facts, logged-off, no assent to T&Cs."

### GDPR / PECR — your biggest real risk (contact data)
Company facts (name, domain, HQ, services) are mostly fine. **Personal data — names, personal emails, phone numbers of employees — triggers GDPR.** France's **CNIL fined KASPR €240,000** for scraping LinkedIn contact details, *even where users had restricted visibility* ([Octoparse GDPR guide](https://www.octoparse.com/blog/gdpr-compliance-in-web-scraping)). B2B outreach can rely on **legitimate interest (Art. 6(1)(f))**, but requires a documented **Legitimate Interest Assessment (LIA)** (purpose / necessity / balancing) and clear opt-out ([GDPR Local](https://gdprlocal.com/b2b-gdpr/)). Under UK **PECR**, marketing email to **corporate subscribers** (companies, LLPs, govt) does **not** need prior consent; email to individuals/sole traders does ([Hybrid Legal](https://www.hybridlegal.co.uk/blog/using-business-emails-for-b2b-cold-outreach-in-the-uk-what-you-can-and-cant-do)). EU DPAs issued **330+ fines in 2025** ([Scrap.io](https://scrap.io/gdpr-cold-email-b2b)). **Recommendation: store company-level facts freely; treat individual contacts as high-risk — prefer generic role addresses (info@, sales@) and log provenance.**

---

## 2. Technical & ethical crawling

### robots.txt — voluntary but legally load-bearing
robots.txt is a **voluntary** signal (formalized as **RFC 9309**, an IETF standard, 2022), not technically enforced ([SearchEngineWorld](https://www.searchengineworld.com/rfc9309-robots-txt-quietly-became-an-official-internet-standard)). But **ignoring it is used as evidence of bad faith**: fetching robots.txt then disregarding `Crawl-delay` is treated as a *stronger* bad-faith signal than never fetching it ([SparkProxy](https://www.sparkproxy.io/blog/guide-on-ethical-scraping-and-rate-limiting)). Respect it, honor `Crawl-delay`, and identify with a real UA string (e.g. `TechFirmsBot/1.0 (+https://techfirms.co/bot)`) — this plus rate-limiting materially weakens any civil claim.

### Rate limiting
Default to **≥1s** between requests when no delay is specified; **2–5s for small sites (<100k pages)** ([SparkProxy](https://www.sparkproxy.io/blog/guide-on-ethical-scraping-and-rate-limiting)). Log timestamp/URL/status for every request — these logs are your evidence you behaved.

### Anti-bot systems — Cloudflare, DataDome, HUMAN
These are sophisticated and detection has advanced in 2025–26:
- **TLS fingerprinting (JA3 → JA4):** servers hash the ClientHello (cipher suites, extensions). **JA4 replaced JA3 as the 2026 industry standard** after Chrome 110's extension randomization broke JA3; Cloudflare, AWS WAF, Akamai, VirusTotal all use JA4 ([krowdev](https://krowdev.com/article/bot-detection-2026/)).
- **HTTP/2 fingerprinting:** frame ordering, header-compression, stream priorities — real browsers have quirks HTTP libraries don't; described as DataDome's most significant signal and *"the reason no universal bypass exists"* ([krowdev](https://krowdev.com/article/bot-detection-2026/)).
- **Behavioral ML:** mouse Bezier curves, Fitts's-Law deceleration; Cloudflare analyzes **>46M requests/sec** ([krowdev](https://krowdev.com/article/bot-detection-2026/)).
- **LLM-crawler detection (new 2025):** DataDome added it; LLM crawler traffic **rose from 2.6% (Jan) to >10% (Aug) 2025** ([krowdev](https://krowdev.com/article/bot-detection-2026/)).

**Ethical stance for TechFirms:** if a target sits behind DataDome/Cloudflare-managed-challenge, that's an explicit "no bots" signal — **don't fight it**. Rotating residential proxies + spoofed fingerprints to defeat anti-bot is exactly the conduct that looks like bad faith in litigation. Prefer APIs, sitemaps, and low-defense sources.

---

## 3. Enrichment APIs — availability, cost, legality

| Signal | Best source | Cost (2025–26) | Legality / notes |
|---|---|---|---|
| **Domain age** | **RDAP** (modern JSON WHOIS); WhoisJSON | RDAP largely **free/no key**; WhoisJSON **1,000 free/mo**; Apify actors ~**$0.001/domain** | Fully legal — public registration data ([Apify](https://apify.com/automation-lab/domain-age-checker); [WhoisJSON](https://whoisjson.com/)) |
| **SSL / TLS cert** | WhoisJSON SSL endpoint; crt.sh (Certificate Transparency, free) | Bundled with WhoisJSON; CT logs free | Legal — public ([WhoisJSON](https://whoisjson.com/)) |
| **GitHub org activity** | **GitHub REST API** (official) | Free: **5,000 req/hr authenticated** (60 unauth); GitHub App **15,000/hr** | Legal via API; respect secondary limit (**900 pts/min**) ([GitHub Docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)) |
| **LinkedIn follower count** | ⚠️ No compliant official option for third-party company data | Third-party scrapers $$ + risky | **High risk.** LinkedIn sued Proxycurl → shut down 2025; KASPR fined €240k. **Recommend: use LinkedIn's own follower badge/manual, or skip** ([Linked API](https://linkedapi.io/guides/how-to-scrape-linkedin)) |
| **Funding / Crunchbase** | Crunchbase API | **Free tier eliminated 2025**; Basic **$49/mo**, Pro **$99/mo** ($588/yr), Business **$199/mo**; **API = custom enterprise pricing** ([Crunchbase](https://about.crunchbase.com/products/crunchbase-api); [DEV](https://dev.to/agenthustler/crunchbase-api-in-2026-free-tier-gone-what-startup-data-hunters-do-now-1177)) | License it; TOS forbids rescraping. Consider alternatives (e.g. Clay pipelines) |
| **Certifications (ISO 27001 etc.)** | **IAF CertSearch API** (bulk/real-time) | Paid API | ⚠️ **IAF ceased operation 1 Jan 2026 → replaced by Global Accreditation Cooperation (Global ACI)** — verify successor DB before building ([IAF CertSearch](https://www.iafcertsearch.org/)) |
| **SOC 2** | No central public registry | — | SOC 2 reports are private audits — rely on **self-attestation + uploaded report**, not a lookup API |

---

## Recommendations for TechFirms

1. **Facts-only scraping doctrine.** Scrape structured *facts* (company name, domain, services, HQ, tech stack signals). **Never** copy editorial descriptions, review prose, or Glassdoor text — that's copyright + EU sui generis exposure. Regenerate all descriptive copy with the Anthropic API from facts.
2. **Logged-off, no-assent, no fake accounts — always.** This is the single most protective rule (Meta v. Bright Data). The moment you log in or click "I agree," you're in hiQ/Proxycurl territory.
3. **Prefer APIs and sitemaps over Playwright against defended sites.** Your Playwright worker should target low-defense, robots-permitted pages. If Cloudflare/DataDome throws a managed challenge, treat it as "no" and move on — don't build a fingerprint-spoofing arms race that reads as bad faith.
4. **Buy the enrichment that's cheap and clean:** RDAP domain age (~free), crt.sh/WhoisJSON for SSL, GitHub REST API for org activity. These are legal, structured, and cover 3 of your 4 trust signals cheaply.
5. **Budget for Crunchbase or route funding via a licensed reseller** — free tier is gone; assume custom enterprise API pricing for at-scale funding data.
6. **Certifications: build on self-attestation + document upload now**, and validate the **Global ACI** successor to IAF CertSearch before wiring an ISO-verification API (IAF went dark 1 Jan 2026).
7. **Treat contact data as radioactive.** Store company-level and role-based emails (info@, careers@) only; run a documented **LIA**, expose opt-out, and honor PECR (corporate subscribers OK; individuals need care). Avoid LinkedIn personal-contact scraping entirely — that's the KASPR/CNIL fine pattern.
8. **Operational evidence hygiene:** send an honest `User-Agent` with a bot info URL, honor robots.txt + Crawl-delay, rate-limit ≥1–2s, and **log every request** (timestamp/URL/status). These logs are your best litigation defense.
9. **Confidence flags:** US public-data legality = **high confidence** (multiple aligned rulings, though settlements aren't precedent). EU database-right + GDPR exposure = **high risk, medium legal clarity** — get local counsel before Saudi/UAE/EU-data outreach. Anti-bot "bypass" vendors = **hype**; there is no universal bypass and using them undercuts your good-faith posture.

---

## Sources
- https://en.wikipedia.org/wiki/HiQ_Labs_v._LinkedIn
- https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/18/17-16783.pdf
- https://newmedialaw.proskauer.com/2022/12/08/hiq-and-linkedin-reach-proposed-settlement-in-landmark-scraping-case/
- https://www.morganlewis.com/blogs/sourcingatmorganlewis/2022/12/linkedin-v-hiq-landmark-data-scraping-suit-provides-guidance-to-data-scrapers-and-web-operators
- https://newmedialaw.proskauer.com/2024/01/24/california-court-issues-noteworthy-decision-on-breach-of-contract-claims-in-web-scraping-dispute/
- https://www.quinnemanuel.com/the-firm/news-events/client-alert-meta-v-bright-data-significant-decision-for-web-scraping-industry/
- https://techcrunch.com/2024/02/26/meta-drops-lawsuit-against-web-scraping-firm-bright-data-that-sold-millions-of-instagram-records/
- https://digital-strategy.ec.europa.eu/en/policies/protection-databases
- https://legalblogs.wolterskluwer.com/copyright-blog/protecting-university-repositories-from-aggressive-web-scraping-using-database-rights-to-retain-control-over-academic-content/
- https://www.pinsentmasons.com/out-law/news/website-operators-can-prohibit-screen-scraping-of-unprotected-data-via-terms-and-conditions-says-eu-court-in-ryanair-case
- https://www.octoparse.com/blog/gdpr-compliance-in-web-scraping
- https://gdprlocal.com/b2b-gdpr/
- https://www.hybridlegal.co.uk/blog/using-business-emails-for-b2b-cold-outreach-in-the-uk-what-you-can-and-cant-do
- https://scrap.io/gdpr-cold-email-b2b
- https://www.searchengineworld.com/rfc9309-robots-txt-quietly-became-an-official-internet-standard
- https://www.sparkproxy.io/blog/guide-on-ethical-scraping-and-rate-limiting
- https://krowdev.com/article/bot-detection-2026/
- https://apify.com/automation-lab/domain-age-checker
- https://whoisjson.com/
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- https://linkedapi.io/guides/how-to-scrape-linkedin
- https://about.crunchbase.com/products/crunchbase-api
- https://dev.to/agenthustler/crunchbase-api-in-2026-free-tier-gone-what-startup-data-hunters-do-now-1177
- https://www.iafcertsearch.org/
