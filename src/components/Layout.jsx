import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { track } from '../lib/track';

/** Counts page views and WhatsApp opens (anonymously) for the admin dashboard. */
function useVisitorStats() {
  const { pathname } = useLocation();
  const last = useRef({ path: '', at: 0 });

  useEffect(() => {
    const now = Date.now();
    if (last.current.path === pathname && now - last.current.at < 1500) return; // ignore double-mounts
    last.current = { path: pathname, at: now };
    track('pageview', { path: pathname });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.('a[href*="wa.me"]');
      if (link) track('whatsapp', { product: link.dataset.product || '' });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
}

export default function Layout() {
  useVisitorStats();
  return (
    <>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-btn focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
