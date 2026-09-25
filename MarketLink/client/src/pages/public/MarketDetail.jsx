import { Link, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import DirectionsMap from '../../components/map/DirectionsMap';
import DayDots from '../../components/common/DayDots';
import FavButton from '../../components/common/FavButton';
import ProductCard from '../../components/cards/ProductCard';
import RatingStars from '../../components/common/RatingStars';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { DAY_NAMES, DAY_SHORT, time12 } from '../../utils/format';
import PhotoCredit from '../../components/common/PhotoCredit';
import useSeo from '../../hooks/useSeo';
import { breadcrumbLd, clip, ldGraph, marketLd } from '../../utils/seo';

export default function MarketDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/markets/${slug}`);
  const m = data?.market;
  useSeo(
    m
      ? {
          title: `${m.name}, farmers market${m.city ? ` in ${m.city}` : ''}`,
          description: clip(m.description || `${m.name}, ${m.address}. See the farmers, opening days and pre-order on MarketLink.`),
          image: m.image,
          jsonLd: ldGraph(marketLd(m), breadcrumbLd([{ name: 'Markets', path: '/markets' }, { name: m.name, path: `/markets/${m.slug}` }])),
          canonicalPath: `/markets/${m.slug}`,
        }
      : { title: 'Market' }
  );

  if (loading && !data) return <PageLoader />;
  if (error)
    return (
      <div className="container py-5">
        <EmptyState title="Market not found" action={<Link to="/markets" className="btn btn-primary">All markets</Link>} />
      </div>
    );

  const { market, farmers, products, productCount } = data;

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/markets">Markets</Link></li>
          <li className="breadcrumb-item active">{market.name}</li>
        </ol>
      </nav>

      <div className="market-hero mb-4">
        {market.image && <img className="market-photo" src={market.image} alt={market.name} />}
        <PhotoCredit credit={market.imageCredit} />
        <div style={{ maxWidth: 640 }}>
          <span className="chip chip-lime mb-3">
            <i className="bi bi-geo-alt-fill" /> {market.city}
          </span>
          <h1 className="text-balance">{market.name}</h1>
          <p className="mb-4">{market.description}</p>
          <div className="d-flex flex-wrap gap-4 align-items-center mb-4">
            <div>
              <div className="fs-7 text-uppercase ls-wide mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Open on</div>
              <DayDots days={market.operatingDays} />
            </div>
            <div>
              <div className="fs-7 text-uppercase ls-wide mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Hours</div>
              <strong>
                {time12(market.openTime)} to {time12(market.closeTime)}
              </strong>
            </div>
            <div>
              <div className="fs-7 text-uppercase ls-wide mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Farmers</div>
              <strong>{farmers.length}</strong>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <FavButton type="markets" id={market._id} withLabel />
            <Link to={`/products?market=${market._id}`} className="btn btn-lime">
              <i className="bi bi-basket" /> Shop this market ({productCount})
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="soft-panel h-100">
            <h2 className="h4 mb-1">Location & directions</h2>
            <p className="small text-muted-2 mb-3">
              <i className="bi bi-geo-alt" /> {market.address}
              {market.mapLink && (
                <a href={market.mapLink} target="_blank" rel="noreferrer" className="ms-2 fw-semi">
                  <i className="bi bi-box-arrow-up-right" /> Open on {market.mapProvider === 'google' ? 'Google Maps' : 'OpenStreetMap'}
                </a>
              )}
            </p>
            <DirectionsMap
              destination={{ lat: market.latitude, lng: market.longitude, title: market.name, subtitle: market.address, image: market.image }}
              extraMarkers={farmers
                .filter((f) => f.latitude)
                .map((f) => ({ id: f._id, lat: f.latitude, lng: f.longitude, type: 'farmer', image: f.logo, title: f.stallName, subtitle: 'Farmer stall', link: `/farmers/${f.slug}` }))}
              height={360}
            />
          </div>
        </div>
        <div className="col-lg-5">
          <div className="soft-panel h-100">
            <h2 className="h4 mb-3">Farmers at this market</h2>
            {farmers.length === 0 && <p className="text-muted-2">No farmers have joined this market yet.</p>}
            <div className="d-grid gap-2">
              {farmers.map((f) => (
                <Link key={f._id} to={`/farmers/${f.slug}`} className="farmer-mini">
                  <span className="logo">
                    <img src={f.logo} alt="" />
                  </span>
                  <span className="flex-grow-1 min-w-0">
                    <strong className="d-block">{f.stallName}</strong>
                    <RatingStars value={f.ratingAvg} count={f.ratingCount} />
                    <span className="d-block fs-7 text-muted-2 mt-1">
                      {f.pickupWindows.map((w) => `${DAY_SHORT[w.day]} ${time12(w.start)} to ${time12(w.end)}`).join(' · ') || `Sells on ${f.operatingDays.map((d) => DAY_NAMES[d]).join(', ')}`}
                    </span>
                  </span>
                  <i className="bi bi-chevron-right" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {products.length > 0 && (
        <section className="section pb-0">
          <div className="section-head">
            <div>
              <span className="eyebrow">Available here</span>
              <h2 className="section-title">Popular at {market.name.split(' ').slice(0, 2).join(' ')}</h2>
            </div>
            <Link to={`/products?market=${market._id}`} className="link-arrow">
              See all {productCount} <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="row g-3 g-lg-4">
            {products.map((p) => (
              <div key={p._id} className="col-6 col-md-4 col-xl-3">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
