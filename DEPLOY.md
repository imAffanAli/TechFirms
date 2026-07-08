# Putting TechFirms online (free, no credit card)

This deploys the whole app — database, backend, and website — on **[Railway](https://railway.com)**. You log in with GitHub, and **no card is required to start**. Total time ~15 minutes, mostly waiting for builds.

The repo already contains the Railway config, so each service knows how to build and start itself. You mostly click and paste a couple of values.

---

## Step 1 — Create the project
1. Go to **[railway.com](https://railway.com)** → **Login** → **Log in with GitHub**.
2. Click **New Project** → **Deploy from GitHub repo** → pick **`imAffanAli/TechFirms`**.
   (If prompted, click **Configure GitHub App** and give Railway access to the repo.)
3. Railway creates a project and adds one service from the repo. We'll point it at the backend next, and add the website + database.

## Step 2 — Add the database
1. In the project, click **Create** (or **+ New**) → **Database** → **Add PostgreSQL**.
2. That's it — it creates a service named **Postgres**. Leave it as is.

## Step 3 — Set up the backend (the API)
1. Click the service that was created from your repo in Step 1 (it may be named "TechFirms"). Open its **Settings**.
2. Under **Source / Root Directory**, set the root directory to **`node`** and save.
3. Go to the service's **Variables** tab and add these three:
   - `DATABASE_URL` → click **Add Reference** and choose **Postgres → DATABASE_URL**
   - `DIRECT_URL` → click **Add Reference** and choose **Postgres → DATABASE_URL** (same one)
   - `NODE_ENV` → type `production`
4. Railway will redeploy. The first deploy runs the database setup and loads all the demo companies, so it takes a few minutes. Wait for a green **"Success / Active"**.
5. Open the service's **Settings → Networking → Generate Domain**. Copy the URL it gives you (e.g. `https://techfirms-node-production.up.railway.app`). **You'll paste this in the next step.**

## Step 4 — Set up the website
1. In the project, click **Create** (or **+ New**) → **GitHub Repo** → pick **`imAffanAli/TechFirms`** again.
2. Open the new service's **Settings** → set **Root Directory** to **`react`** and save.
3. Go to its **Variables** tab and add:
   - `API_URL` → paste the backend URL you copied in Step 3.5
   - `NODE_ENV` → type `production`
4. Wait for it to build and go **Active**.
5. Open **Settings → Networking → Generate Domain**. **The URL it gives you is the link to send your uncle.** 🎉

---

## Demo logins to share

| Role | Email | Password | What they can do |
|---|---|---|---|
| **Business owner** | `owner@techfirms.local` | `demo1234` | Manage **Devsinc** — edit the profile, see incoming leads, invite clients for reviews |
| **Admin** | `admin@techfirms.local` | `admin12345` | Full back-office: leads, claims, moderation, sponsorships |

Anyone can also just browse the directory, **Register** their own account, or **Claim** a company from its profile page.

---

## Good to know
- **Free trial credit.** Railway gives you a starting credit with no card. A small, low-traffic demo stretches this a long way. If the credit runs low after ~a month and you want to keep the link alive, Railway will ask you to add a card — you can decide then; nothing charges automatically without you choosing to.
- **Turn on AI features (optional).** In the **backend** service → **Variables**, add `ANTHROPIC_API_KEY` with a key from [console.anthropic.com](https://console.anthropic.com). Then profile descriptions become AI-written and the admin "Moderation" tool uses Claude. Everything else works fine without it.
- **Custom domain (optional).** In the **website** service → **Settings → Networking → Custom Domain**, you can point something like `techfirms.com` at it.
- **Re-deploys are quick.** The backend only loads the full company list the first time; later deploys skip straight to starting up.

## If a step looks different or gets stuck
Railway occasionally tweaks its buttons. Tell me where you are and what you see, and I'll get you unstuck — or I can walk you through it screen by screen.

---
<details>
<summary>Alternative: one-click on Render (needs a card on file)</summary>

The repo also has a `render.yaml` blueprint. On [render.com](https://render.com): **New → Blueprint → pick this repo → Apply**. It sets up everything automatically, but Render now requires a payment method on file even for the free tier.
</details>
