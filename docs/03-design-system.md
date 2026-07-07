# Design System — Brand, Tokens, Components

> Status: Draft v1 · Last updated 2026-07-07

This is the exhaustive, implementation-ready design spec for TechFirms — the AI-first reputation layer for technology companies. It locks the brand, the full color/typography/spacing token set, and every UI component a developer needs to build the directory, company profiles, Gartner-style leaderboards, and the business/admin dashboards. All values here conform to [`_canon.md`](research/_canon.md) §2 (LOCKED). Where this doc references site structure or task flows it does **not** duplicate them — see [Information Architecture & Sitemap](04-information-architecture-and-sitemap.md) (the URL/route map) and [User Flows & Journeys](05-user-flows-and-journeys.md) (the interaction narratives). Stack context: Next.js 14/15 App Router, Tailwind + shadcn/ui (Radix), Recharts, `next/font`.

---

## 1. Brand foundation

**Thesis (locked).** Deep **teal-cyan** primary ("Signal Teal") + near-black **navy** anchor ("Ink Navy") + one **violet** AI accent ("Intelligence Violet") reserved exclusively for the Company Intelligence Score (CIS). Teal carries trust + technology + intelligence in a single hue and deliberately dodges the crowded field: Clutch/G2 red, Gartner navy, and the "invisible" `#2563EB` corporate blue.

**The distinct-not-Clutch-red decision.** The master brief said "pick a distinct brand color, not Clutch's red." We go further: **red is never an accent — red is errors only** (`danger` scale). This keeps maximum visual distance from Clutch/G2 and protects the "authority/trust" read. A Gartner-adjacent brand must not shout; teal signals *credible + forward-looking* without energy-drink loudness.

**Logo & wordmark.** The MVP mark is **text-based**: the wordmark `TechFirms` set in **Geist Sans**, weight 600, tracking `-0.02em`. "Tech" in `gray-900` (`#0F172A`) / `text` on dark; "Firms" in `teal-600` (`#0C8A85`) on light or `teal-400` (`#2CC7BD`) on dark. An optional glyph is a rounded-square "signal" bars motif in `teal-500 #11A69E`.

- **Clearspace:** minimum padding around the wordmark = the cap-height of the "T" on all four sides.
- **Minimum size:** 20px cap-height on screen; never below 16px.
- **Do:** place on white, `#F7F5F2` (marketing), or `navy-950`. **Don't:** place teal wordmark on teal, add glow/bevel, recolor to red, or stretch. The CIS gradient (teal→violet) is for the score chip only, never the logo.
- **Marketing vs product surfaces:** marketing/landing pages use the warm off-white background `#F7F5F2` (Pantone Cloud Dancer family); in-product surfaces stay cool slate. Skip neon/glow and heavy glassmorphism entirely (wrong signal for a trust brand).

---

## 2. Color tokens

Authored as HEX. All scales follow the Radix/Tailwind 50–950 convention. **Never use red as an accent.** Semantic scales expose `500` (base), `600` (default fill), `700` (accessible text-on-white).

### 2.1 Primary — Signal Teal

| Token | Hex | Use |
|---|---|---|
| teal-50 | `#ECFDFB` | tint backgrounds, hover wash |
| teal-100 | `#CFF9F3` | subtle fills, selected rows |
| teal-200 | `#A0F0E7` | borders on teal surfaces |
| teal-300 | `#64E1D6` | dark-mode chips |
| teal-400 | `#2CC7BD` | **accent-on-dark** (links/accents) |
| teal-500 | `#11A69E` | **brand core / logo** |
| teal-600 | `#0C8A85` | UI fills, large text on white |
| teal-700 | `#0F6E6B` | **primary button bg, links on white** |
| teal-800 | `#135755` | pressed/active button |
| teal-900 | `#144846` | deep accent |
| teal-950 | `#05302F` | teal-tinted dark surface |

### 2.2 Anchor — Ink Navy

| Token | Hex | Use |
|---|---|---|
| navy-950 | `#0A1B2E` | primary dark anchor: headers, footer, dark hero |
| navy-900 | `#0E2438` | secondary authority surface |
| navy-800 | `#16324A` | raised navy panels |

### 2.3 AI accent — Intelligence Violet (CIS ONLY)

