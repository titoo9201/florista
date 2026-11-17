import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { authHeaders, apiFetch } from '../lib/contentApi';
import { getSeedProducts } from '../lib/seedContent';
import { useContent } from '../context/ContentContext';
import ProductsTab from '../admin/ProductsTab';
import PhotosTab from '../admin/PhotosTab';
import ContentTab from '../admin/ContentTab';
import SecurityTab from '../admin/SecurityTab';
import DashboardTab from '../admin/DashboardTab';
import AdminSidebar, { menuTitle } from '../admin/AdminSidebar';
import Tour from '../admin/Tour';
import { TOUR_STEPS } from '../admin/tourSteps';

const TOKEN_KEY = 'florista_admin_token';
// Set once the tutorial was finished or skipped on this device — a new admin/device sees it automatically.
const TOUR_KEY = 'florista_admin_tour_done_v2';
const isPhone = () => window.matchMedia('(max-width: 1023px)').matches;

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const title = document.title;
    document.title = 'Admin · Florista';
    return () => {
      meta.remove();
      document.title = title;
    };
  }, []);
}

function Login({ onLoggedIn }) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function login(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await apiFetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ passkey }) });
      localStorage.setItem(TOKEN_KEY, result.token);
      onLoggedIn(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container-page flex min-h-screen items-center justify-center py-8 sm:py-12">
      <form onSubmit={login} className="w-full max-w-sm rounded-card bg-card p-5 shadow-card sm:p-8">
        <Link to="/" className="text-sm underline">← Back to website</Link>
        <h1 className="mt-6 font-serif text-4xl">Florista admin</h1>
        <p className="mt-2 text-sm">Enter your private passkey to manage the website.</p>
        <label htmlFor="admin-passkey" className="sr-only">Admin passkey</label>
        <input id="admin-passkey" autoFocus autoComplete="current-password" type="password" className="admin-input mt-6 w-full" value={passkey} onChange={(e) => setPasskey(e.target.value)} placeholder="Passkey" />
        <button className="admin-primary mt-4 w-full" type="submit" disabled={busy || !passkey}>{busy ? 'Checking…' : 'Open admin panel'}</button>
        {error && <p className="mt-3 text-sm text-error" role="alert">{error}</p>}
      </form>
    </main>
  );
}

/** Phone menu: slides in from the left; closes on Esc, outside tap or after choosing an item. */
function Drawer({ open, onClose, children }) {
  const reduce = useReducedMotion();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('button, a')?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div className="absolute inset-0 bg-ink/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={panelRef}
            id="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 left-0 w-[86%] max-w-[310px] overflow-y-auto bg-card shadow-card-hover"
            initial={reduce ? { opacity: 0 } : { x: '-100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" onClick={onClose} aria-label="Close menu" className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function Admin() {
  useNoIndex();
  const { content, refresh } = useContent();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [view, setView] = useState({ tab: 'dashboard', sub: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const menuButtonRef = useRef(null);
  const viewBeforeTour = useRef(null);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (content?.products) setProducts(content.products);
  }, [content]);

  // Expired/invalid sessions go back to the passkey screen.
  useEffect(() => {
    if (!token) return;
    apiFetch('/api/admin/me', { headers: authHeaders(token) }).catch(() => {
      localStorage.removeItem(TOKEN_KEY);
      setToken('');
    });
  }, [token]);

  // A new admin (first visit on this device) sees the tutorial automatically.
  useEffect(() => {
    if (!token || !content) return;
    let seen = false;
    try {
      seen = localStorage.getItem(TOUR_KEY) === '1';
    } catch {
      /* storage blocked — show the tour */
    }
    if (!seen) startTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, Boolean(content)]);

  function select(tab, sub) {
    setView({ tab, sub: sub ?? (tab === 'products' ? 'home' : null) });
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }

  function startTour() {
    viewBeforeTour.current = view;
    setDrawerOpen(false);
    setTourOpen(true);
  }

  function endTour() {
    setTourOpen(false);
    setDrawerOpen(false);
    try {
      localStorage.setItem(TOUR_KEY, '1');
    } catch {
      /* ignore */
    }
    if (viewBeforeTour.current) setView(viewBeforeTour.current);
  }

  function onTourStep(step) {
    if (step.view) setView(step.view);
    setDrawerOpen(Boolean(step.drawer) && isPhone());
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
  }

  async function seed() {
    try {
      await apiFetch('/api/admin/seed', { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ products: getSeedProducts() }) });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!token) return <Login onLoggedIn={(t) => { setToken(t); refresh(); }} />;

  const { title, sub, hint } = menuTitle(view);
  const sidebar = <AdminSidebar view={view} onSelect={select} onTutorial={startTour} onLogout={logout} />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Desktop side menu */}
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-line bg-card lg:block">{sidebar}</aside>

      {/* Phone top bar with ☰ */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-cream/95 px-3 py-2 backdrop-blur lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          data-tour="menu-button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={drawerOpen}
          aria-controls="admin-drawer"
          className="inline-flex h-11 w-11 items-center justify-center rounded-media border border-line bg-card"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <div className="min-w-0">
          <p className="truncate font-serif text-xl leading-tight">{title}</p>
          {sub && <p className="truncate text-[11px] text-ink/70">{sub}</p>}
        </div>
      </header>
      <Drawer open={drawerOpen} onClose={closeDrawer}>{sidebar}</Drawer>

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-10 xl:px-12">
        <div className="hidden lg:block">
          <h1 className="font-serif text-4xl xl:text-5xl">
            {title}
            {sub && <span className="text-ink/60"> · {sub}</span>}
          </h1>
          <p className="mt-1 text-sm text-ink/75">{hint}</p>
        </div>

        {!content && (
          <p className="mt-6 rounded-card border border-error/40 bg-card p-4 text-sm text-error" role="alert">
            Could not reach the Florista server. Check that the API is running and VITE_API_URL is set — changes cannot be saved until it connects.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-error" role="alert">{error}</p>}

        {content && !content.seeded && (
          <div className="mt-6 rounded-card border border-rose bg-blush p-5">
            <h2 className="font-serif text-2xl">Import current website items</h2>
            <p className="mt-1 text-sm">One-time step: copies the products already on the website into the database so you can edit them.</p>
            <button type="button" className="admin-primary mt-4 w-full sm:w-auto" onClick={seed}>Import products</button>
          </div>
        )}

        <div className="mt-6 lg:mt-8">
          {view.tab === 'dashboard' && <DashboardTab token={token} onTutorial={startTour} />}
          {view.tab === 'products' &&
            (content?.seeded ? (
              <ProductsTab
                token={token}
                products={products}
                setProducts={setProducts}
                onChanged={refresh}
                collection={view.sub || 'home'}
                onCollectionChange={(c) => setView({ tab: 'products', sub: c })}
              />
            ) : (
              <p className="text-sm">Import the current products first (see above).</p>
            ))}
          {view.tab === 'photos' && <PhotosTab token={token} page={view.sub} />}
          {view.tab === 'text' && (
            <ContentTab key={`text-${view.sub || 'all'}`} token={token} pages={view.sub ? [view.sub] : undefined} exclude={['Contact & WhatsApp']} />
          )}
          {view.tab === 'contact' && <ContentTab key="contact" token={token} pages={['Contact & WhatsApp']} />}
          {view.tab === 'security' && <SecurityTab token={token} onToken={(t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />}
        </div>
      </main>

      <Tour steps={TOUR_STEPS} open={tourOpen} onStep={onTourStep} onClose={endTour} />
    </div>
  );
}
