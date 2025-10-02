import React from 'react';

/**
 * PUBLIC_INTERFACE
 * AuthPage provides a consistent, modern Ocean Professional layout for
 * authentication screens (login/signup). It renders a centered card with
 * a title, subtitle, and a content area for forms or other controls.
 *
 * Props:
 * - title: main heading
 * - subtitle: supporting text below the title
 * - children: form/content to render inside the card
 */
export default function AuthPage({ title, subtitle, children }) {
  return (
    <div
      className="container"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '1.25rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
        }}
        aria-label={`${title} card`}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ marginBottom: 4 }}>{title}</h1>
          {subtitle && <p className="text-muted" style={{ margin: 0 }}>{subtitle}</p>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