| Token | Hex | Use |
|---|---|---|
| violet-500 | `#7C5CFC` | gradient stop, AI badge tint |
| violet-600 | `#6D3EF0` | **AI CTA / CIS score chip fill** |
| violet-700 | `#5A2FCC` | pressed AI CTA |

> Reserve violet **exclusively** for the CIS (score chip, AI badge, teal→violet gradient ring). One accent, one meaning — no rainbow drift.

### 2.4 Neutrals — cool slate

| Token | Hex | Token | Hex |
|---|---|---|---|
| gray-50 | `#F8FAFC` | gray-500 | `#64748B` |
| gray-100 | `#F1F5F9` | gray-600 | `#475569` |
| gray-200 | `#E2E8F0` | gray-700 | `#334155` |
| gray-300 | `#CBD5E1` | gray-800 | `#1E293B` |
| gray-400 | `#94A3B8` | gray-900 | `#0F172A` |
| | | gray-950 | `#020617` |

### 2.5 Semantic scales

| Scale | 500 | 600 (default) | 700 (text-on-white) |
|---|---|---|---|
| success | `#22C55E` | `#16A34A` | `#15803D` |
| warning | `#F59E0B` | `#D97706` | `#B45309` |
| danger (errors/destructive ONLY) | `#EF4444` | `#DC2626` | `#B91C1C` |
| info | `#3B82F6` | `#2563EB` | `#1D4ED8` |

### 2.6 Surface / background / border / text — light & dark

| Role | Light | Dark |
|---|---|---|
| bg (app) | `#FFFFFF` | `#0A0F1A` |
| bg (marketing) | `#F7F5F2` | `#0A0F1A` |
| surface (cards) | `#FFFFFF` | `#111A2B` |
| surface-2 (popover/elevated) | `#F8FAFC` | `#1B2740` |
| border | `#E2E8F0` | `#26334D` |
| text (primary) | `#0F172A` | `#F1F5F9` |
| text-dim (secondary) | `#475569` | `#94A3B8` |
| accent (interactive) | `#0F6E6B` (teal-700) | `#2CC7BD` (teal-400) |

### 2.7 WCAG AA contrast pairings (enforce in CI)

| Pair | Ratio | Verdict |
|---|---|---|
| teal-700 text on white | 6.06:1 | AA normal — links & body accents on white |
| teal-600 on white | 4.21:1 | AA large/UI only — **not** body text |
| white on teal-700 button | 6.06:1 | AA normal — recommended primary button |
| navy-950 bg + white text | ~16:1 | AA/AAA |
| teal-400 on `#0A0F1A` (dark) | 9.16:1 | AA/AAA — dark-mode links/accents |
| gray-500 on white | ~4.6:1 | AA normal — secondary-text floor |
| violet-600 + white text | ~5.4:1 | AA normal — AI CTA / score chip |

**Rules:** links/body-accent on white = **teal-700**; primary button = **teal-700 bg / white**; on dark, promote accent to **teal-400**; secondary text ≥ **gray-500**; never put normal body text in teal-500 or lighter on white.

