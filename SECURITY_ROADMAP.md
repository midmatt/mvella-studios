# Security Roadmap — MVella Studios (mvella.com)

Generated from a threat-model pass against the live marketing/studio site (not a greenfield idea). This is a living checklist — check items off as they're built, and note where (file/component/route) each was addressed.

**Grade: B+** (was B before this pass). Strong for a public studio site: validated forms, honeypots, HTML-escaped emails, deny-all RLS on `agreements`, server-only secrets, Stripe hosted invoices (no card data on our origin), Consent Mode v2. Remaining gaps are listed under §8.

## 1. Project overview

- **What it does:** Public marketing site for MVella Studios — work, services, hiring packet, contact/quote, App Store support/feedback, and a signed Service Agreement that can issue a Stripe deposit invoice.
- **Stack:** Next.js 15 App Router + TypeScript + Supabase Postgres (agreements only) + Stripe Invoices + Resend + Vercel. No customer accounts.
- **Has accounts?** No — visitors do not log in. Admin is email + Stripe/Supabase dashboards.
- **Has payments?** Yes — one-time **deposit invoices** (50% of quoted total) via Stripe-hosted invoice links after `/agreement` is signed. Not Stripe Checkout subscriptions. Cards never touch our server.
- **Ships physical goods / collects delivery addresses?** No.
- **Other sensitive data?** Inquiry PII (name, email, message, budget, employer/role); agreement records (name, email, IP, user-agent, quote slugs, Stripe customer/invoice IDs). No health data, government IDs, or minors' data.
- **Regulatory context, if any:** GDPR/CCPA-style privacy rights documented on `/legal`; Google Consent Mode v2 for Ads/GA4/GTM; PCI scope minimized via Stripe-hosted invoices. Florida contract-record retention (engagement + 5 years) for signed agreements.

## 2. Data & trust boundaries

| Data | Where it lives | Who can access it |
|---|---|---|
| Contact / quote / hiring inquiries | Resend email to `CONTACT_TO_EMAIL` (default matthew@mvella.com). Not stored in our DB. | Matthew's inbox; Resend as processor |
| App support / feedback | Same Resend path via `/api/app-inquiry` | Matthew's inbox |
| `agreements` row (name, email, company, version, IP, UA, quote, deposit, Stripe IDs) | Supabase Postgres, project documented in `.env.example` | Server route with `SUPABASE_SECRET_KEY` only. RLS enabled with **no policies** — deny-by-default for the anon/authenticated keys |
| Payment method | Stripe Customer + hosted invoice | Stripe only |
| Analytics / ads identifiers | Google (gtag + GTM) only after Accept | Google; Consent Mode default denied |
| Vercel Web Analytics | Vercel (cookieless, aggregate) | Vercel dashboard |
| Cookie choice | `localStorage['cookie-consent']` | Visitor's browser only |

Public POST routes: `/api/contact`, `/api/agreement`, `/api/app-inquiry`. No GET that returns agreement rows. Quote prices are re-derived from `lib/packages.ts`, never from client-supplied totals.

## 3. Account & auth security

*(no end-user accounts — omitted as an auth product. Operational access is Vercel/Supabase/Stripe/GitHub.)*

- [x] No custom password store or session cookies for visitors
- [x] `SUPABASE_SECRET_KEY` used only in `/api/agreement` (`createClient` with `persistSession: false`) — never `NEXT_PUBLIC_`
- [ ] MFA on GitHub, Vercel, Supabase, Stripe, Resend, Google Ads (operator accounts — do this in those consoles, not in this repo)
- [ ] Admin actions are email + dashboard, not an in-app admin; no admin audit log in-app (acceptable; use provider logs)

## 4. Payment & subscription security

- [x] Card data never touches our server — Stripe hosted invoice (`collection_method: send_invoice`, `hosted_invoice_url`)
- [x] Deposit amount computed server-side (`resolveQuote` / `DEPOSIT_PERCENT`); client cannot set the charge
- [x] Live `STRIPE_SECRET_KEY` only when `VERCEL_ENV === "production"`; previews/dev use `STRIPE_TEST_SECRET_KEY` **with no live fallback** (`app/api/agreement/route.ts`)
- [x] Invoice metadata includes `agreement_id`; row updated with `stripe_customer_id` / `stripe_invoice_id`
- [ ] Stripe webhook signature verification (`invoice.paid` / `invoice.payment_failed`) — **not implemented**. Paid state is not used to unlock a product; still should-have so the `agreements` row reflects payment without opening Stripe
- [ ] Webhook handler idempotency (dedupe `event.id`) — blocked on adding the webhook
- [x] Idempotency of "create invoice" is best-effort (Stripe customer reused by email); not using Stripe idempotency keys yet
- [ ] Failed payment behavior is "invoice stays open 14 days" (Stripe `days_until_due`) — no in-app `past_due` gate because there is no gated app

Reference: `references/payment-security.md`

## 5. PII & delivery data security

