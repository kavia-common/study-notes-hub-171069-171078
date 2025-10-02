import React, { useMemo, useState } from 'react';
import NotesGrid from '../components/NotesGrid.jsx';
import { useNotes } from '../hooks/useNotes.js';
import SearchBar from '../components/SearchBar.jsx';
import FiltersBar from '../components/FiltersBar.jsx';

/**
 * PUBLIC_INTERFACE
 * Dashboard page with search, filters, and two sections:
 * - Trending (sortBy: 'trending', small page)
 * - Recent (sortBy: 'newest', larger page)
 */
export default function Dashboard() {
  const [query, setQuery] = useState({
    search: '',
    subject: '',
    level: '',
    sortBy: 'trending',
  });

  const trendingOpts = { ...query, sortBy: 'trending', limit: 6, page: 1 };
  const recentOpts = { ...query, sortBy: 'newest', limit: 9, page: 1 };

  const trending = useNotes(trendingOpts);
  const recent = useNotes(recentOpts);

  const subjects = useMemo(
    () => ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History'],
    []
  );
  const levels = useMemo(() => ['Middle School', 'High School', 'Undergraduate', 'Graduate'], []);

  function handleFilterChange(next) {
    setQuery((q) => ({ ...q, ...next }));
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <SearchBar
        defaultValue={query.search}
        onSearch={(s) => setQuery((q) => ({ ...q, search: s }))}
      />
      <FiltersBar
        subject={query.subject}
        level={query.level}
        sortBy={query.sortBy}
        subjects={subjects}
        levels={levels}
        onChange={handleFilterChange}
      />

      <section>
        <header style={{ marginBottom: '0.5rem' }}>
          <h2>Trending</h2>
          <p className="text-muted" style={{ margin: 0 }}>
            Notes gaining traction recently.
          </p>
        </header>
        <NotesGrid
          notes={trending.notes}
          loading={trending.loading}
          error={trending.error}
        />
      </section>

      <section>
        <header style={{ marginBottom: '0.5rem' }}>
          <h2>Recent</h2>
          <p className="text-muted" style={{ margin: 0 }}>
            Newly uploaded notes across all subjects.
          </p>
        </header>
        <NotesGrid
          notes={recent.notes}
          loading={recent.loading}
          error={recent.error}
        />
      </section>
    </div>
  );
}