### 2.8 Copy-pasteable — `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        teal: {
          50:"#ECFDFB",100:"#CFF9F3",200:"#A0F0E7",300:"#64E1D6",400:"#2CC7BD",
          500:"#11A69E",600:"#0C8A85",700:"#0F6E6B",800:"#135755",900:"#144846",950:"#05302F",
        },
        navy: { 800:"#16324A", 900:"#0E2438", 950:"#0A1B2E" },
        violet: { 500:"#7C5CFC", 600:"#6D3EF0", 700:"#5A2FCC" },
        gray: {
          50:"#F8FAFC",100:"#F1F5F9",200:"#E2E8F0",300:"#CBD5E1",400:"#94A3B8",
          500:"#64748B",600:"#475569",700:"#334155",800:"#1E293B",900:"#0F172A",950:"#020617",
        },
        success: { 500:"#22C55E", 600:"#16A34A", 700:"#15803D" },
        warning: { 500:"#F59E0B", 600:"#D97706", 700:"#B45309" },
        danger:  { 500:"#EF4444", 600:"#DC2626", 700:"#B91C1C" },
        info:    { 500:"#3B82F6", 600:"#2563EB", 700:"#1D4ED8" },
        // shadcn semantic aliases bound to CSS vars (see 2.9)
        background:"var(--background)", foreground:"var(--foreground)",
        card:"var(--card)", "card-foreground":"var(--card-foreground)",
        popover:"var(--popover)", "popover-foreground":"var(--popover-foreground)",
        primary:"var(--primary)", "primary-foreground":"var(--primary-foreground)",
        muted:"var(--muted)", "muted-foreground":"var(--muted-foreground)",
        accent:"var(--accent)", border:"var(--border)", input:"var(--input)", ring:"var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-display)","Inter","sans-serif"],
        sans: ["var(--font-sans)","ui-sans-serif","system-ui","sans-serif"],
        mono: ["var(--font-mono)","ui-monospace","monospace"],
      },
      borderRadius: { lg:"0.75rem", md:"0.5rem", sm:"0.375rem" },
      boxShadow: {
        xs:"0 1px 2px rgba(2,6,23,.06)",
        sm:"0 1px 3px rgba(2,6,23,.08),0 1px 2px rgba(2,6,23,.06)",
        md:"0 4px 12px rgba(2,6,23,.08)",
        lg:"0 12px 32px rgba(2,6,23,.12)",
        focus:"0 0 0 3px rgba(15,110,107,.35)",
      },
    },
  },
} satisfies Config;
```

### 2.9 Copy-pasteable — CSS variables (`:root` & `.dark`)

```css
:root {
  --background:#FFFFFF; --foreground:#0F172A;
  --card:#FFFFFF; --card-foreground:#0F172A;
  --popover:#F8FAFC; --popover-foreground:#0F172A;
  --primary:#0F6E6B; --primary-foreground:#FFFFFF;      /* teal-700 */
  --muted:#F1F5F9; --muted-foreground:#475569;
  --accent:#ECFDFB; --accent-foreground:#0F6E6B;
  --border:#E2E8F0; --input:#E2E8F0; --ring:#0F6E6B;
  --ai:#6D3EF0; --ai-foreground:#FFFFFF;                /* CIS violet */
  --radius:0.5rem;
}
.dark {
  --background:#0A0F1A; --foreground:#F1F5F9;
  --card:#111A2B; --card-foreground:#F1F5F9;
  --popover:#1B2740; --popover-foreground:#F1F5F9;
  --primary:#2CC7BD; --primary-foreground:#05302F;      /* teal-400 on dark */
  --muted:#1B2740; --muted-foreground:#94A3B8;
  --accent:#144846; --accent-foreground:#2CC7BD;
  --border:#26334D; --input:#26334D; --ring:#2CC7BD;
  --ai:#7C5CFC; --ai-foreground:#0A0F1A;
}
```

---

## 3. Typography

**Fonts (locked):** Headings/display = **Geist Sans**; Body/UI = **Inter**; Numeric/data/mono = **Geist Mono** with tabular figures (`tnum`) for ranks, CIS scores, and funding. RTL (Saudi/UAE Arabic) = **Noto Sans Arabic**. Self-host via `next/font`.

**Fallback stacks:**
- Display: `"Geist", "Inter", ui-sans-serif, system-ui, sans-serif`
- Sans: `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Mono: `"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace`

### 3.1 Modular type scale (1.25 major-third, base 16px)

| Token | Size | Line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| display | 3.052rem / 49px | 1.1 | 700 | -0.02em | marketing hero |
| h1 | 2.441rem / 39px | 1.15 | 700 | -0.02em | leaderboard/page hero H1 |
| h2 | 1.953rem / 31px | 1.2 | 600 | -0.01em | page H2 / section |
| h3 | 1.5rem / 24px | 1.25 | 600 | -0.01em | section headers |
| h4 | 1.25rem / 20px | 1.3 | 600 | 0 | card titles (company name) |
| body-lg | 1.125rem / 18px | 1.6 | 400 | 0 | intro/answer-block prose |
| body | 1rem / 16px | 1.5 | 400 | 0 | default body |
| sm | 0.875rem / 14px | 1.45 | 400 | 0 | table body, meta, filters |
| xs / caption | 0.75rem / 12px | 1.4 | 500 | 0.01em | badges, captions, labels |
| data | 0.875–2.441rem | 1.1 | 500–600 | 0 | Geist Mono `tnum` — scores, ranks, rates |

