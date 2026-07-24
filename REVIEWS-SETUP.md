# Getting real ratings into TechFirms

The plan for adding **real, credible ratings** to company profiles — the safe, sustainable way. Follow this when you're ready to get the API keys.

## The approach (this is what keeps us safe)

We do **two** things, and deliberately avoid a third:

1. ✅ **Aggregate the numeric rating** from public platforms — e.g. Google **4.5**, Trustpilot **4.9** → we show both (with credit) and an average (**4.7**). A star-rating average is a *fact/number*, not copyrighted text, so showing it **with attribution** is fine.
2. ✅ **Write our own editorial summary** of each company — TechFirms' own assessment, generated from the signals we have (ratings, services, size, trust signals). This is **original content we own**.
3. ❌ **We never copy individual review text** from Google / Glassdoor / Clutch / etc. That's the copyrighted part — copying it (even with credit) is the part that isn't allowed.

**Result:** real ratings + an original writeup, every rating attributed to its source, nothing copied. It's also fresh original content (good for SEO), and it gives companies a reason to **claim and refine** their profile.

## What you need (keys)

| Key | Needed? | What it's for |
|---|---|---|
| **Google Places API key** | ✅ Required | The main source — each company's Google star rating + number of ratings |
| **Trustpilot Business API key** | ➕ Optional | A second platform rating to average in |
| **Anthropic API key** | ⏳ Later / optional | Auto-writes the editorial summaries (works without it — just simpler wording) |

The focus now is the **Google key**. (Clutch / G2 are ideal for our niche but need a partner-program application — a later step.)

---

## Step-by-step: Google Places API key

> **Heads-up:** Google requires a **billing account (a card on file)** to switch the API on. But there's a **generous free monthly allowance**, our usage is tiny, and we set a **hard cap** so it can never surprise-charge you. Realistically this stays **$0**.

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)** and sign in with a Google account.
2. **Create a project:** top bar → project dropdown → **New Project** → name it `TechFirms` → **Create**, then select it.
3. **Enable billing:** menu (☰) → **Billing** → **Link a billing account** → **Create account** → add a card. *(Nothing charges within the free allowance.)*
4. **Turn on the API:** menu → **APIs & Services → Library** → search **"Places API"** → open it → **Enable**. *(If you also see "Places API (New)", enable that too.)*
5. **Create the key:** **APIs & Services → Credentials → Create credentials → API key**. Copy the key it shows.
6. **Lock the key down (recommended):** click the new key → **API restrictions** → **Restrict key** → tick **Places API** → **Save**.
7. **Cap the spend (recommended):** **Billing → Budgets & alerts → Create budget** → set **$5/month** with an email alert. Then **APIs & Services → Places API → Quotas** → set a low daily request cap.
8. **Give it to the app:** in **Railway → backend service → Variables**, add:
   - `GOOGLE_PLACES_API_KEY` = *(the key you copied)*

That's the only required key to start.

---

## Step-by-step: Trustpilot (optional second source)

1. Go to **[businessapp.b2b.trustpilot.com](https://businessapp.b2b.trustpilot.com)** and create a business account.
2. Apply for **API access** (the Business Units API) in their developer/integrations section.
3. Once approved, copy your **API key**.
4. In **Railway → backend → Variables**, add `TRUSTPILOT_API_KEY` = *(key)*.

*(Approval can take a little while — Google alone is enough to launch this feature.)*

---

## How it works once the keys are in

For each company, the app will:

1. **Find it** on Google (by name + city) to get its Google **Place ID**.
2. **Pull the aggregate rating** — e.g. `4.5` from `132` ratings — and store it **with a "Rating via Google" credit + link back**.
3. *(If a Trustpilot key is present)* pull its TrustScore too.
4. **Average** the platform ratings into one headline number, showing each source underneath.
5. **Generate an original editorial summary** from the company's signals (uses the Anthropic key if present, or a clean template if not).
6. **Refresh** the ratings periodically (stored short-term and re-fetched, per each platform's display rules).

We attribute every rating to its source and never republish individual reviews.

## Env vars summary (backend service on Railway)

```
GOOGLE_PLACES_API_KEY = <required>
TRUSTPILOT_API_KEY    = <optional>
ANTHROPIC_API_KEY     = <optional — enables AI-written summaries>
```

## Checklist

- [ ] Google Cloud project created
- [ ] Billing linked + budget cap set
- [ ] Places API enabled
- [ ] API key created + restricted
- [ ] `GOOGLE_PLACES_API_KEY` added to Railway backend
- [ ] *(optional)* Trustpilot key added
- [ ] Tell Claude it's set → the ratings feature gets switched on

---

When the Google key is in, the connector gets wired up. It's built to stay dormant and graceful until the key exists, so nothing breaks in the meantime.
