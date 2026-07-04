# MTDPrep

MTDPrep turns an HSBC PDF bank statement into MTD-ready records. UK sole traders upload their statement, Claude extracts and categorises every transaction into HMRC expense categories, the user reviews and corrects the results in an editable table, and downloads a formatted `.xlsx` ready for MTD bridging software (123 Sheets, Absolute Excel, VT Tax). Fully stateless — no accounts, no database, and no statement data is ever stored server-side.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **@anthropic-ai/sdk** — server-side only, called from `/api/extract`
- **xlsx-js-style** — client-side spreadsheet generation with cell styling
- No database, no auth, no analytics

## Local setup

```bash
npm install
cp .env.local.example .env.local   # then add your key
npm run dev
```

Environment variables (`.env.local`):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Server-side key for the Claude API. Get one at [console.anthropic.com](https://console.anthropic.com/settings/keys). Never exposed to the browser. |

Open http://localhost:3000, upload an HSBC PDF statement, review, download.

## Deploying to Vercel

1. Push this folder to a Git repository (it currently lives inside the `mtdprep` repo — the root `.vercelignore` keeps it out of the static-site deployment).
2. In Vercel: **Add New → Project**, import the repo, and set **Root Directory** to `mtdprep-app`.
3. Add the `ANTHROPIC_API_KEY` environment variable (Production + Preview).
4. Deploy. Vercel auto-detects Next.js — no build config needed.

### Connecting app.mtdprep.co.uk

1. In the new Vercel project: **Settings → Domains → Add**, enter `app.mtdprep.co.uk`.
2. Vercel will show a CNAME record — add it at your DNS provider:
   `app` → `cname.vercel-dns.com`
3. Wait for DNS propagation (usually minutes); Vercel provisions the TLS certificate automatically.

## Stripe integration (not yet implemented)

The free-tier gate is a soft localStorage prompt (`mtdprep_usage`) with waitlist copy. When payments go live, the planned approach:

1. Add Stripe Checkout (hosted page) with a single `£19/month` recurring price — no card forms in-app.
2. Create a `/api/checkout` route that creates a Checkout Session and redirects.
3. On `checkout.session.completed` webhook, issue a signed token (e.g. JWT in a cookie) marking the browser as subscribed — still no database if kept token-based, or add a minimal KV store keyed by Stripe customer ID.
4. Replace the `hasUsedFreeStatement()` soft gate in `app/page.tsx` with a check on that token, keeping the free first statement for new users.
5. Add a customer portal link (Stripe Billing Portal) for cancellations.

## Known limitations

- **HSBC only (v1).** The extraction prompt is tuned for HSBC statement layouts. Other banks' PDFs may work but are untested and unsupported.
- **Tested formats:** text-based HSBC PDF statements (personal and Kinetic/business layouts). Scanned/image-only PDFs depend on Claude's OCR of the page images and may have lower accuracy — check the confidence column.
- 10MB upload limit per statement.
- Exports are formatted for import into 123 Sheets, Absolute Excel, and VT Tax; MTDPrep does not submit anything to HMRC itself.
- The free-tier gate is browser-local (localStorage) — clearing browser data resets it. It is deliberately a soft gate pre-launch.

## HMRC category definitions

| Category | Used for |
|---|---|
| Income | Money coming in — sales, payments received |
| Motor expenses | Fuel, parking, vehicle maintenance, MOT |
| Office expenses | Stationery, printer ink, small equipment |
| Repairs and maintenance | Property repairs, maintenance costs |
| Professional fees | Accountant, solicitor, consultant fees |
| Insurance | Business insurance premiums |
| Finance charges | Bank fees, interest charges, loan payments |
| Other allowable expenses | Legitimate business expenses not fitting the above |
| Personal | Clearly personal spending — excluded from the export |
| Review needed | Ambiguous — the user should categorise manually before export |

---

MTDPrep is an independent product and is not affiliated with or endorsed by HMRC or HSBC.
