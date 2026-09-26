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
import Testimonials from '../../components/home/Testimonials';
import HomeFaq from '../../components/home/HomeFaq';
import { DAY_NAMES, nextOccurrence, time12 } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import useSeo from '../../hooks/useSeo';
import { homeLd } from '../../utils/seo';
import { categoryName, isUrdu, t } from '../../i18n';

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

const REASONS = [
  { icon: 'bi-geo-alt', title: 'Grown near you', text: 'Every farmer sells at a market in your city, so the food travels less and reaches you fresh.' },
  { icon: 'bi-tags', title: 'Fair prices', text: 'Farmers set their own prices and MarketLink is free for them to join. No middlemen.' },
  { icon: 'bi-patch-check', title: 'Reviews you can trust', text: 'Only customers who collected their order can leave a verified review.' },
  { icon: 'bi-hourglass-split', title: 'No waiting in line', text: 'Your order is packed before you arrive. Pick it up in the time slot you chose.' },
];

/** Section title with an optional "see all" link on the other side. */
function SectionHead({ id, eyebrow, title, text, link }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 id={id} className="section-title">
          {title}
        </h2>
        {text && <p>{text}</p>}
      </div>
      {link && (
        <Link to={link.to} className="link-arrow">
          {link.label} <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Search box and the next market day, just under the banner. */
function SearchCard({ next }) {
  return (
    <section className="search-card-wrap" aria-label={t('Search')}>
      <div className="container">
        <div className="search-card">
          <div className="search-card-main">
            <label className="search-card-label" htmlFor="home-search">
              {t('What would you like to buy today?')}
            </label>
            <GlobalSearch withCategory size="lg" inputId="home-search" placeholder={t('Try mangoes, sourdough or honey…')} />
          </div>
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
    </section>
  );
}

/** Category cards with a photo, the name and how many items are in stock. */
function CategoryCards({ categories }) {
  return (
    <section className="section pb-0" aria-labelledby="cats-title">
      <div className="container">
        <SectionHead id="cats-title" eyebrow={t('Shop by category')} title={t('What\'s growing this week')} link={{ to: '/products', label: t('All products') }} />
        <div className="cat-cards">
          {categories
            ? categories.map((c) => (
                <Link key={c._id} to={`/products?category=${c.slug}`} className="cat-card" style={{ '--cat-bg': c.color }}>
                  <span className="cat-card-photo">
                    <img src={c.image || c.icon} alt="" loading="lazy" />
                  </span>
                  <span className="cat-card-body">
                    <strong>{categoryName(c)}</strong>
                    <span>{t('{n} items', { n: c.productCount })}</span>
                  </span>
                  <i className="bi bi-arrow-right cat-card-go" aria-hidden="true" />
                </Link>
              ))
            : Array.from({ length: 8 }, (_, i) => <Bone key={i} h={210} r="1.1rem" className="cat-card-bone" />)}
        </div>
      </div>
    </section>
  );
}

/** "Up to 30% off" banner, built from the offers farmers really run this week. */
function DealBanner({ stats }) {
  const deals = stats?.deals;
  const category = deals?.category;
  const title = deals
    ? category
      ? t('Up to {n}% off fresh {category}', { n: deals.maxPercent, category: isUrdu() ? categoryName(category) : category.name.toLowerCase() })
      : t('Up to {n}% off this week', { n: deals.maxPercent })
    : t('Fresh vegetables, straight from the farm');
  return (
    <section className="section pb-0" aria-labelledby="deal-title">
      <div className="container">
        <div className="deal-banner">
          <img className="deal-photo" src="/images/banners/deal-vegetables.webp" alt={t('Fresh vegetables at a market stall')} loading="lazy" width="1024" height="640" />
          <div className="deal-copy">
            <span className="deal-tag">
              <i className="bi bi-lightning-charge-fill" aria-hidden="true" /> {deals ? t('This week\'s offers') : t('In season now')}
            </span>
            <h2 id="deal-title">{stats ? title : <Bone w="70%" h={34} />}</h2>
            <p>{deals ? t('{n} products on offer from local farmers. Offers end when the stock runs out.', { n: deals.count }) : t('Picked this week by farmers near you. Pre-order now and collect it on market day.')}</p>
            <Link to={deals ? '/products?deals=true' : '/products?category=vegetables'} className="btn btn-lime btn-lg">
              {deals ? t('Shop the offers') : t('Shop vegetables')} <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Popular products: a row to swipe on phones, a grid on larger screens. */
function TopPicks({ products }) {
  return (
    <section className="section pb-0" aria-labelledby="harvest-title">
      <div className="container">
        <SectionHead id="harvest-title" eyebrow={t('Most loved')} title={t('Top picks this week')} text={t('Popular picks from farmers near you. Reserve yours before market day.')} link={{ to: '/products?sort=popular', label: t('Shop the market') }} />
        <div className="product-rail">
          {products.loading && !products.data
            ? Array.from({ length: 4 }, (_, i) => <Bone key={i} h={330} r="1.1rem" className="product-rail-item" />)
            : products.data?.products.map((p) => (
                <div key={p._id} className="product-rail-item">
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="section" aria-labelledby="why-title">
      <div className="container">
        <div className="why-grid">
          <div className="why-photo">
            <img src="/images/hero/pickup.webp" alt={t('Crates of fresh produce ready at a market stall')} loading="lazy" />
            <span className="why-photo-note">
              <i className="bi bi-bag-check-fill" aria-hidden="true" /> {t('Packed and waiting at the stall')}
            </span>
          </div>
          <div>
            <span className="eyebrow">{t('Why choose us')}</span>
            <h2 id="why-title" className="section-title">{t('The easy way to buy from local farmers')}</h2>
            <ul className="why-list">
              {REASONS.map((r) => (
                <li key={r.title}>
                  <span className="why-icon">
                    <i className={`bi ${r.icon}`} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{t(r.title)}</strong>
                    <span>{t(r.text)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** "From our farms to your table": the real numbers and an invitation to farmers. */
function FarmStory({ stats, user }) {
  return (
    <section className="section pt-0" aria-labelledby="story-title">
      <div className="container">
        <div className="story-band">
          <img className="story-photo" src="/images/hero/cta-farmer.webp" alt={t('A farmer harvesting rice')} loading="lazy" />
          <div className="story-copy">
            <span className="eyebrow text-lime">{t('For farmers')}</span>
            <h2 id="story-title" className="section-title">{t('From our farms to your table')}</h2>
            <p>{t('Publish your weekly stock and prices, take pre-orders with pickup times and see your best sellers, all from one simple dashboard. Free to join.')}</p>
            <dl className="story-stats">
              {STATS.map((s) => (
                <div key={s.key}>
                  <dd>{stats ? <CountUp value={stats[s.key]} /> : <Bone w={56} h={28} />}</dd>
                  <dt>{t(s.label)}</dt>
                </div>
              ))}
            </dl>
            <div className="d-flex gap-2 flex-wrap">
              {!user && (
                <Link to="/register/farmer" className="btn btn-lime btn-lg">
                  {t('Register your stall')}
                </Link>
              )}
              <Link to="/farmers" className="btn btn-outline-light btn-lg">
                {t('Meet the farmers')}
              </Link>
            </div>
          </div>
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

  return (
    <>
      <HeroCarousel />
      <SearchCard next={next} />
      <CategoryCards categories={cats.data?.categories || null} />
      <TopPicks products={products} />
      <DealBanner stats={stats.data} />
      <WhyChooseUs />
      <VideoTour />

      {/* ---------------------------------------------------------- markets + map */}
      <section className="section" aria-labelledby="markets-title">
        <div className="container">
          <SectionHead id="markets-title" eyebrow={t('Markets')} title={t('Find a market near you')} text={t('Every market, its days and opening hours, with directions to the exact pickup point.')} link={{ to: '/markets', label: t('All markets') }} />
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
                  subtitle: t('{from} to {to}', { from: time12(m.openTime), to: time12(m.closeTime) }),
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
          <SectionHead id="farmers-title" eyebrow={t('Meet the growers')} title={t('Top-rated farmers')} link={{ to: '/farmers', label: t('All farmers') }} />
          <div className="row g-3 g-lg-4">
            {farmers.loading && !farmers.data ? (
              <CardSkeletons count={4} cols="col-sm-6 col-xl-3" height={330} />
            ) : (
              farmers.data?.farmers.map((f) => (
                <div key={f._id} className="col-sm-6 col-xl-3">
                  <FarmerCard farmer={f} showLocation />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <FarmStory stats={stats.data} user={user} />
      <Testimonials data={reviews.data} loading={reviews.loading} />
      <HomeFaq faqs={faqs.data?.faqs} loading={faqs.loading} />
    </>
  );
}
