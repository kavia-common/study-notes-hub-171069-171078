import React from 'react';
import NoteCard from './NoteCard.jsx';

/**
 * PUBLIC_INTERFACE
 * NotesGrid displays a responsive grid of NoteCard components.
 *
 * Props:
 * - notes: array
 * - loading: boolean
 * - error: string
 * - onOpen, onLike, onBookmark, onDownload: handlers passed to NoteCard
 */
export default function NotesGrid({
  notes = [],
  loading = false,
  error = '',
  onOpen,
  onLike,
  onBookmark,
  onDownload,
}) {
  if (loading) {
    return (
      <div className="card" role="status">
        <strong>Loading…</strong>
        <p className="text-muted">Fetching notes from the cloud.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" role="alert" style={{ borderColor: 'var(--color-error)' }}>
        <strong style={{ color: 'var(--color-error)' }}>Error:</strong>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div className="card" role="status">
        <strong>No notes found</strong>
        <p className="text-muted">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      }}
    >
      {notes.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onOpen={onOpen}
          onLike={onLike}
          onBookmark={onBookmark}
          onDownload={onDownload}
        />
      ))}

      {/* Responsive */}
      <style>{`
        @media (max-width: 1100px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 700px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