### 3.2 Wiring with `next/font`

```ts
// app/fonts.ts
import { Inter, Noto_Sans_Arabic } from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const inter = Inter({ subsets:["latin"], variable:"--font-sans", display:"swap" });
export const notoArabic = Noto_Sans_Arabic({ subsets:["arabic"], variable:"--font-arabic", display:"swap" });
export const displayVar = { variable: GeistSans.variable /* --font-geist-sans */ };
export const monoVar = { variable: GeistMono.variable /* --font-geist-mono */ };
```

```tsx
// app/layout.tsx — bind vars; alias Geist to --font-display/--font-mono in globals.css
<html lang="en" className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable} ${notoArabic.variable}`}>
```

```css
/* globals.css */
:root { --font-display: var(--font-geist-sans); --font-mono: var(--font-geist-mono); }
.font-tnum { font-feature-settings: "tnum" 1; }  /* apply to all numeric data */
[dir="rtl"] { --font-sans: var(--font-arabic); }
```

---

## 4. Spacing, layout & grid

**Base unit: 4px.** Spacing scale (`space-N` = `N × 4px`): `0, 1(4), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64), 20(80), 24(96)`.

**Containers:** `sm 640` · `md 768` · `lg 1024` · `xl 1200` (**default content max**) · `2xl 1360` (leaderboard/wide tables). Gutters: 16px mobile, 24px ≥md, 32px ≥xl.

**Grid:** 12-column, 24px gutter. Directory card grid = 1 col (mobile) → 2 (md) → 3 (xl). Profile = 8/4 split (content / sticky sidebar CTA). Filters sidebar = fixed 280px + fluid results.

**Breakpoints (Tailwind):** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

**Section rhythm:** vertical section padding 48px mobile / 80px desktop (`py-12` / `py-20`); intra-section stack 24px; card internal padding 20px (`p-5`); tight list rows 12–16px.

---

## 5. Radii, borders, shadows / elevation

| Token | Value | Use |
|---|---|---|
| radius-sm | 0.375rem (6px) | badges, chips, inputs (inner) |
| radius-md | 0.5rem (8px) | **base** — buttons, inputs, selects |
| radius-lg | 0.75rem (12px) | **cards**, modals, popovers |
| radius-full | 9999px | pills, avatars, toggle, star-rating dots |

**Borders:** 1px default, color `border` token (`#E2E8F0` light / `#26334D` dark). Inputs 1px `input`; focus ring 3px teal (`--ring`). Dividers = `border` at 1px.

**Elevation (shadows):**

| Token | Value | Use |
|---|---|---|
| shadow-xs | `0 1px 2px rgba(2,6,23,.06)` | resting card on gray bg |
| shadow-sm | `0 1px 3px rgba(2,6,23,.08),0 1px 2px rgba(2,6,23,.06)` | company card |
| shadow-md | `0 4px 12px rgba(2,6,23,.08)` | card hover, dropdown |
| shadow-lg | `0 12px 32px rgba(2,6,23,.12)` | modal, sheet, popover |
| shadow-focus | `0 0 0 3px rgba(15,110,107,.35)` | keyboard focus ring |

On dark, elevation is expressed by surface step-ups (`surface #111A2B` → `surface-2 #1B2740`) rather than heavy shadows; shadows drop to `rgba(0,0,0,.4)`.

---

## 6. Components

All components are shadcn/ui (Radix primitives) themed to the tokens above. Every interactive element specs the five states: **hover / focus-visible / active / disabled / loading**. Hit target ≥ 44×44px on touch.

### 6.1 Buttons

Sizes: `sm` (h-8, px-3, text-sm) · `md` (h-10, px-4, text-sm/base) · `lg` (h-12, px-6, text-base). Radius `md`. Font-weight 500. Icon-left/right gap 8px.

