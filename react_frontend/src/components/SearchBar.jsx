import React, { useEffect, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * SearchBar renders a search input with a clear button and debounced change.
 *
 * Props:
 * - defaultValue: string
 * - onSearch: (value: string) => void
 * - placeholder?: string
 * - debounceMs?: number (default 300)
 */
export default function SearchBar({
  defaultValue = '',
  onSearch,
  placeholder = 'Search notes by title, description, or tags…',
  debounceMs = 300,
}) {
  const [value, setValue] = useState(defaultValue);
  const timer = useRef(null);

  useEffect(() => {
    // Debounced onSearch
    if (!onSearch) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value), debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, debounceMs, onSearch]);

  function clear() {
    setValue('');
    onSearch?.('');
  }

  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}
      role="search"
      aria-label="Notes search"
    >
      <span aria-hidden>🔎</span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search notes"
        style={{
          flex: 1,
          height: 40,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '0 0.75rem',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          outline: 'none',
          boxShadow: 'var(--shadow-xs)',
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
        onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
      />
      {value && (
        <button className="btn ghost" onClick={clear} aria-label="Clear search">
          Clear
        </button>
      )}
    </div>
  );
}
