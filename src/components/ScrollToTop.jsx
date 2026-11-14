import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * On route change: scroll to the top, or — when the URL has a #hash (e.g. /bouquets#peony-candle) —
 * scroll to that element once it has rendered and briefly highlight it.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return undefined;
    }

    const id = decodeURIComponent(hash.slice(1));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tries = 0;
    let timer;
    let clearHighlight;

    const go = () => {
      const el = document.getElementById(id);
      if (!el) {
        if (tries++ < 30) timer = setTimeout(go, 50); // page content may still be mounting
        return;
      }
      const fitsOnScreen = el.offsetHeight < window.innerHeight * 0.8;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: fitsOnScreen ? 'center' : 'start' });
      if (el.tagName === 'LI') {
        el.setAttribute('data-target-flash', '');
        clearHighlight = setTimeout(() => el.removeAttribute('data-target-flash'), 2200);
      }
    };
    go();

    return () => {
      clearTimeout(timer);
      clearTimeout(clearHighlight);
    };
  }, [pathname, hash]);

  return null;
}
