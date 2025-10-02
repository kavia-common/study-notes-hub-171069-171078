import React from 'react';
import Navbar from '../components/Navbar.jsx';
import SidebarProfile from '../components/SidebarProfile.jsx';

/**
 * PUBLIC_INTERFACE
 * MainLayout provides the primary app shell with:
 * - Top Navbar
 * - Left SidebarProfile (visible on desktop)
 * - Main content area for routed pages
 *
 * Usage:
 * <MainLayout>
 *   <YourPage />
 * </MainLayout>
 */
export default function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '1rem',
          }}
        >
          <div className="sidebar-desktop" style={{ display: 'block' }}>
            <SidebarProfile />
          </div>
          <section aria-label="Main Content">{children}</section>
        </div>
      </main>

      {/* Inline responsive tweak: hide sidebar on small screens */}
      <style>{`
        @media (max-width: 920px) {
          .sidebar-desktop { display: none !important; }
          main.container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
