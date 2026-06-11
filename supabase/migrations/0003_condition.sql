-- ============================================================
-- KARKOOBA — migration 0003: item condition
-- Paste this whole file into the Supabase SQL editor and run it.
-- ============================================================

create type public.item_condition as enum ('like_new', 'good', 'worn', 'parts');

alter table public.listings
  add column condition public.item_condition not null default 'good';
