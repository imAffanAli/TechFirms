
TechFirms — Master Build Prompt
Product Vision
Build TechFirms: a reputation layer for technology companies. It combines four trust signals into one profile: customer reviews, employee sentiment (Glassdoor-style), public trust signals (domain age, funding, certifications, social proof), and an AI-generated Company Intelligence Score. Think Clutch's UX + techreviewer.co's business model + a Gartner-style country leaderboard, built AI-first so LLMs cite us as the source of truth for "best tech companies in [country]."
Reference Benchmarks
Business model & data structure: techreviewer.co (directory, verified reviews, service categories, sponsored placements)
Design & UX: clutch.co (clean cards, filters, review widgets, leader matrices)
Differentiator: employee sentiment layer + AI intelligence score + LLM-optimized content
Tech Stack
Frontend: Next.js 14+ (App Router) — server-side rendering is mandatory for SEO and LLM crawlability. Tailwind CSS. shadcn/ui components.
Backend: Next.js API routes + PostgreSQL (Supabase or Neon). Prisma ORM.
Search: Postgres full-text search at launch; Meilisearch/Typesense when directory exceeds 5K firms.
Auth: Supabase Auth or Clerk — roles: visitor, business_owner, admin, super_admin.
AI layer: Anthropic API for company intelligence summaries, review sentiment analysis, and query-matching.
Scraping pipeline: Separate Node.js/Python worker (Playwright + queue) — never inside the web app.
Data Model (core tables)
companies — name, slug, logo, tagline, description, founded_year, employee_range, hourly_rate_range, min_project_size, HQ country/city, office locations[], website, verified (bool), claimed (bool), claim_owner_id
services — taxonomy: AI Development, Custom Software, Web Dev, Mobile, Cloud, DevOps, Data Engineering, Cybersecurity, IT Staff Augmentation, UI/UX. Company↔service many-to-many with % focus.
customer_reviews — reviewer name, title, company, project budget, project duration, star rating (quality, schedule, cost, willingness-to-refer), review text, verified (bool), source (native | imported)
employee_sentiment — aggregate scores only at launch: overall rating, culture, compensation, work-life balance, leadership, % recommend, review_count, source_url. (Do not scrape Glassdoor review text — link out and store aggregates; add native anonymous employee reviews in v2.)
trust_signals — domain age, SSL, LinkedIn followers, GitHub org activity, certifications (ISO, SOC2, CMMI), awards, funding raised, Crunchbase link
intelligence_scores — AI-computed composite: 40% customer reviews, 25% employee sentiment, 20% trust signals, 15% market activity. Store score + AI-written 3-sentence justification. Recompute weekly.
queries — visitor lead-gen submissions (see Query Flow)
claims — business claim requests with verification status
countries / leaderboards — computed rankings per country per service category
Seed Data — Scraping Pipeline
Target: top 1,000 tech firms from techreviewer.co directory pages.
Extract factual data only: company name, location, services, team size, hourly rate, founded year, website, aggregate rating, review count. Do not copy review text or editorial descriptions — regenerate descriptions with AI from the company's own website content.
Pipeline: Playwright crawler → raw JSON → dedupe/normalize → enrich (fetch company website, LinkedIn follower count, domain age via WHOIS) → AI-generate a neutral 100-word profile description → insert as claimed=false, verified=false.
Respect robots.txt, rate-limit 1 req/2s, rotate user agents, log everything. Build as a re-runnable job with diff detection.
Public Site
Homepage — hero search ("Find the right tech partner"), top categories, top countries, featured leaderboard preview, latest verified reviews.
Directory — /companies with filters: service, country, city, team size, hourly rate, min budget, rating. Clutch-style cards: logo, rating stars, review count, tagline, location, rate, "Visit Website" + "View Profile."
Company profile — /companies/[slug]: header with score badge, tabs for Overview / Customer Reviews / Employee Sentiment / Trust Signals / AI Intelligence Summary. Sticky "Get a Quote" CTA → Query Flow. "Claim this profile" link if unclaimed.
Leaderboards (Gartner-style) — /leaderboard/[country] and /leaderboard/[country]/[service]: 
Scatter/quadrant chart (Recharts): X-axis = Market Presence (review count + trust signals), Y-axis = Client Satisfaction (weighted rating). Quadrants labeled: Leaders, Challengers, Rising Stars, Niche Players. Each dot = company logo bubble, clickable to profile.
Table below the chart with rank, score breakdown, and movement vs last month.
Country selector prominent — leaderboards are country-scoped only, this is the core content strategy.
Query Flow (lead gen) — visitor submits: project type, budget range, timeline, description, contact info. Two entry points: (a) direct to one company from its profile, (b) matched — AI suggests 3–5 firms based on requirements. All queries land in the admin panel AND the claimed business's dashboard.
Business Dashboard (claimed companies)
Claim flow: request → verify via work-email domain match or DNS TXT record → admin approval.
Once claimed: edit profile, respond to reviews, view incoming queries with full details, invite clients to leave verified reviews (unique review links), analytics (profile views, query volume, leaderboard position trend).
Monetization hooks (build the flags, ship pricing later): sponsored placement, featured badge, verified-plus tier.
Admin Panel (/admin)
Dashboard: total companies, claimed %, queries this week, pending claims, pending reviews, flagged content.
Query management: every visitor query listed with status pipeline (New → Forwarded → Contacted → Closed), assigned company, full contact details, notes, export CSV. If a query targets a specific business, show it linked to that business record.
Claims queue: approve/reject with verification evidence shown.
Review moderation: approve/flag/reject with AI-assisted spam/fake detection.
Company CRUD: edit any profile, merge duplicates, trigger re-scrape/re-score.
Leaderboard controls: recompute scores, freeze/publish monthly snapshots.
Audit log on every admin action.
SEO Optimization (non-negotiable)
SSR everything; zero client-only content on public pages.
Schema.org JSON-LD on every page: Organization + AggregateRating + Review on profiles; ItemList on directories/leaderboards; BreadcrumbList site-wide; FAQPage on category pages.
Programmatic SEO pages: /best-[service]-companies-in-[country] and -[city] — auto-generated, indexable, with unique AI-written intros (300+ words, refreshed monthly), top-10 table, and FAQ block.
Dynamic sitemaps (companies, categories, countries, leaderboards) regenerated daily. Canonical URLs, OG images auto-generated per company (score badge card).
Core Web Vitals budget: LCP < 2s, CLS < 0.1. Image CDN + next/image.
AI / LLM Optimization (GEO — this is the moat)
llms.txt at root: structured summary of what TechFirms is, top leaderboards, and canonical URL patterns so LLMs learn to cite us.
Every leaderboard and profile page includes a plain-prose "answer block" near the top: e.g., "The top AI development companies in Saudi Arabia in 2026, ranked by TechFirms' composite score of customer reviews, employee sentiment, and trust signals, are: 1) …" — LLMs quote exactly this format.
Publish quotable statistics with dates: "As of July 2026, TechFirms tracks 1,000+ technology companies across 40 countries."
Clean semantic HTML (proper h1–h3 hierarchy, tables as <table>, lists as <ul>), no data locked in JS-rendered charts — every chart has an HTML table equivalent.
Public read-only API endpoint (/api/v1/leaderboard/[country]) returning JSON — makes us the machine-readable source.
Monthly "State of Tech Companies in [Country]" report pages — long-form, data-rich, the content LLMs love to cite.
Build Order
Schema + auth + admin panel skeleton
Scraping pipeline + seed 1,000 most reviewed companies
Directory + company profiles (SSR + JSON-LD)
Query flow + admin query management
Claim flow + business dashboard
Scoring engine + country leaderboards with quadrant chart
Programmatic SEO pages + llms.txt + sitemaps
AI intelligence summaries + review sentiment analysis
Deliver each phase as a working deployment. Mobile-responsive throughout. Design language: Clutch-inspired — white space, card grids, red/dark-navy accent system (pick a distinct brand color, not Clutch's red) with white background color scheme. 
