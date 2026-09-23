import { Link } from 'react-router-dom';

export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#173B2C" />
      <path d="M14 30h36l-4 20a4 4 0 0 1-4 3H22a4 4 0 0 1-4-3z" fill="#D4F06E" />
      <path d="M22 30c0-7 4-13 10-13s10 6 10 13" fill="none" stroke="#D4F06E" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 17c2-6 7-8 12-7-1 5-5 9-12 7z" fill="#6DBE45" />
      <path d="M24 37v10M32 37v10M40 37v10" stroke="#173B2C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ light = false, to = '/' }) {
  return (
    <Link to={to} className={`brand ${light ? 'brand-light' : ''}`} aria-label="MarketLink home">
      <LogoMark />
      <span className="brand-name">
        Market<span>Link</span>
      </span>
    </Link>
  );
}
