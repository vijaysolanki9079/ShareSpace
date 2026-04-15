-- Supabase SQL migration for `messages` table (MVP)
-- Run this in the Supabase SQL editor or via psql connected to your project.

-- Extension for gen_random_uuid
create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  sender_id uuid not null,
  ngo_id uuid,
  encrypted_content text not null,
  nonce text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Allow authenticated users to insert messages when sender_id = auth.uid()
create policy insert_messages_authenticated_sender on public.messages
  for insert
  with check (auth.role() = 'authenticated' and sender_id = auth.uid());

-- Minimal select policy: allow users to read messages they sent.
-- UPDATE this policy to include conversation participants, NGO staff, or
-- other membership checks appropriate for your application.
create policy select_messages_sender_only on public.messages
  for select
  using (auth.role() = 'authenticated' and sender_id = auth.uid());

-- Allow the message owner to update/delete their messages (optional)
create policy owner_modify_messages on public.messages
  for update, delete
  using (auth.role() = 'authenticated' and sender_id = auth.uid());

-- NOTE: This is intentionally conservative. Adapt policies to support
-- conversation membership, NGO staff roles, and read-only access for
-- recipients as required.