| Variant | Rest | Hover | Active | Focus | Disabled | Loading |
|---|---|---|---|---|---|---|
| **primary** | bg teal-700, white | bg teal-800 | bg teal-900 | + ring 3px | opacity .5, no-events | spinner + label, `aria-busy` |
| **secondary** | bg gray-100, gray-900 | bg gray-200 | bg gray-300 | ring | opacity .5 | spinner |
| **outline** | 1px border, teal-700 text | bg teal-50 | bg teal-100 | ring | border gray-200, gray-400 text | spinner |
| **ghost** | transparent, gray-700 | bg gray-100 | bg gray-200 | ring | gray-400 | spinner |
| **destructive** | bg danger-600, white | bg danger-700 | darker | ring (danger) | opacity .5 | spinner |
| **link** | teal-700, underline-offset | underline | teal-800 | ring | gray-400 | — |
| **AI CTA** | gradient teal-600→violet-600, white | brighten | violet-700 | ring | opacity .5 | spinner |

**Icon buttons:** square by size (`sm 32` / `md 40` / `lg 48`), radius `md`, centered 16–20px Lucide icon, always `aria-label`. On dark, primary shifts to teal-400 bg with navy-950 text.

### 6.2 Inputs & form controls

- **Text input / textarea:** h-10 (textarea min 96px), radius md, 1px `input` border, px-3. Placeholder gray-400. Focus: border teal-600 + ring. Error: border danger-600 + ring danger + helper text danger-700 + `aria-invalid`. Disabled: bg gray-50, gray-400. Optional leading/trailing icon or unit suffix (e.g. `$/hr`).
- **Select / Combobox:** Radix Select / Command. Trigger matches text input. Menu = popover (surface-2, shadow-lg, radius lg), item hover bg teal-50 / dark accent, selected item teal-700 check. Combobox adds type-ahead filter (used for country & service facets).
- **Checkbox:** 18px, radius sm, 1px border; checked bg teal-700 + white check; focus ring; indeterminate bar.
- **Radio:** 18px circle; selected teal-700 dot.
- **Toggle (Switch):** 36×20 track, radius full; off gray-300, on teal-700; 16px thumb; focus ring.
- **Field anatomy:** label (sm, 500, gray-700) · control · helper/error (xs). Required marked with `*` + `aria-required`.

### 6.3 Cards

Base card: surface bg, 1px border, radius lg, shadow-sm, padding 20px; hover → shadow-md + border teal-200, 150ms.

**Company card (the critical component).** Used across `/companies` and leaderboard tables. Exact elements:

```
┌──────────────────────────────────────────────┐
│ [logo 56px]  Name (h4)  [✔ Verified] [Claimed]│
│              ★★★★★ 4.8 (127 reviews)           │
│                                    ┌─────────┐ │
│  Tagline — one line, gray-600      │ CIS  87 │ │  ← score badge (violet ring)
│                                    │ Leader  │ │
│  📍 Riyadh, KSA   ·   $50–99/hr    └─────────┘ │
│                                                │
│  [ View Profile ]  [ Visit Website ↗ ]         │
└──────────────────────────────────────────────┘
```

- **logo:** 56px rounded-md, gray-100 fallback with initials.
- **name:** h4, links to `/companies/[slug]`.
- **verified badge:** teal check chip (see 6.4); **claimed badge:** neutral chip; **sponsored:** amber chip, only when `Sponsorship` active — always visually labeled, never affects rank.
- **star rating:** display component (6.11), 16px stars + numeric `4.8` (Geist Mono tnum) + `(reviewCount)` in gray-500.
- **tagline:** sm, gray-600, single line truncate.
- **score badge:** CIS component (6.10) — number 0–100 + tier label, violet ring.
- **location:** Lucide `map-pin` 14px + `City, Country`.
- **rate:** hourly_rate_range in mono tnum with ISO currency.
- **CTAs:** primary "View Profile" + outline "Visit Website" (external, `rel="nofollow noopener"`, ↗ icon).

Card sub-types: **compact** (leaderboard row — logo 32px, single line), **featured** (teal-50 wash + "Featured" badge for paid Featured tier).

### 6.4 Badges & chips

Height 20–24px, radius full (chips) or sm (status tags), xs weight-500, 8px horizontal padding, optional 12px leading icon.

