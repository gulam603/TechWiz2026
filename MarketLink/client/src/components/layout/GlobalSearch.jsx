import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import useClickOutside from '../../hooks/useClickOutside';
import { money } from '../../utils/format';
import { productPath } from '../../utils/links';

/** Instant search across products, farmers and markets (debounced). */
export default function GlobalSearch({ className = '', placeholder = 'Search produce, farmers, markets…', autoFocus = false }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    if (q.trim().length < 2) return undefined;
    const timer = setTimeout(() => {
      api.get(`/search?q=${encodeURIComponent(q.trim())}`).then((d) => {
        setResults(d);
        setOpen(true);
      }).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  function submit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  }

  const close = () => {
    setOpen(false);
    setQ('');
  };
  const total = results ? results.products.length + results.farmers.length + results.markets.length : 0;

  return (
    <div className={`global-search ${className}`} ref={ref}>
      <form className="search-pill" onSubmit={submit} role="search">
        <i className="bi bi-search" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value.trim().length < 2) setResults(null);
          }}
          onFocus={() => results && setOpen(true)}
          placeholder={placeholder}
          aria-label="Search"
          autoFocus={autoFocus}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>
      {open && results && (
        <div className="search-results">
          {total === 0 && <div className="text-muted-2 small p-3 text-center">No matches for “{q}”.</div>}
          {results.products.length > 0 && <div className="search-group-title">Products</div>}
          {results.products.map((p) => (
            <Link key={p._id} to={productPath(p)} className="search-hit" onClick={close}>
              <img src={p.image} alt="" />
              <span className="flex-grow-1">
                <strong className="d-block small">{p.name}</strong>
                <span className="fs-7 text-muted-2">{p.farmer?.stallName}</span>
              </span>
              <span className="small fw-bold">{money(p.price)}</span>
            </Link>
          ))}
          {results.farmers.length > 0 && <div className="search-group-title">Farmers</div>}
          {results.farmers.map((f) => (
            <Link key={f._id} to={`/farmers/${f.slug}`} className="search-hit" onClick={close}>
              <img src={f.logo} alt="" />
              <strong className="small">{f.stallName}</strong>
            </Link>
          ))}
          {results.markets.length > 0 && <div className="search-group-title">Markets</div>}
          {results.markets.map((m) => (
            <Link key={m._id} to={`/markets/${m.slug}`} className="search-hit" onClick={close}>
              <img src={m.image} alt="" />
              <span>
                <strong className="d-block small">{m.name}</strong>
                <span className="fs-7 text-muted-2">{m.address}</span>
              </span>
            </Link>
          ))}
          {total > 0 && (
            <button type="button" className="ml-dropdown-item justify-content-center fw-semi" onClick={submit}>
              See all product results
            </button>
          )}
        </div>
      )}
    </div>
  );
}
