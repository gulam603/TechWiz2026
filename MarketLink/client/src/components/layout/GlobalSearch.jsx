import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import useClickOutside from '../../hooks/useClickOutside';
import useFetch from '../../hooks/useFetch';
import { money } from '../../utils/format';
import { productPath } from '../../utils/links';

/**
 * Instant search across products, farmers and markets (debounced).
 * `withCategory` adds an "All categories" dropdown so people can search inside one category.
 */
export default function GlobalSearch({ className = '', placeholder = 'Search produce, farmers, markets…', autoFocus = false, withCategory = false, size = '', inputId }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const cats = useFetch(withCategory ? '/categories' : null);
  const categories = cats.data?.categories || [];
  const categoryName = categories.find((c) => c.slug === category)?.name;
  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    if (q.trim().length < 2) return undefined;
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: q.trim() });
      if (category) params.set('category', category);
      api
        .get(`/search?${params}`)
        .then((d) => {
          setResults(d);
          setOpen(true);
        })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [q, category]);

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('search', q.trim());
    if (category) params.set('category', category);
    if (!params.size) return;
    setOpen(false);
    navigate(`/products?${params}`);
  }

  const close = () => {
    setOpen(false);
    setQ('');
  };
  const total = results ? results.products.length + results.farmers.length + results.markets.length : 0;

  return (
    <div className={`global-search ${withCategory ? 'has-category' : ''} ${size ? `search-${size}` : ''} ${className}`} ref={ref}>
      <form className="search-pill" onSubmit={submit} role="search">
        {withCategory && (
          <label className="search-cat">
            <span className="visually-hidden">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Search in category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <i className="bi bi-chevron-down" aria-hidden="true" />
          </label>
        )}
        <i className="bi bi-search search-icon" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value.trim().length < 2) setResults(null);
          }}
          onFocus={() => results && setOpen(true)}
          placeholder={categoryName ? `Search in ${categoryName}…` : placeholder}
          id={inputId}
          aria-label={inputId ? undefined : 'Search'}
          autoFocus={autoFocus}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>
      {open && results && (
        <div className="search-results">
          {total === 0 && (
            <div className="text-muted-2 small p-3 text-center">
              No matches for “{q}”{categoryName ? ` in ${categoryName}` : ''}.
            </div>
          )}
          {results.products.length > 0 && <div className="search-group-title">Products{categoryName ? ` in ${categoryName}` : ''}</div>}
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
            <button type="button" className="search-see-all" onClick={submit}>
              <span>
                See all products for <strong>“{q.trim()}”</strong>
                {categoryName ? ` in ${categoryName}` : ''}
              </span>
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
