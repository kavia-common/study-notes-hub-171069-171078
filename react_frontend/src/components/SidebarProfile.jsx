import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import useProfile from '../hooks/useProfile.js';
import UserAvatar from './UserAvatar.jsx';
import { useNavigate, createSearchParams } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * SidebarProfile shows the current user's profile summary and quick actions.
 * On mobile, this can be conditionally hidden by the layout.
 */
export default function SidebarProfile() {
  const { user, loading } = useAuth();
  const { stats } = useProfile({ pageSize: 6 });
  const navigate = useNavigate();

  const emailOrGuest = loading ? 'Loading...' : (user?.email || 'Guest');
  const subtitle = user ? 'Welcome back!' : 'Sign in to upload and bookmark notes.';

  function goProfile(tab) {
    if (!user) return;
    const search = tab ? `?${createSearchParams({ tab })}` : '';
    navigate(`/profile${search}`);
  }

  return (
    <aside
      className="card"
      aria-label="User profile"
      style={{
        position: 'sticky',
        top: 80,
        height: 'fit-content',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user ? (
          <UserAvatar userId={user.id} size={48} />
        ) : (
          <div
            aria-hidden
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        )}
        <div>
          <div style={{ fontWeight: 700 }}>
            {emailOrGuest}
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button className="btn ghost" aria-label="My uploads" disabled={!user} onClick={() => goProfile('uploads')}>
          ⬆️ <span className="text-muted">({stats.uploads || 0})</span>
        </button>
        <button className="btn ghost" aria-label="My bookmarks" disabled={!user} onClick={() => goProfile('bookmarks')}>
          🔖 <span className="text-muted">({stats.bookmarks || 0})</span>
        </button>
        <button className="btn ghost" aria-label="My likes" disabled={!user} onClick={() => goProfile('likes')}>
          👍 <span className="text-muted">({stats.likes || 0})</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn" aria-label="View profile" disabled={!user} onClick={() => goProfile()}>
          Profile
        </button>
        <a className="btn ghost" href="/upload" aria-label="Upload notes">
          Upload
        </a>
      </div>
    </aside>
  );
}
