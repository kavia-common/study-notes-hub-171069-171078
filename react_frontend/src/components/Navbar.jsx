import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PUBLIC_INTERFACE
 * Navbar renders the top navigation bar with brand, navigation links,
 * theme toggle, and user auth controls.
 */
export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();

  return (
    <header
      className="navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label="Top Navigation"
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'inherit' }}>
          <div
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
          <strong>Study Notes Hub</strong>
        </Link>

        {/* Primary nav */}
        <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              fontWeight: 600,
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/browse"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              fontWeight: 600,
            })}
          >
            Browse
          </NavLink>
          <NavLink
            to="/upload"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              fontWeight: 600,
            })}
          >
            Upload
          </NavLink>
        </nav>

        {/* Actions: theme + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  <NavLink
                    to="/profile"
                    style={({ isActive }) => ({
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                      fontWeight: 600,
                    })}
                  >
                    Profile
                  </NavLink>
                  <span className="text-muted" style={{ fontSize: 14 }}>
                    {user.email}
                  </span>
                  <button className="btn ghost" onClick={signOut} aria-label="Sign out">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink className="btn ghost" to="/login">
                    Log in
                  </NavLink>
                  <NavLink className="btn" to="/signup">
                    Sign up
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
