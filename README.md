# MVella Studios

Studio site for Matthew Vella — freelance web and mobile development, South Florida.

Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion · Resend · Supabase · Vercel.

## Routes

| Route | What it is |
|---|---|
| `/` | Hero, stats, featured work, services teaser, testimonials, closing CTA |
| `/work` | Full work feed — case-file readout per project, from `lib/projects.ts` |
| `/services` | Service cards + interactive quote builder (`#quote-builder`) |
| `/contact` | Contact form |
| `/about` | Bio, writing, and the full-time role inquiry form |
| `/legal`, `/terms` | Legal & privacy, terms of use |
| `/agreement` | Client service agreement + scroll-gated e-signature flow |
| `/ai-systems` | Speed-to-Lead sales demo (isolated `demo_leads` table — not the production contact form) |
| `/ai-systems/dashboard` | Password-gated demo ops view |

## Content lives in `lib/`

`projects.ts`, `services.ts`, `packages.ts`, `testimonials.ts`, and `profile.ts` are the single sources of truth. Adding a project or changing a price is a one-file edit — every surface that renders it follows.

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Environment

Copy `.env.example` to `.env.local`. Without these, the forms and signing flow fail loudly rather than silently reporting success:

- `RESEND_API_KEY` — required for `/api/contact` and `/api/agreement` to send mail. Absent → both routes answer 503 and the forms show a direct-email fallback.
- `CONTACT_TO_EMAIL` — notification recipient. Defaults to `matthew@mvella.com`.
- `CONTACT_FROM_EMAIL` — verified sender. Defaults to `MVella Studios <hello@mvella.com>` (must be a domain verified in Resend).
- `SUPABASE_URL` / `SUPABASE_SECRET_KEY` — server-only. Used by `/agreement` (`agreements`) and the Speed-to-Lead demo (`demo_leads`). Each table has its own RLS. Never expose this key client-side.
- `STRIPE_SECRET_KEY` (live, production only) / `STRIPE_TEST_SECRET_KEY` (previews and local dev) — deposit invoicing when an agreement is signed via a quote link.
- `STRIPE_WEBHOOK_SECRET` (live, production) / `STRIPE_TEST_WEBHOOK_SECRET` (previews and local `stripe listen`) — signing secret for `POST /api/webhooks/stripe`.
- `NEXT_PUBLIC_SITE_URL` — used in emails and quote signing links. For Speed-to-Lead, Vapi also posts to `${NEXT_PUBLIC_SITE_URL}/api/ai-systems/vapi` — localhost is unreachable from Vapi cloud, so use a tunnel or a deployed URL when testing calls.

## Speed-to-Lead demo

Isolated from `/contact` and `agreements`. Apply `supabase/migrations/20260817233000_demo_leads.sql` in the Supabase SQL editor, copy the new vars from `.env.example`, import `n8n/speed-to-lead.json` into local n8n, **activate** it, and point `N8N_WEBHOOK_URL` at the Production webhook URL (`/webhook/speed-to-lead`). n8n keeps Anthropic, Vapi, and Twilio keys in its own environment — they are never hardcoded in the workflow JSON. If Code nodes cannot read `$env`, set `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` on the n8n host. Vapi status webhooks go to Next.js (`/api/ai-systems/vapi`), because cloud Vapi cannot reach localhost n8n.

## Outstanding

- [ ] **Attorney review of the liability clauses** — Service Agreement §8 and the Terms' limitation-of-liability section. The source documents flagged both as jurisdiction-sensitive (caps may not hold for gross negligence / willful misconduct under Florida law). The public-page review notes were removed on 2026-08-07 at Matthew's direction; this checklist and the header comments in `components/AgreementText.tsx` / `app/terms/page.tsx` are the private tracking. If wording changes after review, bump `AGREEMENT_VERSION`.

Resolved 2026-08-07: all 14 `REPLACE` markers across `/legal`, `/terms`, `/agreement` (terms confirmed by Matthew — 50/50 payment, 15-day late window, two revision rounds, $45/hr, 14-day termination, Florida law, Aug 7 2026 effective dates, engagement+5yr retention); `AGREEMENT_VERSION` finalized at `1.1`; Vercel Web Analytics installed to match the privacy policy; pricing confirmed via the quote-builder pass; contact addresses moved to `@mvella.com` (`hello@`, `info@`, `matthew@`).
