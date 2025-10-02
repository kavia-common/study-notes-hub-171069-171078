import React from 'react';

/**
 * PUBLIC_INTERFACE
 * FiltersBar renders dropdowns for subject, level, and sort order.
 *
 * Props:
 * - subject: string
 * - level: string
 * - sortBy: 'newest'|'popular'|'trending'|'title'
 * - subjects: string[]   options for subjects
 * - levels: string[]     options for levels
 * - onChange: ({ subject, level, sortBy }) => void
 */
export default function FiltersBar({
  subject = '',
  level = '',
  sortBy = 'newest',
  subjects = [],
  levels = [],
  onChange,
}) {
  function handleChange(key, value) {
    onChange?.({ subject, level, sortBy, [key]: value });
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '0.75rem',
      }}
      aria-label="Filters"
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="text-muted" style={{ minWidth: 64 }}>Subject</span>
        <select
          value={subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          style={{
            height: 40,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            padding: '0 0.5rem',
          }}
          aria-label="Filter by subject"
        >
          <option value="">All</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="text-muted" style={{ minWidth: 64 }}>Level</span>
        <select
          value={level}
          onChange={(e) => handleChange('level', e.target.value)}
          style={{
            height: 40,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            padding: '0 0.5rem',
          }}
          aria-label="Filter by level"
        >
          <option value="">All</option>
          {levels.map((lv) => (
            <option key={lv} value={lv}>{lv}</option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="text-muted" style={{ minWidth: 64 }}>Sort</span>
        <select
          value={sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          style={{
            height: 40,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            padding: '0 0.5rem',
          }}
          aria-label="Sort notes"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="trending">Trending</option>
          <option value="title">Title (A–Z)</option>
        </select>
      </label>
    </div>
  );
}
