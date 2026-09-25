import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import ProductCard from '../../components/cards/ProductCard';
import FarmerCard from '../../components/cards/FarmerCard';
import MapView from '../../components/map/MapView';
import { CardSkeletons } from '../../components/common/Loader';
import { Bone } from '../../components/common/Skeletons';
import DayDots from '../../components/common/DayDots';
import CountUp from '../../components/common/CountUp';
import GlobalSearch from '../../components/layout/GlobalSearch';
import HeroCarousel from '../../components/home/HeroCarousel';
import VideoTour from '../../components/home/VideoTour';
import MarketMoments from '../../components/home/MarketMoments';
import ReviewsShowcase from '../../components/home/ReviewsShowcase';
import NewsletterCta from '../../components/home/NewsletterCta';
import HomeFaq from '../../components/home/HomeFaq';
import { DAY_NAMES, nextOccurrence, time12 } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import useSeo from '../../hooks/useSeo';
import { homeLd } from '../../utils/seo';
import { t } from '../../i18n';

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

const STATS = [
  { key: 'markets', label: 'Markets', icon: 'bi-shop-window' },
  { key: 'farmers', label: 'Local farmers', icon: 'bi-people' },
  { key: 'products', label: 'Products this week', icon: 'bi-basket2' },
  { key: 'ordersCompleted', label: 'Pickups done', icon: 'bi-bag-check' },
];