| Badge | Style | Meaning |
|---|---|---|
| **Verified** | teal-100 bg / teal-800 text / check icon | claimed + admin-verified listing |
| **Claimed** | gray-100 bg / gray-700 text | owner-claimed, not yet verified |
| **Sponsored** | warning-100 (`#FEF3C7`) bg / warning-700 text | active `Sponsorship` — labeled, rank-neutral |
| **Unclaimed** | outline gray-300 / gray-500 | default seeded listing |
| **Score tier** | per tier (below) | Leaders / Challengers / Rising Stars / Niche Players |

**Score-tier colors:** Leaders `teal-700` · Challengers `info-600` · Rising Stars `violet-600` · Niche Players `gray-500`.

### 6.5 Tabs

Radix Tabs. Underline style: rest gray-600, active teal-700 text + 2px teal-700 bottom border, hover gray-900. Used on company profile: **Overview · Customer Reviews · Employee Sentiment · Trust Signals · AI Intelligence Summary** (order per canon trust-signal order). Keyboard: arrow-key roving tabindex, `role="tablist"`. Mobile: horizontal scroll with fade edges.

### 6.6 Tables

Directory/leaderboard/admin tables. Header row: sm, 600, gray-500 uppercase-tracking, sticky on scroll, bg surface. Rows: 48px, 1px bottom border, hover bg gray-50 / dark accent. Numeric columns right-aligned, Geist Mono tnum. Sortable headers show Lucide `chevron` + `aria-sort`. Zebra optional. Every chart ships a semantic `<table>` equivalent (SEO/GEO + a11y requirement). Movement vs last month rendered as ▲ success-600 / ▼ danger-600 / – gray-400.

### 6.7 Tooltips

Radix Tooltip. navy-900 bg / white text (both themes), radius md, xs, px-2 py-1, shadow-md, 8px offset, 200ms open delay. Never the sole carrier of essential info; must be reachable on focus, not hover-only.

### 6.8 Modals / Sheets

Radix Dialog (modal) / Sheet (side drawer). Overlay `rgba(10,15,26,.6)` + subtle backdrop blur (2px max — no heavy glass). Panel: surface, radius lg, shadow-lg, max-w 480 (dialog) / 400 (sheet), padding 24px. Header (h3) + close icon-button (top-right, `aria-label="Close"`). Focus trap, `Esc` closes, restore focus on close. Mobile: sheets slide from bottom. Query-flow and filters (mobile) use sheets.

### 6.9 Toasts, Pagination, Breadcrumbs

- **Toasts:** bottom-right stack, surface bg, 1px left accent bar by intent (success/warning/danger/info), radius lg, shadow-lg, auto-dismiss 5s, `role="status"` (assertive for errors). Max 3 visible.
- **Pagination:** numbered + prev/next; current page teal-700 filled, others ghost; `sm` size; `aria-current="page"`. Directory uses SSR page params (not infinite scroll) for crawlability.
- **Breadcrumbs:** `BreadcrumbList` JSON-LD site-wide. Separator Lucide `chevron-right` gray-400; links teal-700; current page gray-600 no-link. E.g. `Home / Companies / Saudi Arabia / AI Development`.

### 6.10 Score Badge (CIS component)

The signature component. Renders the Company Intelligence Score (0–100, computed deterministically — see [`_canon.md`](research/_canon.md) §6).

- **Shape:** rounded-lg chip or circular ring gauge. **Number** in Geist Mono, 600, tnum, `text-2xl` in profile hero / `text-lg` on cards.
- **Ring:** conic/gradient stroke **teal-600 → violet-600** proportional to score; track gray-200 / dark border.
- **Tier label** below number (Leaders/Challengers/Rising Stars/Niche Players) in tier color.
- **AI marker:** small Lucide `sparkles` in violet-600 + `aria-label="AI Company Intelligence Score"`.
- **Sizes:** `sm` (card, 40px ring), `md` (list, 56px), `lg` (profile hero, 96px ring).
- Clicking opens the AI Intelligence Summary tab (3-sentence justification). The number is never emitted by the LLM — display-only from `IntelligenceScore`.

### 6.11 Star rating — display & input

- **Display:** 5 stars, 16px (card) / 20px (profile). Filled teal-600, partial via clip for decimals, empty gray-300. Followed by numeric average (mono tnum) + `(reviewCount)`. `aria-label="Rated 4.8 out of 5"`. Sub-ratings (quality/schedule/cost/willingness-to-refer) render as labeled horizontal bar meters, teal fill.
- **Input:** interactive 24px stars, hover/focus preview fill, keyboard arrow-adjust, `role="radiogroup"`. Used in native review submission + the review-invitation flow.

