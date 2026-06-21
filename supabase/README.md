Supabase setup and migrations
=============================

This folder contains SQL migrations and guidance for the ShareSpace chat MVP.

Files:
- `001_create_conversations_and_members.sql` — creates `conversations` and `conversation_members` tables and RLS policies.
- `002_create_messages_table.sql` — creates `messages` table and RLS policies.
- `create_messages_table.sql` — legacy/alternate SQL (kept for reference).

Apply these in your Supabase project SQL editor or via `psql` against your database.

Quick steps (Supabase web UI):

1. Open your Supabase project and go to `SQL` → `New query`.
2. Copy and paste the contents of `001_create_conversations_and_members.sql` and run it.
3. Copy and paste the contents of `002_create_messages_table.sql` and run it.

Notes:
- The RLS policies provided are conservative — they limit reads/inserts to conversation members.
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret and set it in your deployment environment variables.
- After applying migrations, you may want to create test users and conversation membership rows for local QA.

Local dev tips:
- Ensure `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- For server operations (migration scripts or admin tasks), set `SUPABASE_SERVICE_ROLE_KEY` in your environment.
- To run the app locally:

```bash
npm ci
cp .env.local.example .env.local # or add vars to your existing .env.local
npm run dev
```
