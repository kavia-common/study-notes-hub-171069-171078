import React, { useCallback, useEffect, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PUBLIC_INTERFACE
 * BookmarkButton toggles a bookmark for a given note by the current user.
 *
 * Props:
 * - noteId: string (required)
 * - initialCount?: number
 * - onCountChange?: (newCount: number, bookmarked: boolean) => void
 * - size?: 'sm' | 'md' (default 'md')
 * - className?: string
 *
 * Uses Supabase tables:
 * - notes_bookmarks (note_id, user_id) for per-user bookmarks
 * - notes (bookmarks int) for aggregate count
 */
export default function BookmarkButton({
  noteId,
  initialCount = 0,
  onCountChange,
  size = 'md',
  className = '',
}) {
  const supabase = getSupabaseClient();
  const { user } = useAuth();

  const [bookmarked, setBookmarked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const label = bookmarked ? 'Remove bookmark' : 'Bookmark';

  const styles = useMemo(() => {
    const height = size === 'sm' ? 34 : 40;
    return {
      button: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height,
        padding: '0 0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition), background var(--transition), border var(--transition)',
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.8 : 1,
      },
      icon: {
        filter: bookmarked ? 'saturate(130%)' : 'none',
      },
      count: {
        color: 'var(--color-text-muted)',
        fontSize: size === 'sm' ? 13 : 14,
      },
      active: bookmarked
        ? {
            background: 'rgba(245,158,11,0.10)',
            border: '1px solid var(--color-secondary)',
          }
        : {},
    };
  }, [bookmarked, busy, size]);

  useEffect(() => {
    let ignore = false;
    async function fetchBookmarked() {
      setError('');
      try {
        if (!user?.id || !noteId) {
          setBookmarked(false);
          return;
        }
        const { data, error: qErr } = await supabase
          .from('notes_bookmarks')
          .select('id')
          .eq('note_id', noteId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (qErr && qErr.code !== 'PGRST116') throw qErr;
        if (!ignore) setBookmarked(Boolean(data?.id));
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to check bookmark status.');
      }
    }
    fetchBookmarked();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, user?.id]);

  const persistBookmark = useCallback(async (nextBookmarked) => {
    if (!user?.id) throw new Error('Please sign in to bookmark notes.');
    if (!noteId) throw new Error('Missing note id.');

    if (nextBookmarked) {
      const { error: insErr } = await supabase
        .from('notes_bookmarks')
        .insert({ note_id: noteId, user_id: user.id });
      if (insErr && insErr.code !== '23505') { // ignore unique violation
        throw insErr;
      }
      const { error: upErr } = await supabase
        .from('notes')
        .update({ bookmarks: count + 1 })
        .eq('id', noteId);
      if (upErr) throw upErr;
    } else {
      const { error: delErr } = await supabase
        .from('notes_bookmarks')
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', user.id);
      if (delErr) throw delErr;
      const next = Math.max(0, count - 1);
      const { error: upErr } = await supabase
        .from('notes')
        .update({ bookmarks: next })
        .eq('id', noteId);
      if (upErr) throw upErr;
    }
  }, [supabase, noteId, user?.id, count]);

  // PUBLIC_INTERFACE
  async function onToggle() {
    if (busy) return;
    setBusy(true);
    setError('');

    const nextBookmarked = !bookmarked;
    const prevBookmarked = bookmarked;
    const prevCount = count;
    const nextCount = nextBookmarked ? count + 1 : Math.max(0, count - 1);

    setBookmarked(nextBookmarked);
    setCount(nextCount);
    onCountChange?.(nextCount, nextBookmarked);

    try {
      await persistBookmark(nextBookmarked);
    } catch (e) {
      setBookmarked(prevBookmarked);
      setCount(prevCount);
      onCountChange?.(prevCount, prevBookmarked);
      setError(e?.message || 'Failed to update bookmark.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <button
        type="button"
        className={`btn ghost ${className || ''}`}
        onClick={onToggle}
        disabled={busy}
        aria-pressed={bookmarked}
        aria-label={label}
        title={label}
        style={{ ...styles.button, ...styles.active }}
      >
        <span aria-hidden style={styles.icon}>{bookmarked ? '🔖' : '🔖'}</span>
        <span>{label}</span>
        <span style={styles.count}>({count})</span>
      </button>
      {error ? (
        <span role="alert" className="text-muted" style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 4 }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