### 6.12 Filters / facets sidebar

Directory left rail (280px; mobile = sheet). Groups: **Service** (checkbox list), **Country / City** (combobox), **Team size**, **Hourly rate** (range slider, mono tnum labels), **Min budget** (select), **Rating** (star-threshold radios). Applied filters shown as removable chips above results. Filter state = querystring only, **not indexable** (canon §3). "Clear all" ghost button. Slider: teal-700 track fill, 16px thumb, focus ring.

### 6.13 Quadrant chart (Recharts, leaderboards)

Gartner-style `ScatterChart`, X = **Market Presence**, Y = **Client Satisfaction**; median-split into **Leaders / Challengers / Rising Stars / Niche Players**.

- **Quadrant fills:** four faint tints — Leaders teal-50, Rising Stars violet-50 (`#F3EFFE`), Challengers info-50 (`#EFF6FF`), Niche gray-50 — separated by a dashed median crosshair in gray-300 (`ReferenceLine`).
- **Quadrant labels:** corner-anchored, xs, 600, tier color, low opacity so they don't compete with dots.
- **Bubbles:** each company = clickable logo bubble (28px avatar in a 2px teal-600 ring; sponsored ring warning-500). Fallback dot = teal-600, radius scaled to review volume. `<Tooltip>` shows name + CIS + rank; click → `/companies/[slug]`.
- **Axes:** gray-500 ticks, gray-200 grid, sm labels "Market Presence →" / "↑ Client Satisfaction"; no gridline clutter.
- **Theme binding:** feed colors from CSS vars via a `chartTheme` object; dark mode swaps grid to `#26334D`, text to `#94A3B8`.
- **A11y/GEO:** always render the ranked `<table>` equivalent beneath the chart with rank, CIS breakdown, and month-over-month movement.

```tsx
export const chartTheme = {
  grid:  "var(--border)",
  axis:  "#64748B",
  leaders:"#ECFDFB", challengers:"#EFF6FF", rising:"#F3EFFE", niche:"#F8FAFC",
  bubble:"#0C8A85", bubbleRing:"#0F6E6B", sponsoredRing:"#F59E0B",
  median:"#CBD5E1",
};
```

---

## 7. Iconography

**Lucide** (locked). Sizes: 14px (inline meta), 16px (buttons/inputs — default), 20px (section headers), 24px (feature/empty states). Stroke 1.5–2px, `currentColor` inherits token color. Decorative icons `aria-hidden`; standalone icon buttons require `aria-label`. Keep a curated allowlist so bundle stays lean.

---

## 8. Motion

| Token | Value | Applies to |
|---|---|---|
| duration-fast | 120ms | hover, tooltip, toggle |
| duration-base | 180ms | buttons, cards, tabs, dropdowns |
| duration-slow | 260ms | modals, sheets, page transitions |
| ease-standard | `cubic-bezier(.2,0,0,1)` | enter |
| ease-exit | `cubic-bezier(.4,0,1,1)` | exit |

**Animate:** opacity, transform (translate/scale), color/background, shadow, border. **Never animate:** layout-shifting properties on load (guard the **CLS ≤ 0.1** budget — reserve image/logo dimensions, no late-injected banners). Quadrant bubbles fade/scale in once (150ms, staggered ≤ 30ms), never loop. **`prefers-reduced-motion: reduce` → disable all non-essential transitions/transforms**, keep instant state changes. No parallax, no auto-playing carousels.

---

## 9. Dark mode strategy

Ship **light + dark from launch** via `class` strategy (`.dark` on `<html>`), toggled by `next-themes` with `defaultTheme="system"` and no-flash inline script. All color decisions flow through CSS variables (§2.9) — components never hardcode hex. On dark: accents promote teal-700 → **teal-400**; elevation via surface step-ups; shadows lighten to `rgba(0,0,0,.4)`; CIS violet shifts to `violet-500`. Marketing warm bg `#F7F5F2` maps to `navy-950` in dark. SSR the resolved theme class to avoid hydration flash.

---

