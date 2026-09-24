import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import ProductCard from '../../components/cards/ProductCard';
import FarmerCard from '../../components/cards/FarmerCard';
import MapView from '../../components/map/MapView';
import RatingStars from '../../components/common/RatingStars';
import { CardSkeletons } from '../../components/common/Loader';
import DayDots from '../../components/common/DayDots';
import CountUp from '../../components/common/CountUp';
import { DAY_NAMES, nextOccurrence, time12 } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/common/Avatar';
import useSeo from '../../hooks/useSeo';

const STEPS = [
  { icon: 'bi-search', title: 'Discover', text: 'See which farmers are at each market this week, what they have in stock and at what price.' },
  { icon: 'bi-basket2', title: 'Pre-order', text: 'Add items to your basket and reserve them before they sell out. No online payment needed.' },
  { icon: 'bi-clock-history', title: 'Pick a slot', text: "Choose a pickup date and time slot inside the farmer's market window." },
  { icon: 'bi-bag-check', title: 'Collect & pay', text: 'Get a “ready for pickup” alert, collect at the stall and pay the farmer in person.' },
];

function HeroSearch() {
  const navigate = useNavigate();
  return (
    <form
      className="search-pill mt-4"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q');
        navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
      }}
    >
      <i className="bi bi-search" />
      <input name="q" placeholder="Try “mangoes”, “sourdough” or “honey”…" aria-label="Search products" />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}

/** Finds the market that opens soonest (today counts if it has not closed yet). */
function useNextMarket(markets) {
  return useMemo(() => {
    if (!markets?.length) return null;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let best = null;
    for (const m of markets) {
      const [ch, cm] = m.closeTime.split(':').map(Number);
      const from = new Date(now);
      if (m.operatingDays.includes(now.getDay()) && nowMinutes < ch * 60 + cm) {
        if (!best || best.inDays > 0) best = { market: m, inDays: 0 };
        continue;
      }
      from.setDate(from.getDate() + 1);
      const next = nextOccurrence(m.operatingDays, from);
      if (next && (!best || next.inDays + 1 < best.inDays)) best = { market: m, inDays: next.inDays + 1, date: next.date };
    }
    return best;
  }, [markets]);
}

