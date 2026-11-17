import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSection } from '../context/ContentContext';
import Logo from './Logo';

const linkClass = ({ isActive }) =>
  `rounded-sm underline-offset-[5px] decoration-1 hover:underline ${isActive ? 'underline' : ''}`;

export default function Navbar() {
  const navLinks = useSection('site.navLinks');
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const menuId = useId();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="container-page">
      <div className="flex h-[72px] items-center justify-between border-b border-line md:h-[88px]">
        <Logo className="h-14 md:h-[72px]" />

        <nav aria-label="Primary" className="hidden lg:block xl:mr-[167px]">
          <ul className="flex items-center gap-[30px] text-[13px] leading-5">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end className={linkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-btn lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id={menuId}
            aria-label="Primary mobile"
            className="overflow-hidden border-b border-line lg:hidden"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="flex flex-col py-2 text-base">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end className={(s) => `block py-3 ${linkClass(s)}`}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
