# Deploying TechFirms to a live link

This puts the whole app online at a public URL you can send to anyone. It uses **Render** (one free account) and the `render.yaml` blueprint in this repo, which sets up the database, the backend, and the website automatically.

## Steps (about 15 minutes, mostly waiting)

1. Go to **[render.com](https://render.com)** and **Sign up** — choose **"Sign in with GitHub"** (same account the code is on).
2. In the Render dashboard, click **New +** (top right) → **Blueprint**.
3. Render asks for a repository → pick **`imAffanAli/TechFirms`**. (If it's not listed, click "Configure GitHub" and give Render access to it.)
4. Render reads `render.yaml` and shows three things to create: a **PostgreSQL database**, **techfirms-api**, and **techfirms-web**. Give the blueprint any name and click **Apply**.
5. Wait. The first build takes ~10–15 minutes (it also loads all the demo companies and accounts). You can watch the logs; when both services show **"Live"**, it's ready.
6. Click the **techfirms-web** service → at the top you'll see its URL, like **`https://techfirms-web.onrender.com`**. **That's the link to send.**

## Demo logins to share

| Role | Email | Password | What they see |
|---|---|---|---|
| **Business owner** | `owner@techfirms.local` | `demo1234` | Manages **Devsinc** — edit profile, incoming leads, invite clients for reviews |
| **Admin** | `admin@techfirms.local` | `admin12345` | Full back-office: leads, claims, moderation, sponsorships |

Anyone can also **Register** their own account and **Claim** a company from a profile page.

## Good to know

- **Free tier sleeps.** After ~15 minutes of no visitors, the free services pause; the **first** visit then takes ~30–50 seconds to wake up (after that it's fast). Upgrading either service to a paid instance (~$7/mo) keeps it always-on.
- **Free database is temporary.** Render deletes free databases after ~30 days. To keep the demo long-term, upgrade the database, or just re-apply the blueprint to recreate it.
- **Turn on the AI features (optional).** In Render → **techfirms-api** → **Environment**, set `ANTHROPIC_API_KEY` to a key from [console.anthropic.com](https://console.anthropic.com). Then the profile descriptions become AI-written and the admin "Moderation" tool uses Claude.
- **Custom domain (optional).** In the **techfirms-web** service → **Settings → Custom Domains**, you can point something like `techfirms.com` at it.

## Prefer not to deal with hosting?
Ask and I can walk you through each screen, or set it up a different way.
