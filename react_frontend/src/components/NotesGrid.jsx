import React from 'react';
import NoteCard from './NoteCard.jsx';
import LoadingState from './State/LoadingState.jsx';
import ErrorState from './State/ErrorState.jsx';
import EmptyState from './State/EmptyState.jsx';

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
  onRetry, // optional refetch callback for ErrorState retry
}) {
  if (loading) {
    return (
      <LoadingState title="Loading notes…" description="Fetching notes from the cloud." />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load notes"
        message={error}
        onRetry={onRetry}
        actionLabel={onRetry ? 'Retry' : undefined}
      />
    );
  }

  if (!notes.length) {
    return (
      <EmptyState
        title="No notes found"
        message="Try adjusting your search or filters."
        icon="📄"
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      }}
      aria-label="Notes grid"
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
