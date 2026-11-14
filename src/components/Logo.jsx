import { Link } from 'react-router-dom';
import { brand } from '../data/site';
import logo from '../assets/brand/florista-logo.webp';

/** Florista emblem logo linking home. Size it with a height class, e.g. `h-16`. */
export default function Logo({ className = '', ...props }) {
  return (
    <Link to="/" className="inline-flex shrink-0 rounded-sm" aria-label={`${brand.name} — home`} {...props}>
      <img src={logo} alt={brand.name} width={412} height={400} decoding="async" className={`w-auto ${className}`} />
    </Link>
  );
}
