import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from './LikeButton.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import UserAvatar from './UserAvatar.jsx';

/**
 * PUBLIC_INTERFACE
 * NoteCard displays a note preview with title, subject/level, stats, and actions.
 *
 * Props:
 * - note: {
 *     id, title, description, subject, level, created_at,
 *     likes, bookmarks, downloads, preview_url (optional), user_id
 *   }
 * - onOpen?: (note) => void   open/preview handler
 * - onDownload?: (note) => void
 */
export default function NoteCard({ note, onOpen, onDownload }) {
  const createdAt = note?.created_at ? new Date(note.created_at) : null;

  // local counts to reflect optimistic updates from buttons
  const [likes, setLikes] = useState(Number(note?.likes || 0));
  const [bookmarks, setBookmarks] = useState(Number(note?.bookmarks || 0));

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {note?.user_id ? <UserAvatar userId={note.user_id} size={36} /> : null}
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 2 }}>{note?.title || 'Untitled'}</h3>
          <div className="text-muted" style={{ fontSize: 13 }}>
            {note?.subject || 'General'} • {note?.level || 'All levels'}
            {createdAt ? ` • ${formatDistanceToNow(createdAt, { addSuffix: true })}` : ''}
          </div>
        </div>
      </div>

      {note?.description && (
        <p className="text-muted" style={{ marginTop: 2, fontSize: 14 }}>
          {note.description.length > 140 ? `${note.description.slice(0, 140)}…` : note.description}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="text-muted" title="Likes">👍 {likes}</span>
        <span className="text-muted" title="Bookmarks">🔖 {bookmarks}</span>
        <span className="text-muted" title="Downloads">⬇️ {note?.downloads ?? 0}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignItems: 'center' }}>
        <button className="btn" onClick={() => onOpen?.(note)} aria-label="Open preview">
          Open
        </button>
        <button className="btn ghost" onClick={() => onDownload?.(note)} aria-label="Download">
          Download
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
          <LikeButton
            noteId={note?.id}
            initialCount={Number(note?.likes || 0)}
            onCountChange={(c) => setLikes(c)}
            size="sm"
          />
          <BookmarkButton
            noteId={note?.id}
            initialCount={Number(note?.bookmarks || 0)}
            onCountChange={(c) => setBookmarks(c)}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}
