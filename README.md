# MVella Studios

Studio site for Matthew Vella — freelance web and iOS development, South Florida.

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
- `SUPABASE_URL` / `SUPABASE_SECRET_KEY` — the `agreements` table behind `/agreement`. Secret key is server-only; the table has RLS enabled with no policies, so the API route is its only reader and writer.
- `STRIPE_SECRET_KEY` (live, production only) / `STRIPE_TEST_SECRET_KEY` (previews and local dev) — deposit invoicing when an agreement is signed via a quote link.
- `NEXT_PUBLIC_SITE_URL` — used in emails and quote signing links.

## Outstanding

- [ ] **Attorney review of the liability clauses** — Service Agreement §8 and the Terms' limitation-of-liability section. The source documents flagged both as jurisdiction-sensitive (caps may not hold for gross negligence / willful misconduct under Florida law). The public-page review notes were removed on 2026-08-07 at Matthew's direction; this checklist and the header comments in `components/AgreementText.tsx` / `app/terms/page.tsx` are the private tracking. If wording changes after review, bump `AGREEMENT_VERSION`.

Resolved 2026-08-07: all 14 `REPLACE` markers across `/legal`, `/terms`, `/agreement` (terms confirmed by Matthew — 50/50 payment, 15-day late window, two revision rounds, $45/hr, 14-day termination, Florida law, Aug 7 2026 effective dates, engagement+5yr retention); `AGREEMENT_VERSION` finalized at `1.1`; Vercel Web Analytics installed to match the privacy policy; pricing confirmed via the quote-builder pass; contact addresses moved to `@mvella.com` (`hello@`, `info@`, `matthew@`).
