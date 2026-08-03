# TechFirms — Platform Expansion Audit & Roadmap

Covers everything requested: (1) more real data + **all regions**, (2) **company team accounts** (Owner → Manager roles), (3) **sponsorship tiers + self-serve monetization** (~$100, durations, benefits), (4) a **site-admin role + dashboard**, (5) a **company dashboard**, and the growth/analytics around them. Informed by specialist reviews (monetization, RBAC/product, growth/analytics) + a data-sourcing/legal analysis.

---

## 1. Data sourcing — what's allowed, and what we'll do (with credit)

**The hard line (non-negotiable):** we will **not** scrape or republish **review text** from Glassdoor, Indeed, Clutch, or G2. Their Terms of Service forbid automated collection, the reviews are copyrighted by the platform + author, they actively block scrapers, and they have a litigation history. **Attribution does not cure this** — crediting the source is not a licence to copy. Building the product on that content risks takedowns, IP bans, and legal exposure.

**What we *can* do (free/legal), with attribution:**

| Source | Use | Free? | How |
|---|---|---|---|
| **Google** (Places/Business) | Aggregate star rating + company discovery | ✅ Free tier | Official Places API — already live; "via Google" credit + link-out |
| **First-party reviews** | Real client + employee reviews (text + rating) | ✅ Free, owned | Already built — the real engine; grows over time |
| **RDAP** | Domain age | ✅ Free | Already used |
| **GitHub API** | Eng/open-source activity | ✅ Free | Trust signal |
| **Business registries / open data** | Company existence, sector | ✅ Free | Per-country, later |
| **Trustpilot** | TrustScore + reviews | 💲 Paid API/widget | Official widget/API only — *parked* (paid) |
| **G2 / Clutch** | B2B reviews | 💲 Partner/paid | Official partner program/widget only — *parked* |
| **Crunchbase / LinkedIn** | Funding / headcount | 💲 Paid/restricted | *Parked* |

**The rule we display by:** show the **number** (an aggregate rating is a fact) **with attribution + a link back**, and write our **own** summary. Never the copied prose. This is exactly the model already in place — we scale it to more sources and regions.

---

## 2. All regions

- **Expand Google Places discovery** from PK/KSA/UAE to a global market list — major tech hubs across South Asia, GCC/MENA, SE Asia, Africa, Europe, and the Americas — phased to control API cost.
- **Directory:** an **"All regions"** default plus region grouping; the country filter already lists only countries that have companies, so it grows automatically.
- Per-country currency via `Country.priceMultiplier` (already modelled).

---

## 3. Company team accounts (Owner → Manager RBAC)

**Roles:** **Owner** (exactly 1), **Manager** (0–N) now; **Editor/Viewer** stubbed in the schema for later.

**Permission matrix (v1):**

| Action | Owner | Manager |
|---|:--:|:--:|
| Edit profile / media | ✅ | ✅ |
| Respond to reviews | ✅ | ✅ |
| View + manage leads | ✅ | ✅ |
| Invite clients to review | ✅ | ✅ |
| View analytics / CIS breakdown | ✅ | ✅ |
| Buy / manage sponsorship (spend money) | ✅ | ❌ |
| Manage team (invite / remove / change role) | ✅ | ❌ |
| Transfer ownership / delete company | ✅ | ❌ |

**Data model:** new `CompanyMember` (companyId, userId, role, status) + `CompanyInvitation` (email, role, token, expiry) — mirrors the existing `ReviewInvitation` token flow. Keep `Company.ownerId` as a denormalized pointer to the current Owner (kept in sync in-transaction); `CompanyMember` becomes the source of truth for authorization via a new `requireCompanyRole()` helper (same live-DB-read pattern as `requireRole`). Ownership transfer is a distinct double-opt-in action. Add `companyReply`/`companyReplyAt` to `CustomerReview` for review responses. Backfill one `owner` member per existing `ownerId`.

---

## 4. Sponsorship tiers + self-serve monetization

**Principle preserved:** organic ranking + the CIS are **never for sale**; sponsorship is always labelled paid placement.

**Tiers (30-day base, anchored at ~$100):**

| Tier | 30-day | Benefits (cumulative) |
|---|--:|---|
| **Featured** | **$99** | "Featured" badge, highlighted card, logo priority |
| **Sponsored** | **$199** | + labelled "Sponsored" rail on a country×service board, profile gallery, custom CTA w/ click tracking, lead priority, full analytics |
| **Verified-Plus** | **$349** | + video embed, deep-verification seal, priority support |

**Durations:** 7 / 30 / 90 / 365 days with multipliers (weekly boost ~1.2×, quarterly 0.9×/mo, annual 0.75×/mo). **Sponsored** also has a scope multiplier (1 country×service = 1.0×, broader = 1.6×, global = 2.75× → sales-assisted).

**Flow:** owner → pick tier + duration + scope → price computed **server-side** → order created → checkout → on payment, activate `Sponsorship` with `startsAt`/`endsAt` inside a transaction (re-check slot capacity) → nightly job auto-expires → renewal email/subscription. Slots are capped per board (DB partial-unique index prevents overbooking; UI "2 of 3 left" is advisory).

