import { useCallback, useEffect, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PUBLIC_INTERFACE
 * useProfile fetches current user's profile data and related collections (uploads, bookmarks, likes).
 *
 * Returns:
 * {
 *   user, profile, stats: { uploads, bookmarks, likes },
 *   uploads: { items, loading, error, refetch },
 *   bookmarks: { items, loading, error, refetch },
 *   likes: { items, loading, error, refetch },
 *   loading, error, refetchAll
 * }
 *
 * Notes schema expected:
 * - notes table with columns: id, title, subject, level, created_at, likes, bookmarks, downloads, user_id, pdf_path, thumb_path
 * - profiles table with: id, full_name, avatar_url, email (optional)
 * - notes_bookmarks table: id, note_id, user_id
 * - notes_likes table: id, note_id, user_id
 */
export default function useProfile({ pageSize = 12 } = {}) {
  const supabase = getSupabaseClient();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ uploads: 0, bookmarks: 0, likes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // collections
  const [uploads, setUploads] = useState({ items: [], loading: false, error: '' });
  const [bookmarks, setBookmarks] = useState({ items: [], loading: false, error: '' });
  const [likes, setLikes] = useState({ items: [], loading: false, error: '' });

  const userId = user?.id || null;

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error: qErr } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .eq('id', userId)
      .maybeSingle();
    if (qErr && qErr.code !== 'PGRST116') throw qErr;
    setProfile(data || { id: userId, full_name: '', avatar_url: '', email: user?.email || '' });
  }, [supabase, userId, user?.email]);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats({ uploads: 0, bookmarks: 0, likes: 0 });
      return;
    }
    // uploads count
    const { count: uploadsCount, error: uErr } = await supabase
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (uErr) throw uErr;

    // bookmarks count
    const { count: bmCount, error: bErr } = await supabase
      .from('notes_bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (bErr) throw bErr;

    // likes count
    const { count: lkCount, error: lErr } = await supabase
      .from('notes_likes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (lErr) throw lErr;

    setStats({
      uploads: uploadsCount || 0,
      bookmarks: bmCount || 0,
      likes: lkCount || 0,
    });
  }, [supabase, userId]);

  const fetchUploads = useCallback(async () => {
    if (!userId) {
      setUploads({ items: [], loading: false, error: '' });
      return;
    }
    setUploads((s) => ({ ...s, loading: true, error: '' }));
    try {
      const { data, error: qErr } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(pageSize);
      if (qErr) throw qErr;
      setUploads({ items: data || [], loading: false, error: '' });
    } catch (e) {
      setUploads({ items: [], loading: false, error: e?.message || 'Failed to load uploads.' });
    }
  }, [supabase, userId, pageSize]);

  const fetchBookmarks = useCallback(async () => {
    if (!userId) {
      setBookmarks({ items: [], loading: false, error: '' });
      return;
    }
    setBookmarks((s) => ({ ...s, loading: true, error: '' }));
    try {
      // first get bookmarked note ids
      const { data: joins, error: jErr } = await supabase
        .from('notes_bookmarks')
        .select('note_id')
        .eq('user_id', userId)
        .limit(pageSize);
      if (jErr) throw jErr;

      const ids = (joins || []).map((j) => j.note_id).filter(Boolean);
      if (!ids.length) {
        setBookmarks({ items: [], loading: false, error: '' });
        return;
      }
      const { data: notes, error: nErr } = await supabase
        .from('notes')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });
      if (nErr) throw nErr;
      setBookmarks({ items: notes || [], loading: false, error: '' });
    } catch (e) {
      setBookmarks({ items: [], loading: false, error: e?.message || 'Failed to load bookmarks.' });
    }
  }, [supabase, userId, pageSize]);

  const fetchLikes = useCallback(async () => {
    if (!userId) {
      setLikes({ items: [], loading: false, error: '' });
      return;
    }
    setLikes((s) => ({ ...s, loading: true, error: '' }));
    try {
      const { data: joins, error: jErr } = await supabase
        .from('notes_likes')
        .select('note_id')
        .eq('user_id', userId)
        .limit(pageSize);
      if (jErr) throw jErr;

      const ids = (joins || []).map((j) => j.note_id).filter(Boolean);
      if (!ids.length) {
        setLikes({ items: [], loading: false, error: '' });
        return;
      }
      const { data: notes, error: nErr } = await supabase
        .from('notes')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });
      if (nErr) throw nErr;

      setLikes({ items: notes || [], loading: false, error: '' });
    } catch (e) {
      setLikes({ items: [], loading: false, error: e?.message || 'Failed to load likes.' });
    }
  }, [supabase, userId, pageSize]);

  const refetchAll = useCallback(async () => {
    setError('');
    try {
      await Promise.all([fetchProfile(), fetchStats(), fetchUploads(), fetchBookmarks(), fetchLikes()]);
    } catch (e) {
      setError(e?.message || 'Failed to load profile.');
    }
  }, [fetchProfile, fetchStats, fetchUploads, fetchBookmarks, fetchLikes]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (authLoading) return;
      setLoading(true);
      setError('');
      try {
        await refetchAll();
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, [authLoading, refetchAll]);

  return useMemo(() => ({
    user,
    profile,
    stats,
    uploads: { ...uploads, refetch: fetchUploads },
    bookmarks: { ...bookmarks, refetch: fetchBookmarks },
    likes: { ...likes, refetch: fetchLikes },
    loading,
    error,
    refetchAll,
  }), [user, profile, stats, uploads, bookmarks, likes, loading, error, fetchUploads, fetchBookmarks, fetchLikes, refetchAll]);
}
