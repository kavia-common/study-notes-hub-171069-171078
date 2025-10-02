# Study Notes Hub — React Frontend

This frontend is a modern React application that connects to Supabase for authentication, database, and storage. It follows the Ocean Professional theme (blue primary and amber accents) and provides a clean, responsive experience for browsing, uploading, previewing, liking, bookmarking, and downloading study notes.

## Feature Overview

- Authentication with Supabase (email/password)
- Upload PDF notes with metadata, optional thumbnail, and size/type tracking
- Browse and search notes with filters and sorting (newest, popular, trending, title)
- Like and bookmark notes with per-user joins and aggregate counters
- Preview PDFs via short-lived signed URLs
- User profiles with avatars and stats (uploads, bookmarks, likes)
- Responsive grid layouts with accessible, reusable UI primitives

## Environment Variables

Create a `.env` file at the project root (same folder as `package.json`) and define:

- REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co
- REACT_APP_SUPABASE_ANON_KEY=<anon-key>
- REACT_APP_SITE_URL=http://localhost:3000 (or your production URL)
- REACT_APP_STORAGE_BUCKET=notes (optional; defaults used across codebase assume “notes”)

Notes:
- The app will fail early if REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY are missing (see src/lib/supabaseClient.js).
- REACT_APP_SITE_URL is used to build redirect URLs for auth flows; we normalize trailing slashes in src/utils/getURL.js.

## Supabase Setup (Schema, RLS, Storage)

Follow the full backend configuration plan in:
- react_frontend/assets/supabase.md

That file includes:
- Required tables: profiles, notes, notes_likes, notes_bookmarks
- Recommended indexes and constraints
- RLS policies for rows to be owner-managed, and public reads for notes (optional)
- Storage bucket: notes with prefix-based write policies for each user
- Authentication redirect configuration

Once the environment variables are present, our automated Supabase setup will:
1) Inspect existing tables.
2) Create any missing tables.
3) Apply RLS policies and indices.
4) Confirm/create storage buckets and policies.
5) Update assets/supabase.md with the execution results.

## Ocean Professional Theme and Styling

The application implements the Ocean Professional theme:
- Primary: #2563EB (Blue 600), secondary/success: #F59E0B (Amber), error: #EF4444 (Red)
- Smooth transitions, subtle gradients, rounded corners, light shadows

Key style files:
- src/styles/theme.css — design tokens and theme variables, including dark mode hook
- src/styles/components.css — component primitives (buttons, inputs, modal, tags, badges, spinner)
- src/index.css — global imports and base resets
- src/App.css — app shell treatments using the theme

The ThemeProvider (src/context/ThemeContext.jsx) sets data-theme on body to support light/dark theming.

## Developer Setup and Running

1) Prerequisites
- Node.js 18+ recommended
- A Supabase project with the tables and storage buckets described above

2) Install dependencies
- npm install

3) Environment configuration
- Create .env in the project root:
  REACT_APP_SUPABASE_URL=https://<your-project-ref>.supabase.co
  REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
  REACT_APP_SITE_URL=http://localhost:3000
  REACT_APP_STORAGE_BUCKET=notes

4) Start the development server
- npm start
- Open http://localhost:3000

5) Run tests
- npm test

6) Production build
- npm run build

If you see a configuration error about Supabase, ensure your .env variables are loaded and that the values are correct.

## Where Things Live (Pointers)

- Supabase client: src/lib/supabaseClient.js (reads env and creates a singleton client)
- Auth utils: src/utils/getURL.js and src/utils/auth.js
- Auth callback page: src/pages/AuthCallback.jsx (mount it at /auth/callback in your router)
- Auth flows and context: src/context/AuthContext.jsx and src/components/AuthForm.jsx
- Upload flow: src/hooks/useUploadNote.js and page src/pages/Upload.jsx
- Notes browsing: src/hooks/useNotes.js, src/utils/queryHelpers.js, src/pages/Browse.jsx, src/components/NotesGrid.jsx
- Likes and bookmarks: src/components/LikeButton.jsx, src/components/BookmarkButton.jsx (persist to notes_likes and notes_bookmarks, aggregate counters in notes)
- PDF preview: src/components/PdfPreview.jsx (generates signed URL)
- Profiles and avatars: src/hooks/useProfile.js, src/components/UserAvatar.jsx, src/pages/ProfilePage.jsx

## Minimal Schema Hints

Below are example SQL hints to guide setup. Adjust types/indexes to your needs.

- Ensure unique constraint on notes_likes(note_id, user_id) and notes_bookmarks(note_id, user_id).
- Ensure RLS policies for notes to allow:
  - insert: auth.uid() = new.user_id
  - select: true (or restrict to authenticated users as required)
  - update: auth.uid() = user_id
- Storage policies for “notes” (and optionally “avatars”) should allow users to write only within their own prefixes and control read access.

## Supabase Dashboard Configuration (Auth Redirects)

- Authentication > URL Configuration
  - Site URL: your production domain (or http://localhost:3000 in dev)
  - Redirect URLs allowlist:
    * http://localhost:3000/**
    * https://yourapp.com/**

Ensure that your email templates (optional) use SiteURL/RedirectTo variables accordingly.

## Troubleshooting

- Missing env vars: The app will throw during initialization in src/lib/supabaseClient.js. Double-check .env keys and restart the dev server.
- CORS/redirects on signup email flows: Set REACT_APP_SITE_URL to your public site URL (or http://localhost:3000 in dev) to build proper emailRedirectTo values.
- 401/403 from Supabase: Verify RLS and Storage policies match the behaviors outlined above.
