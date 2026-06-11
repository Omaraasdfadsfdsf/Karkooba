-- ============================================================
-- KARKOOBA — migration 0002: in-site chat
-- Paste this whole file into the Supabase SQL editor and run it.
-- ============================================================

-- ---------- conversations ----------
-- One conversation per (listing, buyer). The seller is denormalized
-- so RLS checks don't need a join.
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references public.listings (id) on delete cascade,
  buyer_id        uuid not null references public.profiles (id) on delete cascade,
  seller_id       uuid not null references public.profiles (id) on delete cascade,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

create index conversations_buyer_idx  on public.conversations (buyer_id, last_message_at desc);
create index conversations_seller_idx on public.conversations (seller_id, last_message_at desc);

-- ---------- messages ----------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 1000),
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------- RLS ----------
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

create policy "participants read their conversations"
  on public.conversations for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Only a buyer can open a conversation, and only about a real,
-- non-deleted listing whose owner is the named seller.
create policy "buyers start conversations about listings"
  on public.conversations for insert
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.owner_id = seller_id
        and l.status <> 'deleted'
    )
  );

create policy "participants read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "participants send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- No UPDATE/DELETE policies on messages: nobody can edit chat history.
-- Read receipts go through the function below instead.

-- ---------- read receipts ----------
-- Marks every message you RECEIVED in a conversation as read.
-- SECURITY DEFINER so it can touch read_at without a general update policy.
create or replace function public.mark_conversation_read(conv uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.messages m
  set read_at = now()
  from public.conversations c
  where m.conversation_id = conv
    and c.id = conv
    and m.read_at is null
    and m.sender_id <> auth.uid()
    and (c.buyer_id = auth.uid() or c.seller_id = auth.uid());
$$;

revoke all on function public.mark_conversation_read(uuid) from public;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ---------- keep conversations sorted by activity ----------
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------- realtime ----------
-- Lets the chat UI receive new messages live. RLS still applies:
-- users only receive events for rows they are allowed to read.
alter publication supabase_realtime add table public.messages;