export default function Home() {
  useSeo({});
  const { user } = useAuth();
  const stats = useFetch('/stats');
  const cats = useFetch('/categories');
  const products = useFetch('/products?sort=popular&limit=8&inStock=true');
  const markets = useFetch('/markets');
  const farmers = useFetch('/farmers?limit=4');
  const reviews = useFetch('/testimonials');
  const next = useNextMarket(markets.data?.markets);

  const karachiMarkets = (markets.data?.markets || []).filter((m) => m.city === 'Karachi');
  const s = stats.data || {};

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="hero">
        <div className="container">
          <div className="bento">
            <div className="bento-cell hero-main">
              <div>
                <span className="chip hero-chip">
                  <span className="text-lime">●</span> This week's harvest is live
                </span>
                <h1 className="text-balance">
                  Fresh from local farms, <em>reserved</em> for you.
                </h1>
                <p className="lead">
                  Know which farmers are at the market, what's in stock and at what price — then pre-order and pick up at the stall. No wasted trips, no sold-out surprises.
                </p>
                <HeroSearch />
                <div className="quick-links d-flex flex-wrap gap-2 mt-3">
                  {(cats.data?.categories || []).slice(0, 4).map((c) => (
                    <Link key={c._id} to={`/products?category=${c.slug}`}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hero-stats mt-4">
                <div>
                  <div className="stat-num">
                    <CountUp value={s.markets} />
                  </div>
                  <div className="stat-label">Markets</div>
                </div>
                <div>
                  <div className="stat-num">
                    <CountUp value={s.farmers} />
                  </div>
                  <div className="stat-label">Local farmers</div>
                </div>
                <div>
                  <div className="stat-num">
                    <CountUp value={s.products} />
                  </div>
                  <div className="stat-label">Products this week</div>
                </div>
                <div>
                  <div className="stat-num">
                    <CountUp value={s.ordersCompleted} />
                  </div>
                  <div className="stat-label">Pickups done</div>
                </div>
              </div>
            </div>

            <div className="bento-cell hero-art">
              <img className="floaty" src="/illustrations/basket.webp" alt="" style={{ width: 150, right: '12%', top: '12%', '--r': '-6deg' }} />
              <img className="floaty" src="/illustrations/tomato.webp" alt="" style={{ width: 84, left: '10%', top: '10%', animationDelay: '-1s', '--r': '8deg' }} />
              <img className="floaty" src="/illustrations/carrot.webp" alt="" style={{ width: 76, left: '38%', top: '28%', animationDelay: '-2.5s', '--r': '-18deg' }} />
              <img className="floaty" src="/illustrations/strawberry.webp" alt="" style={{ width: 60, right: '6%', top: '58%', animationDelay: '-3.2s' }} />
              <img className="floaty" src="/illustrations/leafy-greens.webp" alt="" style={{ width: 70, left: '6%', top: '46%', animationDelay: '-1.7s', '--r': '10deg' }} />
              <div className="position-relative">
                <span className="eyebrow">Pickup only · Pay at the stall</span>
                <h3 className="mt-1">Pre-order. Pick up. Pay in person.</h3>
              </div>
            </div>

            <div className="bento-cell hero-next">
              <div>
                <span className="eyebrow text-forest">
                  <i className="bi bi-calendar-heart" /> Next market day
                </span>
                {next ? (
                  <>
                    <div className="big mt-2">{next.inDays === 0 ? 'Today' : next.inDays === 1 ? 'Tomorrow' : DAY_NAMES[next.date.getDay()]}</div>
                    <div className="fw-semi mt-1">{next.market.name}</div>
                    <div className="small">
                      {time12(next.market.openTime)} – {time12(next.market.closeTime)}
                    </div>
                  </>
                ) : (
                  <div className="skeleton mt-3" style={{ height: 70, background: 'rgba(255,255,255,.4)' }} />
                )}
              </div>
              {next && (
                <Link to={`/markets/${next.market.slug}`} className="link-arrow mt-2">
                  See who's selling <i className="bi bi-arrow-right" />
                </Link>
              )}
            </div>

            <div className="bento-cell hero-map">
              <div className="mini-map" aria-hidden="true">
                <MapView
                  height="100%"
                  interactive={false}
                  className="border-0 rounded-0"
                  markers={karachiMarkets.map((m) => ({ id: m._id, lat: m.latitude, lng: m.longitude, type: 'market', image: m.image, title: m.name }))}
                />
              </div>
              <Link to="/map">
                <span>
                  <i className="bi bi-map" /> Markets near you
                </span>
                <i className="bi bi-arrow-up-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- categories */}
      <section className="pb-4">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Shop by category</span>
              <h2 className="section-title">What's growing this week</h2>
            </div>
            <Link to="/products" className="link-arrow">
              All products <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="category-rail">
            {(cats.data?.categories || []).map((c) => (
              <Link key={c._id} to={`/products?category=${c.slug}`} className="category-tile" style={{ '--tile-bg': c.color }}>
                <img src={c.icon} alt="" />
                <strong>{c.name}</strong>
                <span>{c.productCount} items</span>
              </Link>
            ))}
            {cats.loading && <CardSkeletons count={6} cols="" height={160} />}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- products */}
      <section className="section pt-4">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Most loved</span>
              <h2 className="section-title">
                This week's <span className="italic-accent">harvest</span>
              </h2>
              <p>Popular picks from farmers near you — reserve yours before market day.</p>
            </div>
            <Link to="/products?sort=popular" className="link-arrow">
              Shop the market <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="row g-3 g-lg-4">
            {products.loading && !products.data ? (
              <CardSkeletons count={8} />
            ) : (
              products.data?.products.map((p) => (
                <div key={p._id} className="col-6 col-md-4 col-xl-3">
                  <ProductCard product={p} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- how it works */}
      <section className="section bg-sand">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow">How MarketLink works</span>
            <h2 className="section-title">From the field to your basket in four steps</h2>
          </div>
          <div className="row g-3 g-lg-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="col-sm-6 col-lg-3">
                <div className="step-card">
                  <span className="step-num">0{i + 1}</span>
                  <div className="step-icon">
                    <i className={`bi ${step.icon}`} />
                  </div>
                  <h5>{step.title}</h5>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- markets + map */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Markets</span>
              <h2 className="section-title">Find a market near you</h2>
              <p>Every market, its days and opening hours — with directions to the exact pickup point.</p>
            </div>
            <Link to="/markets" className="link-arrow">
              All markets <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="d-grid gap-2">
                {karachiMarkets.slice(0, 5).map((m) => (
                  <Link key={m._id} to={`/markets/${m.slug}`} className="farmer-mini">
                    <span className="logo" style={{ background: '#173b2c' }}>
                      <img src={m.image} alt="" />
                    </span>
                    <span className="flex-grow-1 min-w-0">
                      <strong className="d-block text-truncate">{m.name}</strong>
                      <span className="fs-7 text-muted-2 d-block text-truncate">
                        {time12(m.openTime)} – {time12(m.closeTime)} · {m.farmerCount} farmers
                      </span>
                    </span>
                    <span className="d-none d-sm-inline-flex">
                      <DayDots days={m.operatingDays} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-lg-7">
              <MapView
                height={430}
                markers={karachiMarkets.map((m) => ({
                  id: m._id,
                  lat: m.latitude,
                  lng: m.longitude,
                  type: 'market',
                  image: m.image,
                  title: m.name,
                  subtitle: `${time12(m.openTime)} – ${time12(m.closeTime)}`,
                  link: `/markets/${m.slug}`,
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- farmers */}
      <section className="section pt-0">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Meet the growers</span>
              <h2 className="section-title">Top-rated farmers</h2>
            </div>
            <Link to="/farmers" className="link-arrow">
              All farmers <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="row g-3 g-lg-4">
            {farmers.loading && !farmers.data ? (
              <CardSkeletons count={4} height={330} />
            ) : (
              farmers.data?.farmers.map((f) => (
                <div key={f._id} className="col-sm-6 col-xl-3">
                  <FarmerCard farmer={f} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- testimonials */}
      {reviews.data?.reviews?.length > 0 && (
        <section className="section bg-sand">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Community</span>
                <h2 className="section-title">Loved by early risers and market regulars</h2>
              </div>
            </div>
            <div className="row g-3 g-lg-4">
              {reviews.data.reviews.slice(0, 3).map((r) => (
                <div key={r._id} className="col-md-4">
                  <figure className="quote-card">
                    <RatingStars value={r.rating} />
                    <blockquote>“{r.comment}”</blockquote>
                    <figcaption className="d-flex align-items-center gap-2 mt-auto">
                      <Avatar name={r.customer?.name} src={r.customer?.avatar} className="avatar-sm" />
                      <span className="small">
                        <strong className="d-block">{r.customer?.name}</strong>
                        <span className="text-muted-2">
                          about <Link to={`/farmers/${r.farmer?.slug}`}>{r.farmer?.stallName}</Link>
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- farmer CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <img className="cta-art" src="/illustrations/tractor.webp" alt="" />
            <div className="row">
              <div className="col-lg-7">
                <span className="eyebrow text-lime">For farmers</span>
                <h2 className="section-title mt-2">Plan your harvest. Sell before you pack the truck.</h2>
                <p className="mb-4">
                  Publish your weekly stock and prices, take pre-orders with pickup slots and see your best sellers — all from one simple dashboard. Free to join.
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  {!user && (
                    <Link to="/register/farmer" className="btn btn-lime btn-lg">
                      Register your stall
                    </Link>
                  )}
                  <Link to="/about" className="btn btn-outline-light btn-lg">
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
