import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toQuery } from '../../api/client';
import MarketCard from '../../components/cards/MarketCard';
import MapView from '../../components/map/MapView';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeletons } from '../../components/common/Loader';
import { PageHero } from '../../components/common/PageHeader';
import { getCurrentPosition } from '../../components/map/DirectionsMap';
import { DAY_NAMES, DAY_SHORT, time12 } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

export default function Markets() {
  useDocumentTitle('Farmers markets');
  const [filters, setFilters] = useState({ search: '', city: '', category: '', day: '' });
  const { data: catData } = useFetch('/categories');
  const [location, setLocation] = useState(null);
  const [view, setView] = useState('grid');
  const [locating, setLocating] = useState(false);
  const { toast } = useToast();
  const { data, loading } = useFetch(`/markets${toQuery({ ...filters, lat: location?.lat, lng: location?.lng })}`);
  const markets = data?.markets || [];

  async function nearMe() {
    setLocating(true);
    try {
      setLocation(await getCurrentPosition());
      toast('Showing markets closest to you');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLocating(false);
    }
  }

  return (
    <>
      <PageHero crumbs={[{ label: 'Markets' }]} title="Farmers markets" subtitle="Browse markets by location and day, see which farmers are there and get directions to the pickup point." />
      <div className="container pb-5">
        <div className="soft-panel mb-4">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-lg-6 col-xl-3">
              <div className="search-pill">
                <i className="bi bi-search" />
                <input placeholder="Search market or area" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} aria-label="Search markets" />
              </div>
            </div>
            <div className="col-4 col-lg-2">
              <select className="form-select" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} aria-label="City">
                <option value="">All cities</option>
                {(data?.cities || []).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-4 col-lg-2">
              <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} aria-label="Category">
                <option value="">All produce</option>
                {(catData?.categories || []).map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-4 col-lg-2">
              <select className="form-select" value={filters.day} onChange={(e) => setFilters({ ...filters, day: e.target.value })} aria-label="Market day">
                <option value="">Any day</option>
                {DAY_NAMES.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-xl-3 d-flex gap-2 justify-content-end">
              <button type="button" className={`btn text-nowrap flex-shrink-0 ${location ? 'btn-forest' : 'btn-white'}`} onClick={location ? () => setLocation(null) : nearMe} disabled={locating}>
                {locating ? <span className="spinner-border spinner-border-sm" /> : <i className={`bi ${location ? 'bi-check2-circle' : 'bi-crosshair'}`} />} Near me
              </button>
              <div className="tabs-pill flex-nowrap flex-shrink-0">
                <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view">
                  <i className="bi bi-grid" />
                </button>
                <button type="button" className={view === 'map' ? 'active' : ''} onClick={() => setView('map')} aria-label="Map view">
                  <i className="bi bi-map" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {view === 'map' ? (
          <MapView
            height={560}
            userLocation={location}
            markers={markets.map((m) => ({
              id: m._id,
              lat: m.latitude,
              lng: m.longitude,
              type: 'market',
              image: m.image,
              title: m.name,
              subtitle: `${m.operatingDays.map((d) => DAY_SHORT[d]).join(', ')} · ${time12(m.openTime)}–${time12(m.closeTime)}`,
              link: `/markets/${m.slug}`,
            }))}
          />
        ) : (
          <div className="row g-3 g-lg-4">
            {loading && !data ? (
              <CardSkeletons count={6} cols="col-sm-6 col-lg-4" height={320} />
            ) : (
              markets.map((m) => (
                <div key={m._id} className="col-sm-6 col-lg-4">
                  <MarketCard market={m} />
                </div>
              ))
            )}
          </div>
        )}
        {data && markets.length === 0 && <EmptyState title="No markets found" message="Try a different day, city or produce type." />}
      </div>
    </>
  );
}
