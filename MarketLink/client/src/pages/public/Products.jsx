import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toQuery } from '../../api/client';
import ProductCard from '../../components/cards/ProductCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { CardSkeletons } from '../../components/common/Loader';
import { PageHero } from '../../components/common/PageHeader';
import { DAY_LETTER, DAY_NAMES } from '../../utils/format';
import { CURRENCY } from '../../config';

const SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
];

const FILTER_KEYS = ['search', 'category', 'city', 'market', 'day', 'minPrice', 'maxPrice', 'rating', 'practice', 'inStock', 'sort', 'page'];

// Rendered with key={params.toString()} so the text boxes reset when the URL filters change.
function Filters({ params, set, categories, markets, cities, practices = [], onDone }) {
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const [search, setSearch] = useState(params.get('search') || '');

  const category = params.get('category') || '';
  const day = params.get('day') ?? '';

  return (
    <div className="filter-panel">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          set({ search });
          onDone?.();
        }}
      >
        <div className="filter-title">Search</div>
        <div className="search-pill">
          <i className="bi bi-search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" aria-label="Search products" />
        </div>
      </form>

      <div className="filter-title">Category</div>
      <div className="d-grid gap-1">
        <button type="button" className={`cat-option ${!category ? 'active' : ''}`} onClick={() => set({ category: '' })}>
          <i className="bi bi-grid" style={{ width: 24, textAlign: 'center' }} /> All products
        </button>
        {categories.map((c) => (
          <button type="button" key={c._id} className={`cat-option ${category === c.slug ? 'active' : ''}`} onClick={() => set({ category: c.slug })}>
            <img src={c.icon} alt="" /> {c.name}
            <span className="n">{c.productCount}</span>
          </button>
        ))}
      </div>

      <div className="filter-title">Location</div>
      <select className="form-select mb-2" value={params.get('city') || ''} onChange={(e) => set({ city: e.target.value, market: '' })} aria-label="City">
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <select className="form-select" value={params.get('market') || ''} onChange={(e) => set({ market: e.target.value })} aria-label="Market">
        <option value="">All markets</option>
        {markets.filter((m) => !params.get('city') || m.city === params.get('city')).map((m) => (
          <option key={m._id} value={m._id}>
            {m.name}
          </option>
        ))}
      </select>

      <div className="filter-title">Market day</div>
      <div className="day-picker">
        {DAY_LETTER.map((letter, i) => (
          <button
            type="button"
            key={i}
            className={String(i) === day ? 'active' : ''}
            onClick={() => set({ day: String(i) === day ? '' : String(i) })}
            title={DAY_NAMES[i]}
            aria-label={DAY_NAMES[i]}
            aria-pressed={String(i) === day}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="filter-title">Price ({CURRENCY})</div>
      <form
        className="d-flex gap-2 align-items-center"
        onSubmit={(e) => {
          e.preventDefault();
          set({ minPrice, maxPrice });
          onDone?.();
        }}
      >
        <input type="number" min="0" className="form-control form-control-sm" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} aria-label="Minimum price" />
        <span>–</span>
        <input type="number" min="0" className="form-control form-control-sm" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} aria-label="Maximum price" />
        <button type="submit" className="btn btn-soft btn-sm btn-icon" aria-label="Apply price">
          <i className="bi bi-arrow-right" />
        </button>
      </form>

      <div className="filter-title">Rating</div>
      <div className="d-flex gap-1 flex-wrap" role="group" aria-label="Minimum rating">
        {[
          ['', 'Any'],
          ['4', '4+'],
          ['3', '3+'],
        ].map(([v, l]) => (
          <button key={l} type="button" className={`filter-chip ${(params.get('rating') || '') === v ? 'active' : ''}`} aria-pressed={(params.get('rating') || '') === v} onClick={() => set({ rating: v })}>
            {v && <i className="bi bi-star-fill text-warning" />} {l}
          </button>
        ))}
      </div>

      {practices.length > 0 && (
        <>
          <div className="filter-title">Farming practice</div>
          <select className="form-select" value={params.get('practice') || ''} onChange={(e) => set({ practice: e.target.value })} aria-label="Farming practice">
            <option value="">Any practice</option>
            {practices.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </>
      )}

      <div className="form-check form-switch mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="inStock"
          checked={params.get('inStock') === 'true'}
          onChange={(e) => set({ inStock: e.target.checked ? 'true' : '' })}
        />
        <label className="form-check-label small fw-semi" htmlFor="inStock">
          In stock only
        </label>
      </div>
    </div>
  );
}

