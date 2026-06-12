-- ============================================================
-- KARKOOBA — migration 0004: listing reports + rate-limit indexes
-- Paste this whole file into the Supabase SQL editor and run it.
-- ============================================================

create type public.report_reason as enum (
  'spam', 'scam', 'prohibited', 'offensive', 'other'
);

create table public.listing_reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      public.report_reason not null,
  details     text not null default '' check (char_length(details) <= 300),
  created_at  timestamptz not null default now(),
  unique (listing_id, reporter_id)
);

alter table public.listing_reports enable row level security;

-- Users can file a report; only the service role (moderation
-- dashboard) can read or delete them.
create policy "users report listings"
  on public.listing_reports for insert
  with check (reporter_id = auth.uid());

-- Indexes that make the per-user rate-limit counts cheap.
create index messages_sender_recent_idx
  on public.messages (sender_id, created_at desc);

create index listings_owner_created_idx
  on public.listings (owner_id, created_at desc);
