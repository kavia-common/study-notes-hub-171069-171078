import React, { useEffect, useMemo, useState } from 'react';
import useProfile from '../hooks/useProfile.js';
import UserAvatar from '../components/UserAvatar.jsx';
import NotesGrid from '../components/NotesGrid.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingState from '../components/State/LoadingState.jsx';
import ErrorState from '../components/State/ErrorState.jsx';

/**
 * PUBLIC_INTERFACE
 * ProfilePage renders the current user's profile with stats and lists:
 * - Header with avatar, name/email, and counts (uploads, bookmarks, likes)
 * - Tabs for Uploads, Bookmarks, Likes showing NotesGrid
 * - Responsive layout consistent with Ocean Professional theme
 *
 * Routing:
 * - Path: /profile
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, stats, uploads, bookmarks, likes, loading, error } = useProfile();
  const [activeTab, setActiveTab] = useState('uploads');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['uploads', 'bookmarks', 'likes'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const headerName = useMemo(() => {
    return profile?.full_name || user?.email || 'My Profile';
  }, [profile?.full_name, user?.email]);

  if (authLoading || loading) {
    return (
      <LoadingState title="Loading profile…" description="Fetching your data from the cloud." />
    );
  }

  if (!user) {
    return (
      <div className="card" role="alert">
        <h1>My Profile</h1>
        <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
          You need to sign in to view your profile.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a className="btn" href="/login">Log in</a>
          <a className="btn ghost" href="/signup">Create account</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Header */}
      <div className="card" style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <UserAvatar userId={user.id} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ marginBottom: 2 }}>{headerName}</h1>
            <div className="text-muted" style={{ fontSize: 14 }}>
              {profile?.email || user?.email}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn ghost" onClick={() => navigate('/upload')}>Upload new</button>
            <Link className="btn ghost" to="/browse">Browse</Link>
          </div>
        </div>

        {/* Stats */}
        <div
          className="surface"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
            gap: '0.5rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius-lg)',
          }}
          aria-label="Profile statistics"
        >
          <StatCard label="Uploads" value={stats.uploads || 0} active={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} />
          <StatCard label="Bookmarks" value={stats.bookmarks || 0} active={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')} />
          <StatCard label="Likes" value={stats.likes || 0} active={activeTab === 'likes'} onClick={() => setActiveTab('likes')} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <TabButton label="Uploads" active={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} />
          <TabButton label="Bookmarks" active={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')} />
          <TabButton label="Likes" active={activeTab === 'likes'} onClick={() => setActiveTab('likes')} />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState title="Failed to load profile" message={error} />
      ) : null}

      {activeTab === 'uploads' && (
        <NotesGrid
          notes={uploads.items}
          loading={uploads.loading}
          error={uploads.error}
          onOpen={(n) => navigate(`/notes/${n.id}`)}
        />
      )}

      {activeTab === 'bookmarks' && (
        <NotesGrid
          notes={bookmarks.items}
          loading={bookmarks.loading}
          error={bookmarks.error}
          onOpen={(n) => navigate(`/notes/${n.id}`)}
        />
      )}

      {activeTab === 'likes' && (
        <NotesGrid
          notes={likes.items}
          loading={likes.loading}
          error={likes.error}
          onOpen={(n) => navigate(`/notes/${n.id}`)}
        />
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 720px) {
          div[aria-label="Profile statistics"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// PUBLIC_INTERFACE
function StatCard({ label, value, active, onClick }) {
  return (
    <button
      className="btn ghost"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        width: '100%',
        height: 'auto',
        padding: '0.75rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'left',
      }}
    >
      <span className="text-muted" style={{ fontSize: 12 }}>{label}</span>
      <strong style={{ fontSize: 20 }}>{value}</strong>
    </button>
  );
}

// PUBLIC_INTERFACE
function TabButton({ label, active, onClick }) {
  return (
    <button
      className={`btn ghost`}
      onClick={onClick}
      aria-pressed={active}
      style={{
        borderColor: active ? 'var(--color-primary-400)' : 'var(--color-border)',
        background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
      }}
    >
      {label}
    </button>
  );
}
