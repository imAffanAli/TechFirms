# TechFirms — Design & Branding Foundation

Research brief for a premium B2B trust/intelligence directory. Goal: a concrete, copy-pasteable design system that signals **trust + technology + intelligence**, differentiates from Clutch's red, and works AI-first with Next.js 14 + Tailwind + shadcn/ui.

---

## 1. Competitive color landscape (why not just "another blue")

| Brand | Primary hex | Read |
|---|---|---|
| Clutch | red `#FF3D2E`-family | loud, energetic, "reviews" — the color we must avoid |
| Crunchbase | teal/cyan `#2292A7` | data/intelligence signal ([brandcolors.net](https://brandcolors.net/b/crunchbase)) |
| Gartner | deep navy `#002856` / `#112453` | authority, research ([colorxs](https://www.colorxs.com/color/gartner-blue)) |
| G2 | red/orange | reviews/energy |
| 2026 SaaS default | `#2563EB` / `#3B82F6` corporate blue | **"blue is invisible"** — indistinguishable ([recursion.agency](https://recursion.agency/blog/ui-color-trends-2026)) |

The 2026 consensus is explicit: defaulting to corporate blue makes you indistinguishable from every competitor ("blue is invisible in 2026" — [recursion.agency](https://recursion.agency/blog/ui-color-trends-2026); [tentackles](https://tentackles.com/blog/b2b-saas-color-palettes-2026-that-stand-out)). Winners use violet, emerald, teal, or monochromatic systems.

**Decision: a deep teal-cyan primary anchored by a near-black navy, with a violet "intelligence" accent.** Rationale:
- **Teal = trust + tech + intelligence in one color.** Teal "signifies trustworthiness and reliability… a popular choice in branding for technology" and blends blue's reliability with green's growth ([colorpsychology.org/teal](https://www.colorpsychology.org/teal/)). Cyan "carried the trust associations of blue while feeling lighter and more forward-looking… innovative, transparent" ([neurolaunch](https://neurolaunch.com/what-emotion-does-cyan-represent/)).
- **Differentiates** from Clutch/G2 red, from Gartner/corporate navy-blue, and from the invisible `#3B82F6` default — yet stays in the "credible/trusted" family, unlike orange or red.
- **Charcoal + teal is specifically flagged** as the pairing "for companies positioning themselves as innovative but reliable" ([colorpsychology.org/teal](https://www.colorpsychology.org/teal/)) — exactly TechFirms' pitch.
- **Violet accent for the AI layer.** The documented 2026 tech-brand gradient is violet→cyan (`#8B5CF6`→`#06B6D4`) ([recursion.agency](https://recursion.agency/blog/ui-color-trends-2026)); reserving violet for the AI Company Intelligence Score gives the "AI-first" story a visual home without diluting the trust primary.

Confidence: **High** on teal-as-differentiator; **Medium** on violet vs. a second teal-tint for the AI accent (both defensible — violet reads more "AI", but adds a color to govern).

---

## 2. Color tokens (copy-pasteable)

Authored as HEX (ship OKLCH with HEX fallback if you want future-proofing — Tailwind v4 and Radix are now OKLCH-native, [66colorful](https://66colorful.com/blog/oklch-color/)). Scale follows the Radix/Tailwind 50–950 convention (12-ish steps, perceptually spaced).

```css
/* PRIMARY — "Signal Teal" (trust + tech + intelligence) */
--teal-50:  #ECFDFB;
--teal-100: #CFF9F3;
--teal-200: #A0F0E7;
--teal-300: #64E1D6;
--teal-400: #2CC7BD;
--teal-500: #11A69E;  /* brand core / logo */
--teal-600: #0C8A85;  /* UI fills, large text */
--teal-700: #0F6E6B;  /* primary button bg, links on white */
--teal-800: #135755;
--teal-900: #144846;
--teal-950: #05302F;

/* ANCHOR — "Ink Navy" (authority surface, headers, footers, dark hero) */
--navy-950: #0A1B2E;  /* primary dark anchor */
--navy-900: #0E2438;
--navy-800: #16324A;

/* AI ACCENT — "Intelligence Violet" (reserve for Company Intelligence Score, AI badges) */
--violet-500: #7C5CFC;
--violet-600: #6D3EF0;  /* AI CTA / score chip */
--violet-700: #5A2FCC;

/* NEUTRALS — cool slate (precision, modern; per 2026 dev-tool guidance) */
--gray-50:  #F8FAFC;
--gray-100: #F1F5F9;
--gray-200: #E2E8F0;
--gray-300: #CBD5E1;
--gray-400: #94A3B8;
--gray-500: #64748B;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1E293B;
--gray-900: #0F172A;
--gray-950: #020617;

/* SEMANTIC (600 = default; 700 = accessible text-on-white) */
--success-500: #22C55E;  --success-600: #16A34A;  --success-700: #15803D;
--warning-500: #F59E0B;  --warning-600: #D97706;  --warning-700: #B45309;
--danger-500:  #EF4444;  --danger-600:  #DC2626;  --danger-700:  #B91C1C;
--info-500:    #3B82F6;  --info-600:    #2563EB;  --info-700:    #1D4ED8;
```

Note: **danger red is scoped to error/destructive states only** — never as an accent — precisely so we don't drift into Clutch/G2 territory. Semantic 500/600/700 values are Tailwind-derived and battle-tested for contrast.

### Dark-mode surface tokens (dark-first is now the standard, [recursion.agency](https://recursion.agency/blog/ui-color-trends-2026))

```css
--bg:        #0A0F1A;  /* app background (navy-tinted, not pure black) */
--surface:   #111A2B;  /* cards */
--surface-2: #1B2740;  /* elevated / popovers */
--border:    #26334D;
--text:      #F1F5F9;  /* primary */
--text-dim:  #94A3B8;  /* secondary */
--primary-on-dark: #2CC7BD;  /* teal-400 — links/accents shift lighter on dark */
```

---

## 3. WCAG 2.2 AA contrast validation

Computed relative-luminance contrast ratios (AA needs 4.5:1 normal text, 3:1 large/UI; [recursion.agency](https://recursion.agency/blog/ui-color-trends-2026) confirms AA as the 2026 baseline).

| Pair | Ratio | Verdict |
|---|---|---|
| `teal-700 #0F6E6B` text on white | **6.06:1** | AA normal ✅ (use for links & body accents on white) |
| `teal-600 #0C8A85` on white | 4.21:1 | AA large/UI only ✅ — **not** normal body text |
| White text on `teal-700` button | **6.06:1** | AA normal ✅ (recommended primary button) |
| White text on `teal-600` button | 4.21:1 | large/bold text only ⚠️ |
| `navy-950 #0A1B2E` bg + white text | ~16:1 | AA/AAA ✅ |
| `teal-400 #2CC7BD` on `#0A0F1A` (dark) | **9.16:1** | AA/AAA ✅ (dark-mode links/accents) |
| `gray-500 #64748B` on white | ~4.6:1 | AA normal ✅ (secondary text floor) |
| `violet-600 #6D3EF0` + white text | ~5.4:1 | AA normal ✅ (AI CTA) |

**Rules of thumb:** links/body-accent on white = **teal-700**; primary button = **teal-700 bg / white**; on dark, shift the accent up to **teal-400**; keep secondary text at **gray-500 or darker**; never put normal text in teal-500 or lighter on white.

---

## 4. Typography

shadcn/ui + Next.js 15 ship **Geist** as the default and it's the path of least resistance ([shadcn discussion #4143](https://github.com/shadcn-ui/ui/discussions/4143); [peerlist](https://peerlist.io/blog/engineering/how-to-use-vercel-geist-font-in-nextjs)). For a trust/intelligence directory I recommend a two-family split that still self-hosts cleanly via `next/font`:

| Role | Font | Why |
|---|---|---|
| Headings / display | **Geist Sans** (or **Inter Display** / **Söhne** if licensed) | modern, neutral-confident, "wide & loud" bold weights are the 2026 heading trend ([tentackles](https://tentackles.com/blog/b2b-saas-color-palettes-2026-that-stand-out)) |
| Body / UI | **Inter** (v4) | the most-tested UI text face; excellent at 14–16px, huge language coverage for MENA/Pakistan Latin content |
| Numeric / data / code | **Geist Mono** (tabular figures on) | leaderboard ranks, scores, funding figures — enable `tnum` so columns align |

Rationale for **Inter body + Geist headings** over all-Geist: Inter's larger x-height and hinting read better in dense directory tables/cards; Geist gives headings a sharper, more contemporary voice. All-Geist is also fully acceptable and lower-effort. For RTL (Arabic — Saudi/UAE), pair with **Noto Sans Arabic**, which is documented to pair with Inter/Geist ([shadcn-docs themes](https://shadcn-docs-nuxt.vercel.app/api/themes)).

### Modular type scale (1.25 major-third, base 16px)

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-display: "Geist", "Inter", sans-serif;
--font-mono: "Geist Mono", ui-monospace, monospace;

--text-xs:   0.75rem;  /* 12 — captions, badges */
--text-sm:   0.875rem; /* 14 — table body, meta */
--text-base: 1rem;     /* 16 — body */
--text-lg:   1.25rem;  /* 20 — card titles */
--text-xl:   1.5rem;   /* 24 — section headers */
--text-2xl:  1.953rem; /* ~31 — page H2 */
--text-3xl:  2.441rem; /* ~39 — leaderboard hero H1 */
--text-4xl:  3.052rem; /* ~49 — marketing hero */
/* line-heights: body 1.5–1.6; headings 1.1–1.2; tracking -0.01em to -0.02em on display */
```

`FontTrio` (49 curated shadcn heading/body/mono trios with CSS variables) is a fast way to A/B alternatives ([allshadcn.com/tools/fonttrio](https://allshadcn.com/tools/fonttrio/)).

---

## 5. 2026 B2B design trends worth adopting (and what to skip)

**Adopt:**
- **Distinctive-over-default color** — the single highest-leverage move; teal executes it ([recursion.agency](https://recursion.agency/blog/ui-color-trends-2026)).
- **Dark-first, then light variant.** Dark mode is now "the standard… light mode is the variant," 80%+ adoption cited ([recursion.agency](https://recursion.agency/blog/ui-color-trends-2026)). Ship both from day one via CSS variables.
- **Structural gradients** (brand/functional, not decorative) — a subtle teal→violet gradient on the AI Intelligence Score is on-trend and reinforces the "AI-first" narrative ([recursion.agency](https://recursion.agency/blog/ui-color-trends-2026)).
- **Warm-neutral option for marketing surfaces** — Pantone 2026 Color of the Year is **Cloud Dancer** (warm off-white, PANTONE 11-4201); a warm `#F7F5F2` marketing background reads "human, approachable" while product UI keeps cool slate for "precision" ([tentackles](https://tentackles.com/blog/b2b-saas-color-palettes-2026-that-stand-out), [recursion.agency](https://recursion.agency/blog/ui-color-trends-2026)).
- **Big, roomy "wide & loud" type + generous whitespace** — improves scannability of leaderboards ([tentackles](https://tentackles.com/blog/b2b-saas-color-palettes-2026-that-stand-out)).
- **OKLCH-authored tokens** (Tailwind v4/Radix native) for consistent tonal scales ([66colorful](https://66colorful.com/blog/oklch-color/)).

**Skip / caution (hype flags):**
- **Neon micro-accents & heavy glow effects** — trendy but wrong signal for a *trust/authority* product; a Gartner-adjacent brand should not glow. Use violet sparingly.
- **Over-glassmorphism / dense AI-gradient heroes** — reads consumer, not enterprise-credible.

---

## 6. Recommendations for TechFirms

1. **Ship the Signal Teal + Ink Navy system.** Teal-500 `#11A69E` as brand core, teal-700 `#0F6E6B` for interactive/text-on-white, navy-950 `#0A1B2E` as the authority anchor (headers, dark hero, footer). This is the whole differentiation thesis in two colors.
2. **Reserve violet `#6D3EF0` exclusively for the AI Company Intelligence Score** (score chip, AI badge, teal→violet gradient ring). One accent, one meaning — protects the "AI-first" story and prevents rainbow drift.
3. **Cool slate neutrals in-product, one warm off-white (`#F7F5F2`) for marketing pages** — precision where data lives, warmth where you sell.
4. **Fonts:** Geist (headings) + Inter (body) + Geist Mono w/ tabular figures (ranks, scores, funding). Add Noto Sans Arabic before the Saudi/UAE launch.
5. **Accessibility gates in CI:** enforce AA — links/body-accent teal-700, buttons teal-700/white, secondary text ≥ gray-500. Add an automated contrast check on tokens.
6. **Ship dark + light from launch** via shadcn CSS variables; on dark, promote the accent to teal-400 `#2CC7BD` (9.2:1). Since the pitch is "LLMs cite us," SSR + semantic, high-contrast HTML also serves accessibility and crawlability.
7. **Never use red as an accent** — scope `#DC2626` to errors only, keeping maximum distance from Clutch/G2.

---

## Sources
- https://recursion.agency/blog/ui-color-trends-2026
- https://tentackles.com/blog/b2b-saas-color-palettes-2026-that-stand-out
- https://www.colorpsychology.org/teal/
- https://neurolaunch.com/what-emotion-does-cyan-represent/
- https://brandcolors.net/b/crunchbase
- https://www.colorxs.com/color/gartner-blue
- https://github.com/shadcn-ui/ui/discussions/4143
- https://peerlist.io/blog/engineering/how-to-use-vercel-geist-font-in-nextjs
- https://allshadcn.com/tools/fonttrio/
- https://shadcn-docs-nuxt.vercel.app/api/themes
- https://66colorful.com/blog/oklch-color/
- https://www.radix-ui.com/colors
- https://www.acscreative.com/insights/the-psychology-behind-color-in-b2b-branding-what-actually-converts/
