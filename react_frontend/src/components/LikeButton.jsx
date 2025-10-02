import React, { useCallback, useEffect, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PUBLIC_INTERFACE
 * LikeButton toggles a like for a given note by the current user.
 *
 * Props:
 * - noteId: string (required) - the id of the note to like/unlike
 * - initialCount?: number - starting total likes count for optimistic UI
 * - onCountChange?: (newCount: number, liked: boolean) => void - callback when count changes
 * - size?: 'sm' | 'md' (default 'md')
 * - className?: string
 *
 * Behavior:
 * - Detects if the current user has liked the note by checking `notes_likes` table.
 * - Optimistically increments/decrements the likes count on toggle.
 * - Persists the like/unlike to Supabase:
 *    - Like: insert into 'notes_likes' (note_id, user_id), increment 'notes.likes'
 *    - Unlike: delete from 'notes_likes', decrement 'notes.likes' (clamped to >= 0)
 * - Accessible with aria-pressed and live updates.
 */
export default function LikeButton({
  noteId,
  initialCount = 0,
  onCountChange,
  size = 'md',
  className = '',
}) {
  const supabase = getSupabaseClient();
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const label = liked ? 'Unlike' : 'Like';

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
        filter: liked ? 'saturate(130%)' : 'none',
      },
      count: {
        color: 'var(--color-text-muted)',
        fontSize: size === 'sm' ? 13 : 14,
      },
      liked: liked
        ? {
            background: 'rgba(37,99,235,0.08)',
            border: '1px solid var(--color-primary-400)',
          }
        : {},
    };
  }, [liked, busy, size]);

  // Fetch whether the current user has liked this note
  useEffect(() => {
    let ignore = false;
    async function fetchLiked() {
      setError('');
      try {
        if (!user?.id || !noteId) {
          setLiked(false);
          return;
        }
        const { data, error: qErr } = await supabase
          .from('notes_likes')
          .select('id')
          .eq('note_id', noteId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (qErr && qErr.code !== 'PGRST116') throw qErr; // ignore "No rows" code if any
        if (!ignore) setLiked(Boolean(data?.id));
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to check like status.');
      }
    }
    fetchLiked();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, user?.id]);

  const persistLike = useCallback(async (nextLiked) => {
    if (!user?.id) throw new Error('Please sign in to like notes.');
    if (!noteId) throw new Error('Missing note id.');

    if (nextLiked) {
      // Like: insert join row and increment count on notes
      const { error: insErr } = await supabase
        .from('notes_likes')
        .insert({ note_id: noteId, user_id: user.id });
      if (insErr && insErr.code !== '23505') { // ignore unique violation if already exists
        throw insErr;
      }
      const { error: upErr } = await supabase
        .from('notes')
        .update({ likes: count + 1 })
        .eq('id', noteId);
      if (upErr) throw upErr;
    } else {
      // Unlike: delete join row and decrement count on notes
      const { error: delErr } = await supabase
        .from('notes_likes')
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', user.id);
      if (delErr) throw delErr;
      const next = Math.max(0, count - 1);
      const { error: upErr } = await supabase
        .from('notes')
        .update({ likes: next })
        .eq('id', noteId);
      if (upErr) throw upErr;
    }
  }, [supabase, noteId, user?.id, count]);

  // PUBLIC_INTERFACE
  async function onToggle() {
    if (busy) return;
    setBusy(true);
    setError('');

    // Optimistic update
    const nextLiked = !liked;
    const prevLiked = liked;
    const prevCount = count;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);

    setLiked(nextLiked);
    setCount(nextCount);
    onCountChange?.(nextCount, nextLiked);

    try {
      await persistLike(nextLiked);
    } catch (e) {
      // Revert on error
      setLiked(prevLiked);
      setCount(prevCount);
      onCountChange?.(prevCount, prevLiked);
      setError(e?.message || 'Failed to update like.');
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
        aria-pressed={liked}
        aria-label={label}
        title={label}
        style={{ ...styles.button, ...styles.liked }}
      >
        <span aria-hidden style={styles.icon}>{liked ? '👍' : '👍'}</span>
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
