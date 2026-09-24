import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toQuery } from '../../api/client';
import FarmerCard from '../../components/cards/FarmerCard';
import MapView from '../../components/map/MapView';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeletons } from '../../components/common/Loader';
import { PageHero } from '../../components/common/PageHeader';
import { DAY_NAMES, DAY_SHORT } from '../../utils/format';

export default function Farmers() {
  useDocumentTitle('Local farmers');
  const [filters, setFilters] = useState({ search: '', city: '', market: '', day: '', category: '', rating: '', practice: '', sort: 'rating', page: 1 });
  const { data: practiceData } = useFetch('/practices');
  const [view, setView] = useState('grid');
  // The map shows every matching stall, the grid is paginated
  const { data, loading } = useFetch(`/farmers${toQuery({ ...filters, limit: view === 'map' ? 60 : 12, page: view === 'map' ? 1 : filters.page })}`);
  const { data: marketData } = useFetch('/markets');
  const { data: catData } = useFetch('/categories');
  const set = (changes) => setFilters((f) => ({ ...f, ...changes, page: changes.page || 1 }));
  const markets = (marketData?.markets || []).filter((m) => !filters.city || m.city === filters.city);

  return (
    <>
      <PageHero crumbs={[{ label: 'Farmers' }]} title="Meet your local farmers" subtitle="Every stall on MarketLink, with their markets, operating days, current stock and reviews." />
      <div className="container pb-5">
        <div className="soft-panel mb-4">
          <div className="row g-2">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="search-pill">
                <i className="bi bi-search" />
                <input placeholder="Search farmer or speciality" value={filters.search} onChange={(e) => set({ search: e.target.value })} aria-label="Search farmers" />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={filters.city} onChange={(e) => set({ city: e.target.value, market: '' })} aria-label="City">
                <option value="">All cities</option>
                {(marketData?.cities || []).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={filters.market} onChange={(e) => set({ market: e.target.value })} aria-label="Market">
                <option value="">All markets</option>
                {markets.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={filters.category} onChange={(e) => set({ category: e.target.value })} aria-label="Category">
                <option value="">All categories</option>
                {(catData?.categories || []).map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={filters.day} onChange={(e) => set({ day: e.target.value })} aria-label="Market day">
                <option value="">Any day</option>
                {DAY_NAMES.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={filters.rating} onChange={(e) => set({ rating: e.target.value })} aria-label="Rating">
                <option value="">Any rating</option>
                <option value="4">4 stars and up</option>
                <option value="3">3 stars and up</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={filters.practice} onChange={(e) => set({ practice: e.target.value })} aria-label="Farming practice">
                <option value="">Any practice</option>
                {(practiceData?.practices || []).map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-xl-3 d-flex gap-2">
              <select className="form-select" value={filters.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort">
                <option value="rating">Top rated</option>
                <option value="name">Name A–Z</option>
                <option value="newest">Newest</option>
              </select>
              <div className="tabs-pill flex-shrink-0">
                <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}>
                  <i className="bi bi-grid" />
                </button>
                <button type="button" className={view === 'map' ? 'active' : ''} onClick={() => setView('map')} aria-label="Map view" aria-pressed={view === 'map'}>
                  <i className="bi bi-map" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {view === 'map' ? (
          <MapView
            height={560}
            markers={(data?.farmers || [])
              .filter((f) => f.latitude)
              .map((f) => ({
                id: f._id,
                lat: f.latitude,
                lng: f.longitude,
                type: 'farmer',
                image: f.logo,
                title: f.stallName,
                subtitle: `${f.operatingDays.map((d) => DAY_SHORT[d]).join(', ')} · ${f.markets.map((m) => m.name).join(', ')}`,
                link: `/farmers/${f.slug}`,
                linkLabel: 'View stall',
              }))}
          />
        ) : (
          <div className="row g-3 g-lg-4">
            {loading && !data ? (
              <CardSkeletons count={8} cols="col-sm-6 col-lg-4 col-xl-3" height={330} />
            ) : (
              data?.farmers.map((f) => (
                <div key={f._id} className="col-sm-6 col-lg-4 col-xl-3">
                  <FarmerCard farmer={f} />
                </div>
              ))
            )}
          </div>
        )}
        {data && data.farmers.length === 0 && <EmptyState image="/illustrations/farmer.webp" title="No farmers found" message="Try clearing a filter." />}
        {view === 'grid' && <Pagination page={filters.page} pages={data?.pages} onChange={(page) => set({ page })} />}
      </div>
    </>
  );
}