export default function Products() {
  useDocumentTitle('Shop fresh produce');
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const { data: catData } = useFetch('/categories');
  const { data: marketData } = useFetch('/markets');
  const { data: practiceData } = useFetch('/practices');

  const query = {};
  for (const key of FILTER_KEYS) if (params.get(key)) query[key] = params.get(key);
  const { data, loading, error, reload } = useFetch(`/products${toQuery({ limit: 12, ...query })}`);

  /** Updates one or more filters in the URL (resetting to page 1). */
  function set(changes) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v === undefined || v === null) next.delete(k);
      else next.set(k, v);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  }

  const categories = catData?.categories || [];
  const markets = marketData?.markets || [];
  const activeCategory = categories.find((c) => c.slug === params.get('category'));
  const activeFilters = FILTER_KEYS.filter((k) => !['sort', 'page'].includes(k) && params.get(k));

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Shop' }]}
        title={activeCategory ? activeCategory.name : 'Shop the market'}
        subtitle={activeCategory?.description || 'Browse this week’s stock from every farmer. Filter by market, day and price, then pre-order for pickup.'}
      />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3 d-none d-lg-block">
            <Filters key={params.toString()} params={params} set={set} categories={categories} markets={markets} cities={marketData?.cities || []} practices={practiceData?.practices} />
          </div>
          <div className="col-lg-9">
            <div className="results-bar">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button type="button" className="btn btn-white btn-sm d-lg-none" onClick={() => setShowFilters(true)}>
                  <i className="bi bi-sliders" /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                </button>
                <span className="small text-muted-2">
                  <strong className="text-forest">{data?.total ?? '…'}</strong> products
                  {params.get('search') && (
                    <>
                      {' '}
                      for “<strong>{params.get('search')}</strong>”
                    </>
                  )}
                </span>
                {activeFilters.length > 0 && (
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setParams({})}>
                    Clear filters
                  </button>
                )}
              </div>
              <select className="form-select form-select-sm w-auto" value={params.get('sort') || 'popular'} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort products">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {error && <ErrorState error={error} onRetry={reload} />}
            <div className="row g-3">
              {loading && !data ? (
                <CardSkeletons count={9} cols="col-6 col-md-4" />
              ) : (
                data?.products.map((p) => (
                  <div key={p._id} className="col-6 col-md-4">
                    <ProductCard product={p} />
                  </div>
                ))
              )}
            </div>
            {data && data.products.length === 0 && (
              <EmptyState
                image="/illustrations/leafy-greens.webp"
                title="Nothing matches those filters"
                message="Try another category, market day or a wider price range."
                action={
                  <button type="button" className="btn btn-primary" onClick={() => setParams({})}>
                    Clear all filters
                  </button>
                }
              />
            )}
            <Pagination page={data?.page || 1} pages={data?.pages} onChange={(p) => set({ page: String(p) })} />
          </div>
        </div>
      </div>

      {showFilters && (
        <>
          <div className="offcanvas offcanvas-start show" style={{ visibility: 'visible' }} tabIndex={-1} aria-label="Filters">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Filters</h5>
              <button type="button" className="btn-close" onClick={() => setShowFilters(false)} aria-label="Close" />
            </div>
            <div className="offcanvas-body">
              <Filters key={params.toString()} params={params} set={set} categories={categories} markets={markets} cities={marketData?.cities || []} practices={practiceData?.practices} onDone={() => setShowFilters(false)} />
            </div>
          </div>
          <div className="offcanvas-backdrop fade show" onClick={() => setShowFilters(false)} />
        </>
      )}
    </>
  );
}