- [x] Data minimization on public forms: name, email, message, optional project/budget/company/role; agreement adds IP + UA as signing evidence (documented on `/legal`)
- [x] No delivery addresses
- [x] Agreement IDs are UUIDs from Supabase (`record ${row.id}` in email). Not exposed as a public lookup URL
- [x] No file uploads
- [x] Retention documented: inquiries as needed; signed agreements engagement + 5 years (`app/legal/page.tsx`)
- [x] Deletion/access request path: email `LEGAL_EMAIL` (`/legal` Your Rights)
- [x] HTML emails escape user strings via `esc()` (`lib/email.ts`) before they hit Matthew's inbox
- [x] Third parties: Resend, Vercel, Supabase, Stripe, Google (Ads/GA4/GTM), listed on `/legal`
- [ ] No automated purge job for old inquiries (they live in email, not DB) or for agreements past the 5-year window

Reference: `references/data-and-delivery-security.md`

## 6. Rate limiting & abuse prevention

- [x] Public forms: honeypot field `website` on contact, agreement, and app-inquiry — 200 + drop
- [x] Zod validation + max lengths on every POST body
- [x] Cross-origin browser POSTs rejected (`lib/request-guard.ts` Origin allowlist: `SITE_ORIGIN` + `VERCEL_URL`)
- [x] In-process rate limit: 8 POSTs / 10 min / IP on contact and app-inquiry; 5 / 10 min on agreement. **Not global across Vercel isolates** — upgrade to Upstash if spam volume hurts
- [ ] No CAPTCHA (intentionally: honeypot first; add only if spam appears)
- [ ] Failed auth N/A (no login). Rate-limit 429s are not yet logged as a metric dashboard

Reference: `references/rate-limiting-and-abuse.md`

## 7. Infrastructure & secrets

- [x] Secrets in env vars; `.env` and `.env*.local` in `.gitignore`. `.env.example` has empty placeholders only
- [x] Separate Stripe live vs test keys (see §4)
- [x] `package-lock.json` committed
- [x] Dependabot weekly npm PRs (`.github/dependabot.yml`)
- [x] HTTPS via Vercel custom domain
- [x] Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (`next.config.mjs`)
- [ ] CSP not set (GTM/gtag/Resend-unrelated third parties make a strict CSP a follow-up)
- [x] Logs: Resend/Stripe errors logged; passwords/cards never in logs. Contact `console.error` uses provider error JSON, not the visitor message body in the failure path (the successful path does not log the message)
- [x] Consent Mode v2 default denied before GTM/gtag (`lib/cookie-consent.ts`, `app/layout.tsx`)
- [ ] Incident runbook (where to rotate Resend, Stripe, Supabase, Google) lives in operator head / this file — keep this table:

| Secret | Rotate at |
|---|---|
| `RESEND_API_KEY` | resend.com API keys |
| `SUPABASE_SECRET_KEY` | Supabase project API |
| `STRIPE_SECRET_KEY` / test | Stripe dashboard → Developers → API keys |
| Google Ads / GA4 / GTM | Google Ads / Analytics / Tag Manager |
| `CONTACT_TO_EMAIL` | Vercel env (not a secret, but a redirect target) |

Reference: `references/infra-and-secrets.md`

## 8. Priority split

**Must-have before launch:** (site is already live — treat as "must stay true")
- [x] No secrets in git; server-only Supabase/Stripe/Resend keys
- [x] Zod + honeypot on every public POST
- [x] HTML escape of inbound form text in notification emails
- [x] RLS deny-all on `agreements`; only the secret-key route writes
- [x] Cards never on our origin
- [x] Consent Mode default denied + Accept/Reject banner
- [x] Origin allowlist + basic rate limit on public POSTs
- [x] No live Stripe key on preview/dev

**Should-have soon after launch:**
- [ ] Stripe `invoice.paid` webhook with signature verification; store `paid_at` on `agreements`
- [ ] Upstash (or Vercel firewall) rate limit if spam/invoice-probing appears
- [ ] Content-Security-Policy tuned for GTM + next/image + Vercel Analytics
- [ ] `npm audit` / Dependabot alerts actually merged on a cadence
- [ ] MFA on operator accounts (GitHub, Vercel, Stripe, Google, Supabase)

**Nice-to-have / phase 2:**
- [ ] Stripe idempotency keys on invoice create
- [ ] Structured logging of 429s without storing form bodies
- [ ] Automated 5-year agreement retention purge (or calendar reminder)
- [ ] Honeypot → CAPTCHA escalation only if bots adapt

## 9. Pre-launch security checklist (final gate)

- [x] Must-have items above that are in this repo are checked off
- [x] No secrets committed to git (`.env.example` is placeholders)
- [ ] RLS: confirm in Supabase dashboard that `agreements` has RLS on and **zero** policies for `anon`/`authenticated` (not just the comment in code)
- [ ] Stripe: one test-mode signing on a preview deploy creates a **test** invoice, not live
- [x] This roadmap matches what was actually built as of the security-roadmap pass

---

*Roadmap generated by the security-roadmap skill. Update as the build evolves — this file is documentation, not a one-time planning artifact.*
