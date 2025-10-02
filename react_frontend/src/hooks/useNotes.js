import { useEffect, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';
import { buildNotesQuery, sortNotesByTrending } from '../utils/queryHelpers';

// PUBLIC_INTERFACE
export function useNotes(options = {}) {
  /**
   * PUBLIC_INTERFACE
   * useNotes fetches notes from Supabase with search, filter, sorting and pagination.
   *
   * Options:
   * - search: string
   * - subject: string
   * - level: string
   * - sortBy: 'newest' | 'popular' | 'trending' | 'title'
   * - limit: number (default 20)
   * - page: number (1-based)
   *
   * Returns:
   * { notes, loading, error, total, page, setPage, refetch }
   */
  const {
    search = '',
    subject = '',
    level = '',
    sortBy = 'newest',
    limit = 20,
    page: pageProp = 1,
  } = options;

  const supabase = getSupabaseClient();

  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(pageProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compute offset from page
  const offset = useMemo(() => {
    const p = Math.max(1, Number(page) || 1);
    return (p - 1) * limit;
  }, [page, limit]);

  async function fetchNotes() {
    setLoading(true);
    setError('');
    try {
      const qb = buildNotesQuery(supabase, {
        search,
        subject,
        level,
        sortBy,
        limit,
        offset,
      });

      const { data, error: qErr, count } = await qb;
      if (qErr) throw qErr;

      let items = data || [];

      // Apply trending sort on client if requested
      if (sortBy === 'trending' && Array.isArray(items)) {
        items = sortNotesByTrending(items.slice());
      }

      setNotes(items);
      setTotal(typeof count === 'number' ? count : items.length);
    } catch (e) {
      setError(e?.message || 'Failed to load notes.');
      setNotes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(pageProp);
  }, [pageProp]);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, subject, level, sortBy, limit, offset]);

  return {
    notes,
    loading,
    error,
    total,
    page,
    setPage,
    refetch: fetchNotes,
  };
}

export default useNotes;
