# Supabase Integration (Frontend)

This project uses Supabase for:
- Authentication (email/password)
- Database (Postgres) via Supabase APIs
- Storage (PDFs and thumbnails)

Environment variables (set in .env at project root):
- REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co
- REACT_APP_SUPABASE_ANON_KEY=<anon-key>
- REACT_APP_SITE_URL=<your-site-url> (optional, used for email redirect flows)

Buckets:
- notes: used to store uploaded PDFs and optional thumbnails
  - PDFs are stored under `pdfs/<user_id>/<timestamp>-<filename>`
  - Thumbnails are stored under `thumbs/<user_id>/<timestamp>-<filename>`

Database:
- Table: notes
  - Columns commonly used by the frontend:
    - id (uuid)
    - title (text)
    - description (text)
    - subject (text)
    - level (text)
    - tags (text) — comma-separated list
    - pdf_path (text) — storage path within the 'notes' bucket
    - thumb_path (text, nullable) — optional storage path within the 'notes' bucket
    - user_id (uuid) — owner (references auth.users.id)
    - size_bytes (int)
    - mime_type (text)
    - likes (int, default 0)
    - bookmarks (int, default 0)
    - downloads (int, default 0)
    - created_at (timestamp with time zone, default now)

Upload Flow:
1. User must be authenticated.
2. PDF is uploaded to Supabase Storage (bucket: notes).
3. Optional thumbnail is uploaded.
4. A row is inserted into the `notes` table with metadata and the storage path(s).

Security:
- Ensure Row Level Security (RLS) is configured on the `notes` table so that:
  - Authenticated users can insert their own notes.
  - Public read access can be allowed for browsing (or gate by auth if desired).
- Configure Storage policies on the `notes` bucket to allow:
  - Authenticated users to upload to `pdfs/<user_id>/...` and `thumbs/<user_id>/...`
  - Public read/list if you want notes to be previewable without auth (optional).

Notes:
- For sign-up flows requiring email redirects, set REACT_APP_SITE_URL to your public site URL. The code uses it to set `emailRedirectTo` during sign-up.
