import React from 'react';
import { formatDistanceToNow } from 'date-fns';

/**
 * PUBLIC_INTERFACE
 * NoteCard displays a note preview with title, subject/level, stats, and actions.
 *
 * Props:
 * - note: {
 *     id, title, description, subject, level, created_at,
 *     likes, bookmarks, downloads, preview_url (optional)
 *   }
 * - onOpen?: (note) => void   open/preview handler
 * - onLike?: (note) => void
 * - onBookmark?: (note) => void
 * - onDownload?: (note) => void
 */
export default function NoteCard({ note, onOpen, onLike, onBookmark, onDownload }) {
  const createdAt = note?.created_at ? new Date(note.created_at) : null;

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Thumbnail / placeholder */}
      <div
        onClick={() => onOpen?.(note)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen?.(note)}
        style={{
          width: '100%',
          height: 160,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(249,250,251,1))',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
        aria-label={`Open preview for ${note?.title ?? 'note'}`}
      >
        <span className="text-muted">{note?.preview_url ? 'Preview' : 'PDF'}</span>
      </div>

      <div>
        <h3 style={{ marginBottom: 4 }}>{note?.title || 'Untitled'}</h3>
        <div className="text-muted" style={{ fontSize: 14 }}>
          {note?.subject || 'General'} • {note?.level || 'All levels'}
          {createdAt ? ` • ${formatDistanceToNow(createdAt, { addSuffix: true })}` : ''}
        </div>
        {note?.description && (
          <p className="text-muted" style={{ marginTop: 6, fontSize: 14 }}>
            {note.description.length > 140 ? `${note.description.slice(0, 140)}…` : note.description}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="text-muted" title="Likes">👍 {note?.likes ?? 0}</span>
        <span className="text-muted" title="Bookmarks">🔖 {note?.bookmarks ?? 0}</span>
        <span className="text-muted" title="Downloads">⬇️ {note?.downloads ?? 0}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <button className="btn" onClick={() => onOpen?.(note)} aria-label="Open preview">
          Open
        </button>
        <button className="btn ghost" onClick={() => onDownload?.(note)} aria-label="Download">
          Download
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
          <button className="btn ghost" onClick={() => onLike?.(note)} aria-label="Like">
            👍
          </button>
          <button className="btn ghost" onClick={() => onBookmark?.(note)} aria-label="Bookmark">
            🔖
          </button>
        </div>
      </div>
    </article>
  );
}
