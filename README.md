# MVella Studios

Studio site for Matthew Vella — freelance web and iOS development, South Florida.

Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · Resend · Supabase · Vercel.

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
- `CONTACT_TO_EMAIL` — notification recipient. Defaults to `matthewvella.dev@gmail.com`.
- `CONTACT_FROM_EMAIL` — verified sender. The default sandbox sender only delivers to the Resend account owner, so client auto-replies need a verified domain here.
- `SUPABASE_URL` / `SUPABASE_SECRET_KEY` — the `agreements` table behind `/agreement`. Secret key is server-only; the table has RLS enabled with no policies, so the API route is its only reader and writer.
- `NEXT_PUBLIC_SITE_URL` — used in the agreement confirmation email.

## Before launch

- [ ] Resolve the 14 `REPLACE` markers on `/legal`, `/terms`, and `/agreement` — they render as highlighted placeholders on the live pages
- [ ] Have an attorney review the agreement's liability and governing-law clauses (the source document says so explicitly)
- [ ] Drop the `-draft` suffix from `AGREEMENT_VERSION` in `lib/agreement.ts` once the text is final
- [ ] Confirm the draft pricing in `lib/packages.ts`
- [ ] Fill in the prior technical degree in `lib/profile.ts`
- [ ] Reconcile the contact address split — the site shows `mvella303@gmail.com`, notifications go to `matthewvella.dev@gmail.com`
- [ ] Add a favicon (no icon-only mark exists yet — see spec §7)
