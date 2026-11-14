import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll to the top when the route changes (hash links within a page are left alone). */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}
