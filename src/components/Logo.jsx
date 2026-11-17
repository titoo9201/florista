import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSection } from '../context/ContentContext';
import logo from '../assets/brand/florista-logo.webp';

/** Florista emblem logo linking home. Size it with a height class, e.g. `h-16`. */
export default function Logo({ className = '', ...props }) {
  const brand = useSection('site.brand');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tapCount = useRef(0);
  const lastTap = useRef(0);

  function handleTap(event) {
    if (pathname !== '/') return;
    const now = Date.now();
    if (now - lastTap.current > 4000) tapCount.current = 0;
    lastTap.current = now;
    tapCount.current += 1;
    event.preventDefault();
    if (tapCount.current >= 4) {
      tapCount.current = 0;
      navigate('/admin');
    }
  }

  return (
    <Link
      to="/"
      onPointerUp={handleTap}
      className="inline-flex shrink-0 touch-manipulation rounded-sm"
      aria-label={`${brand.name} — home`}
      {...props}
    >
      <img src={logo} alt={brand.name} width={412} height={400} decoding="async" className={`w-auto ${className}`} />
    </Link>
  );
}
