-- 002_create_messages_table.sql
-- Messages table referencing conversations.id with RLS restricting reads to members.

create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  encrypted_content text not null,
  nonce text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Allow authenticated users to insert messages if they are a member of the conversation
create policy insert_messages_if_member on public.messages
  for insert
  with check (
    auth.role() = 'authenticated' and
    sender_id = auth.uid() and
    exists (
      select 1 from public.conversation_members cm where cm.conversation_id = new.conversation_id and cm.user_id = auth.uid()
    )
  );

-- Allow members of the conversation to select messages
create policy select_messages_for_members on public.messages
  for select
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.conversation_members cm where cm.conversation_id = public.messages.conversation_id and cm.user_id = auth.uid()
    )
  );

-- Allow owners to update/delete their own messages
create policy owner_modify_messages on public.messages
  for update, delete
  using (auth.role() = 'authenticated' and sender_id = auth.uid());
