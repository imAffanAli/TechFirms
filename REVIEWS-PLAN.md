# TechFirms — Reviews, Ratings & Data Plan

Everything about where company data comes from, how we get **real reviews** (client **and** employee), what's free vs paid, what's already built, and the features worth adding next. Companion to [REVIEWS-SETUP.md](REVIEWS-SETUP.md) (which is just the API-key steps).

---

## 1. The three rules that keep us safe *and* free

1. **Numbers are facts; prose is copyrighted.** An aggregate star rating ("4.6 on Google") is a fact we can show **with attribution**. The individual review *text* is owned by the platform/author — we never copy it.
2. **First-party data is the crown jewel.** Reviews collected **on TechFirms itself** are legal, free, owned by us, and can't be taken away. This is our moat.
3. **Free sources only** (for now). Google's free tier + our own review collection + free enrichment APIs. Paid/partner sources (Trustpilot, Clutch, G2, Crunchbase) are parked until there's budget.

---

## 2. Where each kind of data comes from

| Data | Source | Free? | Status |
|---|---|---|---|
| **Client star rating** (aggregate number) | Google Places API (New) | ✅ Free tier | ✅ **Built** |
| **Company facts** (founded, HQ, size, funding) | Company site + LinkedIn + news, curated | ✅ Free | ✅ Curated (36 real firms) |
| **Domain age / SSL** | RDAP (public) | ✅ Free | ✅ Built |
| **GitHub activity** | GitHub REST API | ✅ Free | ✅ Built (trust signals) |
| **Client reviews** (full text) | **First-party** — company invites past clients | ✅ Free | 🔜 To build (flow half-exists) |
| **Employee reviews** (text + sentiment) | **First-party** — anonymous employee submissions | ✅ Free | 🔜 To build |
| **Editorial summary** ("our take") | AI (Anthropic key) or template | ✅ Free–ish | 🔜 To build |
| Trustpilot / Clutch / G2 | Partner/API | ❌ Paid/gated | ⛔ Parked |
| Crunchbase / LinkedIn data | API | ❌ Paid/restricted | ⛔ Parked |

---

## 3. Employee reviews — how we get **actual** ones (the honest answer)

**We cannot** take employee reviews from Glassdoor/Indeed — they forbid scraping, the text is copyrighted, and there's no free API. Copying them (even the numbers, which they also protect) is the exact thing that gets a product sued or blocked.

**So we collect our own** — a Glassdoor-style system that's ours:

- **Submit a review:** overall rating + Culture / Compensation / Work-life balance / Leadership, plus **Pros**, **Cons**, role, and current-vs-former.
- **Anti-fake measures (this is what makes them trustworthy):**
  - Optional **work-email verification** — the employee enters `name@theircompany.com`; we check it matches the company's domain and email a confirm link → **"Verified employee"** badge. (We store *that they verified*, not their identity — reviews stay anonymous.)
  - Rate-limiting + duplicate checks per company.
  - A **moderation queue** (already in the admin) approves/flags before publishing.
- **Aggregate** the ratings into the company's employee-sentiment block (already modeled) and, optionally, run **AI sentiment** over the text for a themes summary.

**Why this is better than scraping:** it's legal, free, and *unique to us* — nobody else has these reviews. It also drives the growth loop below.

---

## 4. Client reviews — first-party too

- A **claimed** company invites past clients via a unique link → the client leaves a verified review (rating + project details + text).
- Shown alongside the **Google aggregate** so a profile has both "what Google says" and "verified reviews on TechFirms."
- The invitation flow is partly built (`ReviewInvitation` model exists) — needs the email link + public submission page finished.

---

## 5. The "TechFirms Take" — our own editorial summary (your uncle's idea)

For each company, generate an **original** paragraph — our assessment, written from the signals we have (aggregate rating, sentiment, trust signals, services, size). It is **new content we own**, never copied from anywhere.

- Written by **AI** when the `ANTHROPIC_API_KEY` is set; a clean **template** when it isn't.
- This is what makes a profile read well, encourages companies to **claim** it, and is good for SEO (original content).

---

## 6. The growth loop (why this compounds)

Auto-built profile (real facts + Google rating + our summary) → company sees a flattering, accurate page → **claims it** (free) → invites its **clients** and **employees** to review → profile fills with real first-party data → ranks better → more companies notice → repeat.

---

## 7. Features worth adding (my recommendations, prioritized)

**P1 — do first (directly what you asked for):**
- ✅ Google aggregate ratings *(done)*
- 🔜 **First-party employee reviews** — submission form + work-email verification + moderation
- 🔜 **First-party client reviews** — finish the invite → submit flow
- 🔜 **"TechFirms Take"** editorial summary (AI/template)

**P2 — strengthen credibility:**
- 🔁 **Weekly refresh** of Google ratings (cron) so numbers stay current
- 🏅 **Verification badges** on reviews (verified client / verified employee) + clear source labels
- 📊 Surface **GitHub activity + domain age** more prominently as trust signals (already collected)
- 🚩 **Report-a-review** button → moderation queue (anti-abuse)

**P3 — nice-to-have:**
- 💬 **Owner replies** to reviews (companies respond publicly)
- 👍 Review **helpfulness voting** + sort by most helpful
- ✉️ **Email notifications** (new lead, review invite) via a **free** provider (e.g. Resend free tier) — currently in-app only
- ⭐ Google **rating distribution** (needs a higher Google field tier — check cost first)

---

## 8. Free vs paid — the cheat sheet

**Free (use these):**
- **Google Places API** — aggregate ratings (free monthly allowance; needs a card on file but stays $0 at our volume)
- **GitHub API** — org/repo activity
- **RDAP** — domain age
- **First-party reviews** — our own client + employee reviews (100% free, 100% ours)
- **Resend / similar** — transactional email, has a free tier (for invites/notifications)

**Paid / gated (skip for now):**
- **Trustpilot** — API/widgets are paid tiers, and it skews consumer-product, not B2B tech *(you're checking, but don't count on it)*
- **Clutch / G2** — B2B-relevant but partner-program/paid
- **Crunchbase** — funding data, paid
- **LinkedIn** — headcount/growth, restricted API

---

## 9. What's already built vs to-do

**Built:** directory, profiles, CIS scoring, sponsored placements, admin/moderation, auth + claim, currency localization, **Google aggregate ratings**, curated real facts for 36 flagships, trust signals (GitHub/domain/SSL/certs/funding), AI integration (guarded).

**To build (this plan):**
- [ ] First-party **employee review** submission + verification + moderation
- [ ] Finish first-party **client review** invitations (email link + public submit page)
- [ ] **"TechFirms Take"** editorial summary
- [ ] Google ratings **refresh cron**
- [ ] Review **verification badges** + report-a-review
- [ ] **Email** provider (free tier) for invites/notifications

---

## 10. Legal / compliance summary

- ✅ Show aggregate **numbers** with attribution + link back.
- ✅ Publish **our own** editorial summaries (original content).
- ✅ Host **first-party** reviews we collect directly (owned, moderated).
- ❌ Never copy or store third-party review **text**.
- ✅ Respect each source's ToS and robots; keep a moderation + report path for user-submitted content.

---

### Recommended next step
Build the **first-party employee review system** (P1) — it's the direct answer to "actual employee reviews," it's free and legal, and it feeds the growth loop. Then finish client-review invitations and the "TechFirms Take" summary.
