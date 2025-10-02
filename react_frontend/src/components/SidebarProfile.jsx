import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PUBLIC_INTERFACE
 * SidebarProfile shows the current user's profile summary and quick actions.
 * On mobile, this can be conditionally hidden by the layout.
 */
export default function SidebarProfile() {
  const { user, loading } = useAuth();

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
        <div>
          <div style={{ fontWeight: 700 }}>
            {loading ? 'Loading...' : user?.email || 'Guest'}
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {user ? 'Welcome back!' : 'Sign in to upload and bookmark notes.'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn ghost" aria-label="View profile" disabled={!user}>
          Profile
        </button>
        <button className="btn ghost" aria-label="My bookmarks" disabled={!user}>
          Bookmarks
        </button>
        <button className="btn ghost" aria-label="My uploads" disabled={!user}>
          Uploads
        </button>
      </div>
    </aside>
  );
}
