-- Deposit payment state, written only by /api/webhooks/stripe after
-- Stripe-Signature verification. RLS stays deny-by-default (no policies).
alter table public.agreements
  add column if not exists payment_status text,
  add column if not exists paid_at timestamptz;