## 10. Accessibility checklist (WCAG 2.2 AA, enforced in CI)

- [ ] **Contrast:** body text ≥ 4.5:1, large/UI ≥ 3:1 — automated token contrast check in CI (per canon §2).
- [ ] **Focus:** visible 3px teal ring (`--ring`) on every interactive element via `:focus-visible`; never `outline:none` without a replacement.
- [ ] **Keyboard:** full operability — tab order logical, Radix roving tabindex on tabs/menus, `Esc` closes overlays, focus trap + restore in modals/sheets.
- [ ] **Hit targets:** ≥ 44×44px on touch.
- [ ] **ARIA:** `aria-label` on icon buttons; `aria-invalid`/`aria-describedby` on errored fields; `aria-sort` on sortable headers; `aria-current` on active nav/page; `role="status"`/`alert` on toasts; `aria-busy` on loading buttons.
- [ ] **Semantics:** one `<h1>` per page, ordered h1–h3, real `<table>`/`<ul>`, landmark regions.
- [ ] **Reduced motion:** honor `prefers-reduced-motion`.
- [ ] **RTL:** `dir="rtl"` + Noto Sans Arabic for Arabic locales; mirror layout/icons.
- [ ] **Images:** meaningful `alt` (company logos = company name); decorative empty `alt`.

---

## 11. Voice & tone (UI copy)

**Credible, plain, confident — never hypey.** We are an authority/reference brand; copy should read like Gartner-meets-a-helpful-engineer.

- **Buttons/labels:** verb-first, sentence case — "View profile", "Get a quote", "Claim this profile", "Invite a client". No "Click here".
- **Empty states:** state fact + next action — "No verified reviews yet. Invite a client to leave the first one."
- **Errors:** human + actionable, no blame — "That email domain doesn't match this company's website. Try a work email or verify via DNS."
- **AI copy:** always attribute — "AI-generated summary based on TechFirms data" — and label the CIS as *computed*, never opinion. Never claim facts we didn't verify.
- **Numbers:** always dated and sourced (GEO answer-block style) — "As of July 2026, ranked by TechFirms' Company Intelligence Score."
- **Sponsored:** always the literal word "Sponsored," never a euphemism.

---

## 12. shadcn/ui setup notes

- **Init:** `npx shadcn@latest init` → style "new-york", base color "slate", CSS variables **on**, radius `0.5rem`. Overwrite generated `:root`/`.dark` with §2.9 tokens.
- **Components to install:** `button, input, textarea, select, checkbox, radio-group, switch, label, form, card, badge, tabs, table, tooltip, dialog, sheet, sonner (toast), pagination, breadcrumb, dropdown-menu, command (combobox), popover, slider, avatar, separator, skeleton, scroll-area, accordion (FAQ blocks)`.
- **Custom (built on Radix/primitives, not in the registry):** `ScoreBadge`, `StarRating`, `CompanyCard`, `QuadrantChart`, `FacetSidebar`, `TrustSignalBar`.
- **Theming approach:** all variants use CSS-variable tokens; extend `buttonVariants` (cva) with `ai` variant (teal→violet gradient) and keep `destructive` mapped to `danger`. Dark handled purely by `.dark` variable swap — zero per-component dark classes where avoidable.
- **Fonts:** wire `--font-display/-sans/-mono` per §3.2; set Inter as `--font-sans` default and Geist for headings/mono.

---

## Open questions / decisions needed

1. **Logo glyph:** ship text-only wordmark for MVP, or commission the "signal-bars" glyph before KSA launch? (Affects OG image template.)
2. **AI accent scope creep:** confirm violet stays CIS-only and is *not* used for the AI-match query flow CTA (currently spec'd as teal→violet AI CTA — acceptable since it's an AI feature, but flag for consistency review).
3. **OKLCH migration:** author tokens in OKLCH (Tailwind v4 native) now, or keep HEX until v4 upgrade? Canon lists HEX as source of truth — HEX for v1.
4. **Marketing warm bg in dark mode:** does `#F7F5F2` → `navy-950` mapping hold on landing pages, or do marketing pages stay light-only?
5. **Featured vs Sponsored visual weight:** confirm Featured (teal wash) reads clearly distinct from Sponsored (amber) so paid tiers aren't confused.
```