-- ============================================================
-- KARKOOBA — initial schema
-- Paste this whole file into the Supabase SQL editor and run it.
-- ============================================================

-- ---------- enums ----------
create type public.listing_category as enum (
  'electronics', 'furniture', 'kitchen', 'tools', 'books', 'kids', 'misc'
);

create type public.uae_emirate as enum (
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
  'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
);

create type public.listing_status as enum ('active', 'sold', 'deleted');

-- ---------- profiles ----------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  -- normalized WhatsApp number: 971 followed by 8-9 digits
  phone        text not null check (phone ~ '^971[0-9]{8,9}$'),
  emirate      public.uae_emirate not null,
  created_at   timestamptz not null default now()
);

-- ---------- listings ----------
create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 3 and 60),
  description text not null default '' check (char_length(description) <= 500),
  price_aed   integer not null check (price_aed between 0 and 999),
  category    public.listing_category not null,
  emirate     public.uae_emirate not null,
  status      public.listing_status not null default 'active',
  created_at  timestamptz not null default now()
);

create index listings_active_created_idx
  on public.listings (created_at desc)
  where status = 'active';

create index listings_owner_idx on public.listings (owner_id);

-- ---------- listing photos (max 4 per listing via position 0-3) ----------
create table public.listing_photos (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  position     integer not null check (position between 0 and 3),
  unique (listing_id, position)
);

create index listing_photos_listing_idx on public.listing_photos (listing_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.listings       enable row level security;
alter table public.listing_photos enable row level security;

-- profiles: public read (buyers need the seller's name + WhatsApp number),
-- owners manage their own row
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- listings: anyone can read active listings, owners can read/manage all of theirs
create policy "active listings are publicly readable"
  on public.listings for select
  using (status = 'active' or owner_id = auth.uid());

create policy "owners insert their own listings"
  on public.listings for insert
  with check (owner_id = auth.uid());

create policy "owners update their own listings"
  on public.listings for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners delete their own listings"
  on public.listings for delete
  using (owner_id = auth.uid());

-- listing_photos: visible when the parent listing is visible,
-- writable only by the listing owner
create policy "photos of visible listings are readable"
  on public.listing_photos for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'active' or l.owner_id = auth.uid())
    )
  );

create policy "owners add photos to their listings"
  on public.listing_photos for insert
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

create policy "owners delete photos of their listings"
  on public.listing_photos for delete
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

-- ============================================================
-- Storage: public bucket for listing photos
-- Files are stored under <user_id>/<listing_id>/<n>.jpg
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880, -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "listing photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "users upload into their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete from their own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
