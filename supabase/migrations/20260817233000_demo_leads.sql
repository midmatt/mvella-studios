-- Speed-to-Lead sales demo only.
-- Isolated from production studio data (agreements, Resend contact flow).
-- Do not join this table to freelance leads, and do not reuse these policies
-- on any other public table.

create table public.demo_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service_type text not null,
  description text not null,
  submitted_at timestamptz not null default now(),
  first_contact_at timestamptz,
  response_time_seconds numeric(10, 3),
  call_status text not null default 'pending',
  booked boolean not null default false,
  booked_at timestamptz,
  qualification_score integer,
  qualification_summary text,
  qualification_urgency text,
  contact_channel text,
  vapi_call_id text,
  cal_com_booking_uid text,
  sms_sent_at timestamptz,
  recording_consent text,
  watch_token text not null unique,
  n8n_fired_at timestamptz,
  n8n_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint demo_leads_call_status_check check (
    call_status in (
      'pending',
      'qualifying',
      'dialing',
      'ringing',
      'answered',
      'no_answer',
      'voicemail',
      'busy',
      'sms_sent',
      'booked',
      'failed',
      'consent_declined'
    )
  ),
  constraint demo_leads_score_check check (
    qualification_score is null
    or (qualification_score >= 1 and qualification_score <= 10)
  ),
  constraint demo_leads_consent_check check (
    recording_consent is null
    or recording_consent in ('granted', 'declined', 'unknown')
  ),
  constraint demo_leads_channel_check check (
    contact_channel is null
    or contact_channel in ('voice', 'sms', 'none')
  )
);

comment on table public.demo_leads is
  'MVella AI Systems Speed-to-Lead demo. Separate from production contact/agreement data. RLS policies are demo_leads_* only.';

create index demo_leads_submitted_at_idx
  on public.demo_leads (submitted_at desc);

create index demo_leads_booked_idx
  on public.demo_leads (booked);

-- Data API: table exists in public, so RLS is mandatory. Explicit deny for
-- browser roles — inserts/updates go through the Next.js service-role routes
-- and n8n. These policies are named and scoped to this table only; they do
-- not alter agreements or any other existing table.
alter table public.demo_leads enable row level security;

create policy demo_leads_anon_deny
  on public.demo_leads
  for all
  to anon
  using (false)
  with check (false);

create policy demo_leads_authenticated_deny
  on public.demo_leads
  for all
  to authenticated
  using (false)
  with check (false);

revoke all on table public.demo_leads from anon, authenticated, public;
grant all on table public.demo_leads to service_role;
grant all on table public.demo_leads to postgres;
