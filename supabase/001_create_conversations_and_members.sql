-- 001_create_conversations_and_members.sql
-- Creates conversations and conversation_members tables with conservative RLS.

create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null,
  role text,
  created_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;

-- Allow authenticated users to insert a conversation row only via server processes
-- (service role key) or through an API that validates participants. Keep insert
-- restricted so client cannot create arbitrary conversations unless desired.
create policy conversations_select_for_members on public.conversations
  for select
  using (exists (
    select 1 from public.conversation_members cm where cm.conversation_id = public.conversations.id and cm.user_id = auth.uid()
  ));

create policy conv_members_insert_own on public.conversation_members
  for insert
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy conv_members_select_own on public.conversation_members
  for select
  using (auth.role() = 'authenticated' and user_id = auth.uid());

-- Note: Conversation creation should be handled server-side (service role) or via
-- a carefully designed API route that ensures the creator and participants are
-- valid. The policies above keep membership visibility limited to members.
