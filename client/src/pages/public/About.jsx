import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useFetch from '../../hooks/useFetch';
import { PageHero } from '../../components/common/PageHeader';
import { TEAM } from '../../config';
import { initials } from '../../utils/format';

const VALUES = [
  { img: '/illustrations/leafy-greens.webp', color: '#e4f3d8', title: 'Fewer wasted trips', text: 'Customers see live stock and prices before leaving home, so nobody arrives to an empty stall.' },
  { img: '/illustrations/wheat.webp', color: '#f8e8cf', title: 'Better harvest planning', text: 'Pre-orders tell farmers exactly how much to pick and bring, reducing food waste.' },
  { img: '/illustrations/farmer.webp', color: '#fde7d6', title: 'Real relationships', text: 'Favourites, reviews and replies build a lasting connection between growers and families.' },
  { img: '/illustrations/cart.webp', color: '#e3eefb', title: 'Simple & fair', text: 'No online payments, no delivery fees. Reserve online, collect and pay the farmer in person.' },
];

export default function About() {
  useDocumentTitle('About us');
  const { data } = useFetch('/stats');
  return (
    <>
      <PageHero crumbs={[{ label: 'About' }]} title="Bringing the farmers market online — without losing its soul" subtitle="MarketLink (theme: eGreen Basket) is a platform that connects local farmers-market stalls with the families who shop there." />
      <div className="container pb-5">
        <div className="row g-4 align-items-stretch mb-5">
          <div className="col-lg-7">
            <div className="soft-panel h-100">
              <span className="eyebrow">Why we built it</span>
              <h2 className="h3 mt-2">The problem</h2>
              <p className="text-muted-2">
                Local markets are growing, but availability is still shared on chalkboards, flyers and by word of mouth. Shoppers arrive to find popular items sold out or a stall
                closed for the week, and farmers have no easy way to publish weekly stock or take orders in advance.
              </p>
              <h2 className="h3 mt-4">Our solution</h2>
              <p className="text-muted-2 mb-0">
                Farmers publish their weekly stock, prices and pickup windows. Customers find nearby markets on the map, browse and filter products, pre-order for a pickup slot, and
                leave reviews after collecting. Admins keep the platform healthy by approving farmers, managing markets and moderating content. An AI assistant answers everyday
                questions like market timings and pickup windows.
              </p>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="cta-band h-100 d-flex flex-column justify-content-center">
              <div className="row g-3 text-center">
                {[
                  [data?.markets, 'Markets'],
                  [data?.farmers, 'Farmers'],
                  [data?.products, 'Products'],
                  [data?.ordersCompleted, 'Pickups'],
                ].map(([n, label]) => (
                  <div key={label} className="col-6">
                    <div className="display-font text-lime" style={{ fontSize: '2.6rem' }}>
                      {n ?? '–'}
                    </div>
                    <div className="small text-uppercase ls-wide" style={{ color: 'rgba(255,255,255,.7)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">What we care about</span>
            <h2 className="section-title">Our values</h2>
          </div>
        </div>
        <div className="row g-3 mb-5">
          {VALUES.map((v) => (
            <div key={v.title} className="col-sm-6 col-lg-3">
              <div className="value-card" style={{ '--tile-bg': v.color }}>
                <img src={v.img} alt="" />
                <h5>{v.title}</h5>
                <p className="small mb-0">{v.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">The team</span>
            <h2 className="section-title">Who built MarketLink</h2>
            <p>Created for the TechWiz 2026 “End-to-End Web Solutions” challenge.</p>
          </div>
        </div>
        <div className="row g-3 mb-5">
          {TEAM.map((m) => (
            <div key={m.name} className="col-sm-6 col-lg-3">
              <div className="team-card">
                <span className="avatar">{initials(m.name)}</span>
                <h5 className="mb-1">{m.name}</h5>
                <p className="small text-muted-2 mb-0">{m.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="soft-panel d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h3 className="h4 mb-1">Have questions?</h3>
            <p className="text-muted-2 mb-0">Our team is happy to help farmers and shoppers get started.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/contact" className="btn btn-primary">
              Contact us
            </Link>
            <Link to="/register/farmer" className="btn btn-lime">
              Become a seller
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
