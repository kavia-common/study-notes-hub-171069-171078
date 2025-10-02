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
- REACT_APP_STORAGE_BUCKET=notes
- REACT_APP_SITE_URL=<your-site-url> (optional; used for email redirect flows during signup)

Notes:
- The app will fail early if REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY are missing (see src/lib/supabaseClient.js).
- REACT_APP_STORAGE_BUCKET defaults to the “notes” bucket across the codebase; keep it consistent with your Supabase Storage configuration.

## Supabase Schema and Storage Expectations

The frontend expects the following database tables and storage buckets. Column types are representative; use appropriate SQL types in your project.

### Tables

1) notes
- id (uuid, primary key, default gen_random_uuid())
- title (text, required)
- description (text)
- subject (text)
- level (text)
- tags (text) — comma-separated list stored as text
- pdf_path (text, required) — path inside the storage bucket (e.g., pdfs/<user_id>/<timestamp>-file.pdf)
- thumb_path (text, nullable) — optional path inside the storage bucket (e.g., thumbs/<user_id>/<timestamp>-thumb.png)
- user_id (uuid, required) — references auth.users.id
- size_bytes (int)
- mime_type (text)
- likes (int, default 0)
- bookmarks (int, default 0)
- downloads (int, default 0)
- created_at (timestamptz, default now())

2) profiles
- id (uuid, primary key, references auth.users.id)
- full_name (text, nullable)
- avatar_url (text, nullable) — may be a public URL or a storage path
- email (text, nullable)

3) notes_likes
- id (bigint or uuid, primary key)
- note_id (uuid, references notes.id)
- user_id (uuid, references auth.users.id)
- unique index on (note_id, user_id)

4) notes_bookmarks
- id (bigint or uuid, primary key)
- note_id (uuid, references notes.id)
- user_id (uuid, references auth.users.id)
- unique index on (note_id, user_id)

Row Level Security (RLS) should be configured to:
- Allow authenticated users to insert their own notes and read public notes
- Allow per-user visibility on likes and bookmarks (users can insert/delete their own rows)
- Optionally allow public read access for browsing

### Storage

Primary bucket:
- notes — used to store uploaded PDFs and optional thumbnails
  - PDFs under: pdfs/<user_id>/<timestamp>-<filename>
  - Thumbnails under: thumbs/<user_id>/<timestamp>-<filename>

Optional bucket used by UserAvatar (if you store avatars in storage rather than a public URL):
- avatars — if profiles.avatar_url is a storage path, the app will attempt to create a signed URL from this bucket

You must add appropriate Storage policies to:
- Allow authenticated users to upload into their own folder prefixes (pdfs/<user_id>/..., thumbs/<user_id>/...)
- Allow read/list access according to your product requirements (public or authenticated)

See also: react_frontend/assets/supabase.md for additional frontend-specific integration notes.

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
  REACT_App_SUPABASE_ANON_KEY=<your-anon-key>
  REACT_APP_STORAGE_BUCKET=notes
  REACT_APP_SITE_URL=http://localhost:3000

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
- Storage policies for “notes” and optionally “avatars” should allow users to write only within their own prefixes and control read access.

## Troubleshooting

- Missing env vars: The app will throw during initialization in src/lib/supabaseClient.js. Double-check .env keys and restart the dev server.
- CORS/redirects on signup email flows: Set REACT_APP_SITE_URL to your public site URL (or http://localhost:3000 in dev) to build proper emailRedirectTo values.
- 401/403 from Supabase: Verify RLS and Storage policies match the behaviors outlined above.