/** Search box with categories, key numbers and the next market day, just under the banner. */
function SearchCard({ stats, next, categories }) {
  return (
    <section className="search-card-wrap" aria-label={t('Search and quick facts')}>
      <div className="container">
        <div className="search-card">
          <div className="row g-3 align-items-center">
            <div className="col-lg-8">
              <label className="search-card-label" htmlFor="home-search">
                {t('What would you like to buy today?')}
              </label>
              <GlobalSearch withCategory size="lg" inputId="home-search" placeholder={t('Try mangoes, sourdough or honey…')} />
              <div className="quick-cats" aria-label={t('Popular categories')}>
                {categories === null
                  ? [0, 1, 2, 3, 4].map((i) => <Bone key={i} w={96} h={30} r="50rem" />)
                  : categories.slice(0, 6).map((c) => (
                      <Link key={c._id} to={`/products?category=${c.slug}`} style={{ '--chip-bg': c.color }}>
                        <img src={c.icon} alt="" />
                        {c.name}
                      </Link>
                    ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="next-market">
                <span className="next-market-icon">
                  <i className="bi bi-calendar-heart" aria-hidden="true" />
                </span>
                {next ? (
                  <span className="min-w-0">
                    <span className="d-block small fw-semi text-muted-2">{t('Next market day')}</span>
                    <strong className="d-block">
                      {next.inDays === 0 ? t('Today') : next.inDays === 1 ? t('Tomorrow') : DAY_NAMES[next.date.getDay()]}, {time12(next.market.openTime)}
                    </strong>
                    <Link to={`/markets/${next.market.slug}`} className="small text-truncate d-block">
                      {next.market.name} <i className="bi bi-arrow-right" aria-hidden="true" />
                    </Link>
                  </span>
                ) : (
                  <span className="flex-grow-1">
                    <Bone w="50%" h={12} />
                    <Bone w="80%" h={18} className="mt-2" />
                    <Bone w="65%" h={12} className="mt-2" />
                  </span>
                )}
              </div>
            </div>
          </div>
          <dl className="home-stats">
            {STATS.map((s) => (
              <div key={s.key}>
                <dt>
                  <i className={`bi ${s.icon}`} aria-hidden="true" /> {t(s.label)}
                </dt>
                <dd>{stats ? <CountUp value={stats[s.key]} /> : <Bone w={56} h={26} />}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const faqs = useFetch('/faqs?home=1');
  useSeo({ jsonLd: homeLd(faqs.data?.faqs) });
  const { user } = useAuth();
  const stats = useFetch('/stats');
  const cats = useFetch('/categories');
  const products = useFetch('/products?sort=popular&limit=8&inStock=true');
  const markets = useFetch('/markets');
  const farmers = useFetch('/farmers?limit=4');
  const reviews = useFetch('/testimonials');
  const next = useNextMarket(markets.data?.markets);

  const karachiMarkets = (markets.data?.markets || []).filter((m) => m.city === 'Karachi');
  const categories = cats.data?.categories || null;

  return (
    <>
      <HeroCarousel />
      <SearchCard stats={stats.data} next={next} categories={categories} />

      {/* ---------------------------------------------------------- categories */}
      <section className="section pb-4" aria-labelledby="cats-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{t('Shop by category')}</span>
              <h2 id="cats-title" className="section-title">{t('What\'s growing this week')}</h2>
            </div>
            <Link to="/products" className="link-arrow">
              {t('All products')} <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="category-rail">
            {categories
              ? categories.map((c) => (
                  <Link key={c._id} to={`/products?category=${c.slug}`} className="category-tile" style={{ '--tile-bg': c.color }}>
                    <img src={c.icon} alt="" />
                    <strong>{c.name}</strong>
                    <span>{c.productCount} {t('items')}</span>
                  </Link>
                ))
              : Array.from({ length: 8 }, (_, i) => <Bone key={i} h={150} r="1.3rem" className="category-bone" />)}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- products */}
      <section className="section pt-4" aria-labelledby="harvest-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{t('Most loved')}</span>
              <h2 id="harvest-title" className="section-title">
                {t('This week\'s')} <span className="italic-accent">{t('harvest')}</span>
              </h2>
              <p>{t('Popular picks from farmers near you. Reserve yours before market day.')}</p>
            </div>
            <Link to="/products?sort=popular" className="link-arrow">
              {t('Shop the market')} <i className="bi bi-arrow-right" />
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

      <VideoTour />

      {/* ---------------------------------------------------------- markets + map */}
      <section className="section" aria-labelledby="markets-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{t('Markets')}</span>
              <h2 id="markets-title" className="section-title">{t('Find a market near you')}</h2>
              <p>{t('Every market, its days and opening hours, with directions to the exact pickup point.')}</p>
            </div>
            <Link to="/markets" className="link-arrow">
              {t('All markets')} <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="d-grid gap-2">
                {markets.loading && !markets.data
                  ? [0, 1, 2, 3, 4].map((i) => <Bone key={i} h={64} r="1rem" />)
                  : karachiMarkets.slice(0, 5).map((m) => (
                      <Link key={m._id} to={`/markets/${m.slug}`} className="farmer-mini">
                        <span className="logo" style={{ background: '#173b2c' }}>
                          <img src={m.image} alt="" />
                        </span>
                        <span className="flex-grow-1 min-w-0">
                          <strong className="d-block text-truncate">{m.name}</strong>
                          <span className="fs-7 text-muted-2 d-block text-truncate">
                            {time12(m.openTime)} {t('to')} {time12(m.closeTime)} · {m.farmerCount} {t('farmers')}
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
                height={400}
                markers={karachiMarkets.map((m) => ({
                  id: m._id,
                  lat: m.latitude,
                  lng: m.longitude,
                  type: 'market',
                  image: m.image,
                  title: m.name,
                  subtitle: `${time12(m.openTime)} to ${time12(m.closeTime)}`,
                  link: `/markets/${m.slug}`,
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- farmers */}
      <section className="section pt-0" aria-labelledby="farmers-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{t('Meet the growers')}</span>
              <h2 id="farmers-title" className="section-title">{t('Top-rated farmers')}</h2>
            </div>
            <Link to="/farmers" className="link-arrow">
              {t('All farmers')} <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="row g-3 g-lg-4">
            {farmers.loading && !farmers.data ? (
              <CardSkeletons count={4} cols="col-sm-6 col-xl-3" height={330} />
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

      <MarketMoments />
      <ReviewsShowcase data={reviews.data} loading={reviews.loading} />
      <HomeFaq faqs={faqs.data?.faqs} loading={faqs.loading} />
      <NewsletterCta variant="band" source="home" />

      {/* ---------------------------------------------------------- farmer CTA */}
      <section className="section pt-0">
        <div className="container">
          <div className="cta-band">
            <img className="cta-photo" src="/images/hero/cta-farmer.webp" alt={t('A farmer harvesting rice')} loading="lazy" />
            <div className="row">
              <div className="col-lg-7">
                <span className="eyebrow text-lime">{t('For farmers')}</span>
                <h2 className="section-title mt-2">{t('Plan your harvest. Sell before you pack the truck.')}</h2>
                <p className="mb-4">{t('Publish your weekly stock and prices, take pre-orders with pickup times and see your best sellers, all from one simple dashboard. Free to join.')}</p>
                <div className="d-flex gap-2 flex-wrap">
                  {!user && (
                    <Link to="/register/farmer" className="btn btn-lime btn-lg">
                      {t('Register your stall')}
                    </Link>
                  )}
                  <Link to="/about" className="btn btn-outline-light btn-lg">
                    {t('Learn more')}
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
