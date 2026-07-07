# TechFirms Intelligence Score: Scoring & Ranking Methodology Research Brief

*Prepared 2026-07-07. Purpose: reverse-engineer how established platforms compute composite scores and quadrants, then design a defensible, transparent methodology for the TechFirms Intelligence Score and country-scoped leaderboards.*

---

## 1. How the incumbents score (verified specifics)

### G2 Grid — Satisfaction (Y) vs Market Presence (X)
G2's **G2 Score is the average of two proprietary sub-scores, each ~50%: Market Satisfaction and Market Presence**, both normalized to a 0–100 scale and adjusted by category-level distribution ([G2 docs](https://documentation.g2.com/docs/research-scoring-methodologies)).

- **Satisfaction feeds:** user-review ratings — Ease of Use, Meets Requirements, Quality of Support (high weight); Ease of Admin/Setup/Doing Business With (medium); Likelihood to Recommend, Direction of Product (low). Plus **Significance** (weight by review volume for statistical relevance), **Relevance** (recency down-weighting), **Review Quality** (Flesch-Kincaid readability — fuller reviews weigh more), and **Review Source** (non-incentivized, current users weigh more).
- **Market Presence feeds:** weighted review count, employee count (ZoomInfo/LinkedIn), Crunchbase ranges, ZoomInfo revenue, web presence (Moz Page Authority, Similarweb traffic/PPC, search volume), and growth (year founded, employee growth).
- **Decay:** reviews decay gradually for the first 90 days, hold stronger weight through **18 months, then decay accelerates**, reaching ~**3% of original weight at ~3 years** ([G2](https://documentation.g2.com/docs/research-scoring-methodologies)).
- **Thresholds:** Live Grid needs 3+ products with 10+ reviews; Grid Report needs 6+ products and 150+ total reviews.

### Trustpilot TrustScore — Bayesian + time decay
TrustScore is a **Bayesian average**: every business starts seeded with imaginary reviews (~**7 reviews at 3.5 stars**, sometimes described as 9) so low-volume firms sit near the middle until real reviews accumulate. **Recency:** last-12-month reviews get full weight; ~50% at 24 months, ~30% at 36 months (exponential decay). Recalculated in real time under 10,000 reviews, daily above ([James Malcolm](https://jamesmalcolm.me/posts/trustpilot-scoring/), [Trustpilot Help](https://support.trustpilot.com/hc/en-us/articles/201748946-TrustScore-explained-How-is-the-TrustScore-calculated-)). This is the single most directly copyable pattern for TechFirms.

### Gartner Magic Quadrant & Peer Insights
- **MQ axes:** Y = *Ability to Execute* (product/service, viability, sales execution/pricing, market responsiveness, marketing execution, customer experience, operations); X = *Completeness of Vision* (market understanding, marketing/sales/offering strategy, business model, vertical strategy, innovation, geographic strategy) — up to **15 weighted criteria** ([Gartner MQ FAQ](https://www.gartner.com/en/about/magic-quadrant-faq)).
- **Peer Insights "Voice of the Customer":** to qualify, a vendor needs **20+ eligible reviews in an 18-month window**, with 15+ Capabilities ratings and 15+ Support/Delivery ratings. Excludes reviewers from companies under $50M revenue and partners. **Reviews from the first 6 of 18 months get 50% weight** ([Gartner VOC methodology](https://gpivendorresources.gartner.com/en/articles/6746287-voice-of-the-customer-methodology)). Strong precedents for eligibility gating and half-life weighting.

### Clutch Leaders Matrix
Position = **Focus (X)** × **Ability to Deliver (Y)**. ATD is scored out of **40 points: Reviews 20, Clients & Experience 10, Market Presence 10** ([Clutch factors](https://help.clutch.co/en/knowledge/clutch-rankings-and-research-factors), [Leaders Matrix](https://help.clutch.co/en/knowledge/what-is-leaders-matrix)). Reviews (rating × recency × verification × client budget) dominate. Clutch **deliberately does not publish the exact formula or fraud signals** "to avoid giving a roadmap to game placement" ([Clutch methodology](https://clutch.co/methodology)) — a deliberate transparency trade-off TechFirms must decide on.

**Cross-platform pattern:** all four use a **two-axis presence × satisfaction split**, reviews are the heaviest input, recency decay is universal, and low-volume firms are shrunk toward a prior. Confidence: high — corroborated across primary sources.

---

## 2. Fake / incentivized review detection
Techniques from the fraud literature ([arXiv behavioral+contextual](https://arxiv.org/pdf/2003.00807), [adaptive graph learning](https://arxiv.org/html/2603.08332v1), [Frontiers graph learning](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2022.922589/full)):

| Signal class | Concrete detectors |
|---|---|
| **Velocity / burst** | Sliding-window spike detection; co-bursting (same reviewers hitting the same firms in a short window); U-shaped (all-5 / all-1) rating distributions |
| **Reviewer graph** | Degree centrality flags star-shaped clusters; PageRank separates collusive rings from genuinely popular firms; shared IP/device/email-domain edges |
| **Linguistic** | Elevated first-person pronouns and brand-name frequency in fakes; rating-sentiment inconsistency; near-duplicate/templated text (embedding cosine similarity) |
| **Verification** | Proof of engagement (contract/invoice/LinkedIn-of-reviewer), like Clutch's verified analyst calls; non-incentivized flag like G2 |

---

## 3. Proposed TechFirms Intelligence Score

**Composite (fixed weights):** `Score = 0.40·R + 0.25·E + 0.20·T + 0.15·M`, each sub-score normalized to **0–100**.

### Per-signal normalization
- **R — Customer reviews (40%).** Convert 1–5 stars to 0–100, apply Bayesian shrinkage + recency decay (below), then blend rating (70%) with a verification-coverage factor (30% = share of reviews verified).
- **E — Employee sentiment (25%).** Glassdoor-style 1–5 aggregate → 0–100 with the same Bayesian shrinkage (sparse employers pulled to prior). Recommend-to-friend % as a secondary blend.
- **T — Trust signals (20%).** Sub-components each capped and summed: domain age (log-scaled, cap ~15 yrs), funding/revenue tier, certifications (ISO 27001, SOC 2, Microsoft/AWS partner) as additive badges, social proof (LinkedIn followers, backlinks). Min-max normalize within the **country cohort** so it stays locally meaningful.
- **M — Market activity (15%).** Review velocity (last 12 mo), profile freshness, portfolio/case-study count, employee-count growth. Percentile-rank within country cohort → 0–100 (avoids a few US giants flattening emerging-market firms).

### Bayesian shrinkage (low review counts)
Use Trustpilot/IMDb-style: `R_adj = (v/(v+m))·avg + (m/(v+m))·C` where `v` = weighted review count, `C` = global prior mean (start C≈70, i.e. ~3.5/5), `m` = prior strength (**recommend m = 8**, matching Trustpilot's seed and Gartner's ~20-review spirit). A firm with 2 reviews sits near the prior; by ~25 reviews the firm's own average dominates.

### Recency decay
Exponential half-life on review weight: `w = 0.5^(age_months / H)`, **H = 12 months** (Trustpilot-aligned). Full weight <12 mo, ~50% at 24 mo, ~25% at 36 mo. Apply to both R and E; the same weighted count `v` feeds the Bayesian term so recency and volume interact.

### Quadrant placement (X = Market Presence, Y = Client Satisfaction)
Compute two axes **per country × service category** cohort:
- **Y (Client Satisfaction)** = R (Bayesian, recency-weighted), 0–100.
- **X (Market Presence)** = weighted blend of M (60%) + T presence sub-signals (40%): review volume, employee count, funding, web authority — 0–100.

Split each axis at the **cohort median** (robust to outliers; Gartner/G2 both use relative-to-market distribution, not absolute cutoffs). Four quadrants:

| | Low Presence (X<median) | High Presence (X≥median) |
|---|---|---|
| **High Satisfaction (Y≥median)** | **Rising Stars** | **Leaders** |
| **Low Satisfaction (Y<median)** | **Niche Players** | **Challengers** |

- **Leaders:** top-right — high satisfaction *and* high presence.
- **Challengers:** big presence, weaker satisfaction (established but slipping).
- **Rising Stars:** loved but small/new — the emerging-market story TechFirms should amplify.
- **Niche Players:** limited on both, or specialized.
- **Eligibility gate (Gartner-style):** require **≥5 verified reviews and ≥3 in the last 18 months** to appear on a ranked leaderboard; below that, list as "Unrated." Prevents a 1-review firm topping "best AI companies in Saudi Arabia."

---

## 4. Recommendations for TechFirms
1. **Publish the formula and weights, hide only the fraud signals.** Radical transparency is the wedge vs. Clutch's opaque box and the moat for LLM citation ("per TechFirms' published methodology…"). Keep fraud detection undisclosed, exactly as Clutch/Trustpilot justify.
2. **Adopt Trustpilot's Bayesian seed (m≈8, C≈70) and 12-month half-life verbatim** — battle-tested and defensible; publish the exact equation on a `/methodology` page for both users and LLM crawlers.
3. **Score within country × category cohorts, not globally.** Percentile/median splits keep Pakistani and Saudi leaderboards meaningful instead of dominated by US firms — directly serves the "best in [country]" content strategy.
4. **Hard eligibility gate (≥5 verified, ≥3 recent reviews).** Protects credibility of every leaderboard headline and mirrors Gartner's 20-review bar scaled to a young marketplace.
5. **Ship fraud detection at MVP:** velocity/burst + duplicate-text (embedding similarity) + shared-domain reviewer graph. These three catch most low-effort manipulation cheaply via the Playwright worker + Anthropic API for linguistic scoring.
6. **Make the AI Company Intelligence Score explainable, not a black box.** Have Claude generate a rationale citing the four sub-scores; never let the LLM invent the number — compute deterministically, narrate with AI. This is what makes the score quotable and auditable.
7. **Log score versions and recompute on a schedule** (real-time under threshold like Trustpilot, nightly batch above) so rankings are reproducible and disputes are answerable.

**Hype vs reality flag:** "AI-generated score" is a marketing asset only if the math underneath is deterministic and transparent. An opaque LLM-emitted number would be *less* trustworthy than Trustpilot's simple Bayesian average and would not earn LLM citations. Confidence: high.

## Sources
- G2 Research Scoring Methodology — https://documentation.g2.com/docs/research-scoring-methodologies
- Trustpilot Help — TrustScore explained — https://support.trustpilot.com/hc/en-us/articles/201748946-TrustScore-explained-How-is-the-TrustScore-calculated-
- James Malcolm — How Trustpilot scoring works — https://jamesmalcolm.me/posts/trustpilot-scoring/
- Gartner Magic Quadrant FAQ — https://www.gartner.com/en/about/magic-quadrant-faq
- Gartner Magic Quadrant Research Methodology — https://www.gartner.com/en/research/methodologies/magic-quadrants-research
- Gartner Peer Insights Voice of the Customer Methodology — https://gpivendorresources.gartner.com/en/articles/6746287-voice-of-the-customer-methodology
- Clutch Rankings & Research Factors — https://help.clutch.co/en/knowledge/clutch-rankings-and-research-factors
- Clutch Leaders Matrix — https://help.clutch.co/en/knowledge/what-is-leaders-matrix
- Clutch Research Methodology — https://clutch.co/methodology
- Behavioral & Contextual fake-review features (arXiv) — https://arxiv.org/pdf/2003.00807
- Adaptive Graph Learning for fake reviewer groups (arXiv) — https://arxiv.org/html/2603.08332v1
- Frontiers — Graph Learning for Fake Review Detection — https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2022.922589/full
