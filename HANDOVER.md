# MTDPrep — Buyer Handover Guide

## What you're getting

MTDPrep is a working product for UK sole traders and landlords who need to comply with Making Tax Digital (MTD) but don't want to buy a full accounting suite. It reads a UK bank statement PDF, categorises every transaction into HMRC expense categories, and exports a spreadsheet ready for MTD bridging software (123 Sheets, Absolute Excel, VT Tax). You're getting the domains, the marketing site (with an active waitlist and SEO content), the app itself (with a working Stripe subscription flow in test mode), the brand assets, and full documentation to take it all over.

## Day 1 checklist

- [ ] Transfer GitHub repo (Settings → Transfer)
- [ ] Transfer mtdprep.co.uk domain (GoDaddy → your registrar or to you)
- [ ] Transfer mtdprep.com domain
- [ ] Clone repo and set up locally
- [ ] Create your own Stripe account and replace test keys
- [ ] Update Vercel environment variables
- [ ] Transfer Mailchimp audience
- [ ] Transfer Google Analytics 4 property
- [ ] Transfer Google Search Console property
- [ ] Verify app.mtdprep.co.uk is live under your Vercel account

## Stripe setup (go live)

1. Create a Stripe account at stripe.com (or use your existing one).
2. In the Stripe dashboard: **Product catalog → Products → Add product** → name it "MTDPrep Standard".
3. **Add price** → Recurring → £19/month → Save.
4. Copy the Price ID (starts with `price_`).
5. In Vercel, update the `mtdprep-app` project's environment variables:
   - `STRIPE_SECRET_KEY` — your live secret key (starts with `sk_live_`)
   - `STRIPE_PRICE_ID` — the price ID from step 4
6. Test a payment end-to-end in Stripe **test mode** first (use Stripe's test card `4242 4242 4242 4242`) before switching the keys to live mode.
7. Once confirmed, switch `STRIPE_SECRET_KEY` to the live key and redeploy.

Environment variables to update in Vercel (`mtdprep-app` project):
- `ANTHROPIC_API_KEY` — get a new key from console.anthropic.com (the key used during development was rotated/invalidated during handover for security)
- `STRIPE_SECRET_KEY` — replace with your live key (`sk_live_...`)
- `STRIPE_PRICE_ID` — your £19/month price ID
- `NEXT_PUBLIC_APP_URL` — set to `https://app.mtdprep.co.uk`

## Domain transfers

`mtdprep.co.uk` and `mtdprep.com` are registered via GoDaddy with domain privacy enabled.

1. Log into the GoDaddy account holding the domains.
2. **Domain Settings → Transfer Domain → Transfer to another GoDaddy account** (if you also use GoDaddy), or unlock the domain and get the authorisation/EPP code to transfer to another registrar.
3. For `.co.uk` domains specifically, Nominet-registered domains transfer via an "IPS Tag" change if moving between UK registrars, or the standard EPP process for international transfers.
4. Update the domain's DNS to point at Vercel once transferred (see Vercel Projects section below) — Vercel will show you the exact records needed when you add the domain to a project.

## Vercel projects

There are two separate Vercel projects sharing this one GitHub repo:

1. **Main site** (root directory: `.`) → deploys `mtdprep.co.uk` and `www.mtdprep.co.uk`. Plain static HTML, no build step, no environment variables required.
2. **mtdprep-app** (root directory: `mtdprep-app/`) → deploys `app.mtdprep.co.uk`. Next.js app, requires the environment variables listed above.

Transfer both to your Vercel account via **Settings → Transfer Project** on each one.

## Google Analytics 4

Property ID: `G-QL2X5V9YNM`. Transfer via **GA4 Admin → Property → Property Access Management** — grant the new owner Admin access, then have them remove the old owner once confirmed.

## Google Search Console

The `mtdprep.co.uk` property is verified and has a submitted sitemap (`https://www.mtdprep.co.uk/sitemap.xml`). Transfer via **Search Console → Settings → Users and permissions → Add user** (grant Owner), then remove the previous owner once confirmed.

## Mailchimp

The audience contains subscribers who signed up from the waitlist form on the marketing site (check the Mailchimp dashboard directly for the current count — this changes daily). Transfer instructions: **Mailchimp Admin → Export audience → Import to new account**, or add the buyer as a user on the existing account and transfer billing ownership directly.

## Adding more banks

The app already works with any UK bank PDF — no code changes required. The AI reads whatever statement format is uploaded and identifies the bank name automatically. HSBC, Lloyds, Barclays, NatWest, Santander, Halifax, and Nationwide are all directly compatible (the system prompt lists these as examples for identification, not as a hard-coded allowlist — any UK bank statement should work).

To add explicit bank-specific parsing rules or tune accuracy for a particular bank's layout, edit the system prompt in:
`mtdprep-app/app/api/extract/route.ts`

## Adding user accounts (optional upgrade)

Currently the app is stateless — no login required. Paid status is stored in the browser's `localStorage` (`mtdprep_paid`), which means it's per-device and can be cleared by the user.

To add proper auth (recommended before scaling a real subscription business): integrate Clerk or NextAuth. Clerk has a free tier that handles login plus subscription status verification out of the box.

## Adding Stripe webhooks (recommended for production)

Currently, paid status is set client-side after the `/success` page verifies the Checkout Session server-side — this works but isn't persistent across devices or browsers. For production:

1. Add a webhook route: `POST /api/webhooks/stripe`, handling the `checkout.session.completed` event.
2. Store subscription status in a database keyed by Stripe customer ID (Supabase's free tier is a reasonable starting point).
3. Check that database record instead of (or alongside) the `localStorage` flag.

This makes paid status persistent regardless of device, and is the standard production pattern for Stripe subscriptions.

## Anthropic API costs

Each PDF statement processed costs approximately £0.01–£0.03 in Claude API fees (using the `claude-haiku-4-5` model). At £19/month per subscriber, margins are strong even at low volumes — a single active subscriber covers hundreds of statement uploads' worth of API cost. Monitor usage and spend at console.anthropic.com.

## Known limitations

- The free-tier gate uses `localStorage` — it can be cleared by the user to reset their free statement. Add auth + a backend to enforce this properly at scale.
- Paid status is per-device — if a user pays on one device, they'll need to complete the "already upgraded" refresh flow (or re-authenticate once auth is added) on a second device, until webhooks + auth are added.
- The app works with all major UK banks via the same extraction prompt but has been most thoroughly tested with HSBC statements during development.
- No database — this is a deliberate architecture choice for simplicity and low running cost, not an oversight. It's the right call until you need persistent accounts.

## Tech stack

- Next.js 14 (App Router) — hosted on Vercel
- Anthropic Claude API — PDF extraction and categorisation
- Stripe — payments (Checkout Sessions, subscription mode)
- Tailwind CSS — styling
- xlsx-js-style — Excel export with cell formatting
- No database, no auth in the current version
- Marketing site: plain static HTML/CSS, no build step, no framework