**Payments:** **Stripe Checkout** (hosted, handles SCA + VAT). **Build it behind a `PAYMENTS_PROVIDER` flag** with a **manual/invoice mode** first (order → admin "Mark Paid" → same activation path) so the *entire* tier/duration/checkout/expiry system ships and works **before** Stripe is wired — adding Stripe later is just the redirect + webhook, zero rework.

**Data model:** `SponsorshipPlan` (tier×duration×price), `SponsorshipOrder` (company, plan, scope, amount, status, payment refs), `SponsorshipSlotLimit` (caps), + additive fields on `Sponsorship` (planId, autoRenew, endsAt already exists). Anti-abuse: only the verified owner can sponsor their own company, persistent "Sponsored" labels everywhere, refunds/caps, audit log, CI test asserting scoring never imports sponsorship.

---

## 5. Site-admin role + dashboard

`super_admin` already exists. Dashboard gaps, prioritized:

- **P0:** KPI home (companies by status, moderation/claims backlog, lead funnel, sponsorship revenue, signups); **company management** (search/edit any company, force verify, merge duplicates, resolve ownership); **user management** (search, promote/demote, suspend); **audit-log viewer** (data already captured — cheapest win); revenue rollup on sponsorships. *(Moderation, claims, leads already exist.)*
- **P1:** user-reported flag queue (distinct from AI hold), team/invite oversight, data-source/job monitoring, bulk actions, CSV export.
- **P2:** feature flags, email templates, editable regional pricing.

---

## 6. Company (Owner/Manager) dashboard

- **P0:** profile editor (extend to media/logo, service focus %, office locations), leads + owner-side status/notes, reviews list + **respond**, invite clients, **team management** (Owner), claim/verification status + next steps.
- **P1:** **profile-completeness meter** (tied to CIS inputs — high-leverage nudge), **self-serve sponsorship** purchase, **analytics** (profile views, impressions, clicks — fields already tracked), CIS sub-score breakdown + trend, in-app/email notifications.
- **P2:** multi-location UI, billing/invoice history, lead CSV/CRM export, competitor benchmarking, API access.

---

## 7. Growth + trust (cross-cutting)

**Biggest gap found by the review: there is no email/notification system.** That's the #1 leak — leads and invites currently only appear via dashboard polling. Fixing it (a **free provider like Resend**) unlocks lead alerts, review invites, sponsorship notices, and renewals.

- **Demand (buyers) P0:** instant lead-notification email; **city×service pSEO** pages (5–10× the long-tail of country×service, same infra); **compare pages** (2–4 companies on CIS sub-scores/price/reviews); shorten the RFQ form.
- **Supply (companies) P0:** lead-notification emails (the reason companies stay), aggressive "claim your free profile" CTAs on unclaimed listings, **completeness nudges** that visibly raise the CIS, **bulk review-invite** tooling, competitor-visibility FOMO.
- **Trust:** deep-link every CIS badge to `/methodology`; state **"organic ranking is never for sale"** at the point of comparison; label review **provenance** (native vs. Google aggregate); surface the trust-signal panel (domain age, SSL, GitHub, certs, funding — captured but unshown); a "responds within 24h" badge.

**KPIs / charts** (build with the dataviz skill): Admin — traffic, coverage (claimed/unclaimed/verified by country), claims + lead funnels, review volume/rating trend, sponsorship MRR + CTR-by-tier, conversion funnels. Company — profile views + search impressions (sparklines), lead funnel, rating trend + sub-score radar, CIS gauge + `ScoreSnapshot` trend, sponsorship ROI (sponsored vs organic), completeness meter.

---

## 8. Cross-cutting dependencies

| Dependency | Unlocks | Status |
|---|---|---|
| **Email provider** (Resend free tier) | Lead alerts, invites, notifications, renewals | Needed — free, one signup |
| **Stripe** | Real card payments | Optional — manual/invoice mode works meanwhile |
| **Google Places budget** | Global discovery | Free tier covers phased rollout |

---

## 9. Phased implementation plan

- **Phase 1 — Foundation:** all-regions discovery expansion · **company team accounts** (Owner/Manager RBAC, invites, `requireCompanyRole`) · respond-to-reviews.
- **Phase 2 — Monetization:** sponsorship **tiers + self-serve flow** (manual/invoice mode now, Stripe-ready) · slot limits · auto-expiry.
- **Phase 3 — Dashboards:** site-admin dashboard (KPI home, company/user management, audit viewer) · company dashboard upgrades (reviews+respond, team, completeness).
- **Phase 4 — Growth + data:** email/notifications (Resend) · city×service pSEO + compare pages · trust-signal surfacing · analytics charts · more compliant rating sources.

Each phase ships incrementally (schema + migration + backend + frontend + build/verify + commit).

## 10. Out of scope (won't do)
Scraping Glassdoor/Clutch/G2/Indeed review text · fabricating any data · selling organic ranking or CIS.
