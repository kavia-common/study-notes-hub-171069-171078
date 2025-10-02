import React, { useEffect, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * UserAvatar renders a user's profile image from Supabase profiles table, with initials fallback.
 *
 * Props:
 * - userId: string (required)
 * - size?: number (pixel size, default 40)
 * - className?: string
 * - rounded?: boolean (default true)
 * - showTooltip?: boolean (default true) - shows name/email as title attribute
 *
 * Database expectations (profiles table):
 * - id (uuid) PK
 * - full_name (text, optional)
 * - avatar_url (text, optional) - public URL or storage path
 * - email (text, optional)
 *
 * Notes:
 * - If avatar_url seems like a storage path (e.g., starts without http), we try to sign from 'avatars' bucket.
 * - Otherwise we treat it as a direct URL.
 */
export default function UserAvatar({
  userId,
  size = 40,
  className = '',
  rounded = true,
  showTooltip = true,
}) {
  const supabase = getSupabaseClient();

  const [profile, setProfile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(!!userId);

  const initials = useMemo(() => {
    const name = profile?.full_name || profile?.email || '';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1]?.[0] : '';
    return (first + second).toUpperCase();
  }, [profile?.full_name, profile?.email]);

  const title = useMemo(() => {
    if (!showTooltip) return undefined;
    const name = profile?.full_name || '';
    const email = profile?.email || '';
    return [name, email].filter(Boolean).join(' · ');
  }, [profile?.full_name, profile?.email, showTooltip]);

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      setLoading(true);
      try {
        if (!userId) {
          setProfile(null);
          setImgUrl('');
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, email')
          .eq('id', userId)
          .maybeSingle();
        if (error) throw error;
        if (!ignore) setProfile(data || null);

        // Resolve avatar URL if needed
        if (data?.avatar_url) {
          const urlVal = String(data.avatar_url);
          if (/^https?:\/\//i.test(urlVal)) {
            if (!ignore) setImgUrl(urlVal);
          } else {
            // Treat as storage path within 'avatars' bucket; sign a short-lived URL
            const { data: signed, error: signErr } = await supabase
              .storage
              .from('avatars')
              .createSignedUrl(urlVal, 300);
            if (signErr) {
              // silently fall back to initials if cannot sign
              if (!ignore) setImgUrl('');
            } else if (!ignore) {
              setImgUrl(signed?.signedUrl || '');
            }
          }
        } else {
          if (!ignore) setImgUrl('');
        }
      } catch (_e) {
        if (!ignore) {
          setProfile(null);
          setImgUrl('');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchProfile();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const style = useMemo(() => ({
    width: size,
    height: size,
    borderRadius: rounded ? '50%' : 'var(--radius-md)',
    background: 'var(--gradient-primary)',
    color: 'var(--color-text)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    fontWeight: 700,
    fontSize: Math.max(10, Math.floor(size / 2.8)),
    userSelect: 'none',
  }), [size, rounded]);

  if (!userId) {
    return (
      <div
        className={className}
        style={style}
        aria-label="Anonymous user"
        title={showTooltip ? 'Anonymous' : undefined}
      >
        <span aria-hidden>U</span>
      </div>
    );
  }

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={profile?.full_name ? `${profile.full_name}'s avatar` : 'User avatar'}
        title={title}
        className={className}
        style={style}
      />
    );
  }

  return (
    <div
      className={className}
      style={style}
      aria-label={profile?.full_name ? `${profile.full_name} avatar` : 'User avatar'}
      title={title}
    >
      <span aria-hidden>{initials}</span>
    </div>
  );
}
