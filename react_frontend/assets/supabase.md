# Supabase Integration (Frontend + Backend Configuration Plan)

This project uses Supabase for:
- Authentication (email/password)
- Database (Postgres) via Supabase APIs
- Storage (PDFs and thumbnails)

ACTION REQUIRED: Environment variables (set in .env at project root)
- REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co
- REACT_APP_SUPABASE_ANON_KEY=<anon-key>
- REACT_APP_SITE_URL=<your-site-url> (used for auth redirects; include trailing slash or we will normalize in code)

Current status:
- The CI/container currently has no Supabase credentials configured, so automatic DB setup via tools is blocked.
- After you set the env vars, re-run the Supabase configuration step to apply schema and RLS.

Storage Buckets:
- notes: stores uploaded PDFs and optional thumbnails
  - PDFs: `pdfs/<user_id>/<timestamp>-<filename>`
  - Thumbnails: `thumbs/<user_id>/<timestamp>-<filename>`

Database Tables required by the frontend:
1) profiles
   - id (uuid, PK, references auth.users.id)
   - username (text, unique, nullable)
   - avatar_url (text, nullable)
   - created_at (timestamptz, default now())
   RLS (intended):
   - SELECT: authenticated
   - INSERT/UPDATE: only own row (auth.uid() = id)

2) notes
   - id (uuid, PK, default gen_random_uuid())
   - title (text)
   - description (text)
   - subject (text)
   - level (text)
   - tags (text) — comma-separated list
   - pdf_path (text) — storage path within 'notes' bucket
   - thumb_path (text, nullable)
   - user_id (uuid, references auth.users.id)
   - size_bytes (int4)
   - mime_type (text)
   - likes (int4, default 0)
   - bookmarks (int4, default 0)
   - downloads (int4, default 0)
   - created_at (timestamptz, default now())
   Indexes suggested:
   - created_at DESC (for browse/trending)
   - subject, level (for filters)
   RLS (intended):
   - SELECT: public read OR authenticated read (decide per product); default here: public read
   - INSERT: authenticated users can insert with user_id = auth.uid()
   - UPDATE/DELETE: only owner (auth.uid() = user_id)

3) notes_likes
   - id (bigserial PK)
   - note_id (uuid, references notes.id on delete cascade)
   - user_id (uuid, references auth.users.id)
   - created_at (timestamptz, default now())
   Unique:
   - (note_id, user_id)
   RLS (intended):
   - SELECT: authenticated
   - INSERT/DELETE: only own (auth.uid() = user_id)

4) notes_bookmarks
   - id (bigserial PK)
   - note_id (uuid, references notes.id on delete cascade)
   - user_id (uuid, references auth.users.id)
   - created_at (timestamptz, default now())
   Unique:
   - (note_id, user_id)
   RLS (intended):
   - SELECT: authenticated
   - INSERT/DELETE: only own (auth.uid() = user_id)

Planned SQL (will be executed automatically once env vars are provided):

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text,
  level text,
  tags text,
  pdf_path text not null,
  thumb_path text,
  user_id uuid not null references auth.users(id) on delete cascade,
  size_bytes int4,
  mime_type text,
  likes int4 default 0,
  bookmarks int4 default 0,
  downloads int4 default 0,
  created_at timestamptz default now()
);
create index if not exists idx_notes_created_at on public.notes (created_at desc);
create index if not exists idx_notes_subject on public.notes (subject);
create index if not exists idx_notes_level on public.notes (level);
alter table public.notes enable row level security;
create policy "Notes are viewable by everyone" on public.notes for select using (true);
create policy "Users can insert their own notes" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes" on public.notes
  for update using (auth.uid() = user_id);
create policy "Users can delete their own notes" on public.notes
  for delete using (auth.uid() = user_id);

-- notes_likes
create table if not exists public.notes_likes (
  id bigserial primary key,
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (note_id, user_id)
);
alter table public.notes_likes enable row level security;
create policy "Authenticated can read likes" on public.notes_likes for select using (auth.role() = 'authenticated');
create policy "Users can like (insert) for themselves" on public.notes_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can remove their likes" on public.notes_likes
  for delete using (auth.uid() = user_id);

-- notes_bookmarks
create table if not exists public.notes_bookmarks (
  id bigserial primary key,
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (note_id, user_id)
);
alter table public.notes_bookmarks enable row level security;
create policy "Authenticated can read bookmarks" on public.notes_bookmarks for select using (auth.role() = 'authenticated');
create policy "Users can bookmark (insert) for themselves" on public.notes_bookmarks
  for insert with check (auth.uid() = user_id);
create policy "Users can remove their bookmarks" on public.notes_bookmarks
  for delete using (auth.uid() = user_id);

Storage policies (notes bucket) to be applied:
- Create bucket `notes` if missing.
- Policies:
  - Public read (optional; if you want unauthenticated previews):
    (bucket_id = 'notes') AND (request.method = 'GET')
  - Authenticated users can upload/list their own prefix:
    path like 'pdfs/' || auth.uid() || '/%' OR 'thumbs/' || auth.uid() || '/%'

Authentication Redirects:
- Set Authentication > URL Configuration in Supabase:
  - Site URL: your production domain (or localhost in dev)
  - Redirect URLs allowlist:
    * http://localhost:3000/**
    * https://yourapp.com/**
- Frontend uses REACT_APP_SITE_URL via a helper to set redirectTo/emailRedirectTo.

Once environment variables are provided, the automated step will:
1) Inspect existing tables.
2) Create any missing tables.
3) Apply RLS policies and indices.
4) Confirm storage bucket and policies.
5) Update this file with the final results (timestamps and execution status).
