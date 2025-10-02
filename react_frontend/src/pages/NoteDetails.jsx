import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import getSupabaseClient from '../lib/supabaseClient';
import PdfPreview from '../components/PdfPreview.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LikeButton from '../components/LikeButton.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';
import UserAvatar from '../components/UserAvatar.jsx';
import LoadingState from '../components/State/LoadingState.jsx';
import ErrorState from '../components/State/ErrorState.jsx';

/**
 * PUBLIC_INTERFACE
 * NoteDetails page shows a detailed view of a single note:
 * - Title, metadata (subject, level, size, uploaded at), tags
 * - Actions: like, bookmark, download
 * - PDF preview using a signed Supabase Storage URL
 *
 * Routing:
 * - Path: /notes/:id
 *
 * Behavior:
 * - Fetches the note by id from 'notes' table
 * - Uses PdfPreview to render a view of the PDF
 * - onDownload creates a signed URL and triggers browser download, also increments downloads counter
 * - onLike / onBookmark increment counters (requires auth to attribute user; if unauth, allows optimistic but could be configured to prevent in RLS)
 */
export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const supabase = getSupabaseClient();
  const { user, loading: authLoading } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [likeBusy, setLikeBusy] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);

  const createdAt = useMemo(
    () => (note?.created_at ? new Date(note.created_at) : null),
    [note?.created_at]
  );

  const sizeReadable = useMemo(() => {
    const bytes = Number(note?.size_bytes || 0);
    if (!bytes) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const val = bytes / Math.pow(1024, i);
    return `${val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)} ${sizes[i]}`;
  }, [note?.size_bytes]);

  const tagsArray = useMemo(() => {
    const raw = note?.tags || '';
    return String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [note?.tags]);

  const fetchNote = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
      if (error) throw error;
      setNote(data);
    } catch (e) {
      setErr(e?.message || 'Failed to load note.');
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, id]);

  useEffect(() => {
    if (!id) {
      navigate('/browse', { replace: true });
      return;
    }
    fetchNote();
  }, [id, fetchNote, navigate]);

  async function safeUpdateCounts(patch) {
    // Patch local first (optimistic), then persist
    setNote((n) => (n ? { ...n, ...patch } : n));
    const { error } = await supabase
      .from('notes')
      .update(patch)
      .eq('id', id);
    if (error) {
      // Revert on error by refetching
      await fetchNote();
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  async function handleLike() {
    if (!note || likeBusy) return;
    setLikeBusy(true);
    try {
      const newLikes = Number(note.likes || 0) + 1;
      await safeUpdateCounts({ likes: newLikes });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Like failed:', e);
    } finally {
      setLikeBusy(false);
    }
  }

  // PUBLIC_INTERFACE
  async function handleBookmark() {
    if (!note || bookmarkBusy) return;
    setBookmarkBusy(true);
    try {
      const newBookmarks = Number(note.bookmarks || 0) + 1;
      await safeUpdateCounts({ bookmarks: newBookmarks });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Bookmark failed:', e);
    } finally {
      setBookmarkBusy(false);
    }
  }

  // PUBLIC_INTERFACE
  async function handleDownload() {
    if (!note || downloadBusy) return;
    setDownloadBusy(true);

    try {
      // Increment download count optimistically
      const newDownloads = Number(note.downloads || 0) + 1;
      await safeUpdateCounts({ downloads: newDownloads });

      // Generate a fresh signed URL for downloading
      const { data, error } = await supabase.storage
        .from('notes')
        .createSignedUrl(note.pdf_path, 300, {
          download: true,
        });
      if (error) throw error;

      // Trigger browser download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = note.title ? `${note.title}.pdf` : 'note.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Download failed:', e);
    } finally {
      setDownloadBusy(false);
    }
  }

  if (loading || authLoading) {
    return <LoadingState title="Loading note…" description="Fetching details from the cloud." />;
  }

  if (err) {
    return (
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <ErrorState title="Unable to load note" message={err} />
        <div>
          <Link className="btn ghost" to="/browse">Back to Browse</Link>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="card">
        <strong>Note not found</strong>
        <p className="text-muted" style={{ marginTop: 6 }}>
          The note you are looking for does not exist or is no longer available.
        </p>
        <div style={{ marginTop: 8 }}>
          <Link className="btn ghost" to="/browse">Back to Browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Header and actions */}
      <div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', flexWrap: 'wrap' }}>
          {note?.user_id ? <UserAvatar userId={note.user_id} size={44} /> : null}
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ marginBottom: 4 }}>{note.title || 'Untitled'}</h1>
            <div className="text-muted" style={{ fontSize: 14 }}>
              {note.subject || 'General'} • {note.level || 'All levels'}
              {createdAt ? ` • ${formatDistanceToNow(createdAt, { addSuffix: true })}` : ''}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleDownload} disabled={downloadBusy} aria-busy={downloadBusy}>
              ⬇️ Download
            </button>
            <LikeButton
              noteId={note.id}
              initialCount={Number(note.likes || 0)}
              onCountChange={(c) => setNote((n) => (n ? { ...n, likes: c } : n))}
            />
            <BookmarkButton
              noteId={note.id}
              initialCount={Number(note.bookmarks || 0)}
              onCountChange={(c) => setNote((n) => (n ? { ...n, bookmarks: c } : n))}
            />
          </div>
        </div>

        {note.description && (
          <p className="text-muted" style={{ marginTop: 6 }}>
            {note.description}
          </p>
        )}

        <div className="text-muted" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: 13 }}>
          <span title="File size">Size: {sizeReadable}</span>
          <span title="MIME type">Type: {note.mime_type || 'application/pdf'}</span>
          <span title="Statistics">👍 {note.likes ?? 0} • 🔖 {note.bookmarks ?? 0} • ⬇️ {note.downloads ?? 0}</span>
        </div>

        {tagsArray.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 2 }}>
            {tagsArray.map((t) => (
              <span
                key={t}
                className="surface"
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 12,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '0.75rem 0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-muted">Preview</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Secure link generated via signed URL (expires shortly)
          </div>
        </div>
        <div style={{ padding: '0.75rem' }}>
          <PdfPreview
            bucket="notes"
            path={note.pdf_path}
            fileName={note.title ? `${note.title}.pdf` : 'note.pdf'}
            signedSeconds={600}
            height={720}
          />
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <Link className="btn ghost" to="/browse">← Back to Browse</Link>
        <div className="text-muted" style={{ fontSize: 13 }}>
          Owner: {note.user_id ? note.user_id : 'unknown'}
        </div>
      </div>
    </div>
  );
}
