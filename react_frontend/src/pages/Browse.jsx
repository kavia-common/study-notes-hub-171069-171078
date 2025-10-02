import React, { useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import NotesGrid from '../components/NotesGrid.jsx';
import { useNotes } from '../hooks/useNotes.js';

/**
 * PUBLIC_INTERFACE
 * Browse page: Search, filter, and browse notes with a responsive grid.
 */
export default function Browse() {
  const [query, setQuery] = useState({
    search: '',
    subject: '',
    level: '',
    sortBy: 'newest',
  });

  const { notes, loading, error } = useNotes({
    search: query.search,
    subject: query.subject,
    level: query.level,
    sortBy: query.sortBy,
    limit: 24,
    page: 1,
  });

  const subjects = useMemo(
    () => ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History'],
    []
  );
  const levels = useMemo(() => ['Middle School', 'High School', 'Undergraduate', 'Graduate'], []);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div className="card">
        <h1>Browse Notes</h1>
        <p className="text-muted">Search and filter study notes here.</p>
      </div>

      <SearchBar defaultValue={query.search} onSearch={(v) => setQuery((q) => ({ ...q, search: v }))} />

      <FiltersBar
        subject={query.subject}
        level={query.level}
        sortBy={query.sortBy}
        subjects={subjects}
        levels={levels}
        onChange={(next) => setQuery((q) => ({ ...q, ...next }))}
      />

      <NotesGrid notes={notes} loading={loading} error={error} />
    </div>
  );
}
