import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toQuery } from '../../api/client';
import FarmerCard from '../../components/cards/FarmerCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeletons } from '../../components/common/Loader';
import { PageHero } from '../../components/common/PageHeader';
import { DAY_NAMES } from '../../utils/format';

export default function Farmers() {
  useDocumentTitle('Local farmers');
  const [filters, setFilters] = useState({ search: '', market: '', day: '', category: '', sort: 'rating', page: 1 });
  const { data, loading } = useFetch(`/farmers${toQuery({ ...filters, limit: 12 })}`);
  const { data: marketData } = useFetch('/markets');
  const { data: catData } = useFetch('/categories');
  const set = (changes) => setFilters((f) => ({ ...f, ...changes, page: changes.page || 1 }));

  return (
    <>
      <PageHero crumbs={[{ label: 'Farmers' }]} title="Meet your local farmers" subtitle="Every stall on MarketLink, with their markets, operating days, current stock and reviews." />
      <div className="container pb-5">
        <div className="soft-panel mb-4">
          <div className="row g-2">
            <div className="col-md-4">
              <div className="search-pill">
                <i className="bi bi-search" />
                <input placeholder="Search farmer or speciality" value={filters.search} onChange={(e) => set({ search: e.target.value })} aria-label="Search farmers" />
              </div>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={filters.market} onChange={(e) => set({ market: e.target.value })} aria-label="Market">
                <option value="">All markets</option>
                {(marketData?.markets || []).map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={filters.category} onChange={(e) => set({ category: e.target.value })} aria-label="Category">
                <option value="">All categories</option>
                {(catData?.categories || []).map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={filters.day} onChange={(e) => set({ day: e.target.value })} aria-label="Day">
                <option value="">Any day</option>
                {DAY_NAMES.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={filters.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort">
                <option value="rating">Top rated</option>
                <option value="name">Name A–Z</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
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
        {data && data.farmers.length === 0 && <EmptyState image="/illustrations/farmer.webp" title="No farmers found" message="Try clearing a filter." />}
        <Pagination page={filters.page} pages={data?.pages} onChange={(page) => set({ page })} />
      </div>
    </>
  );
}
