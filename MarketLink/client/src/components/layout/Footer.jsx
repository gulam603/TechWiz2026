import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import SocialLinks from '../common/SocialLinks';
import NewsletterCta from '../home/NewsletterCta';
import { CONTACT, TEAM_NAME } from '../../config';

export default function Footer() {
  // The home page has its own large newsletter block, so the footer form is not repeated there
  const { pathname } = useLocation();
  return (
    <footer className="ml-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <Logo light />
            <p className="mt-3 small" style={{ maxWidth: 340 }}>
              MarketLink brings local farmers markets online. See what's in stock before you go, pre-order for pickup and support the growers in your community.
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <span className="chip chip-lime">
                <i className="bi bi-cash-coin" /> Pay at pickup
              </span>
              <span className="chip">
                <i className="bi bi-geo-alt" /> Pickup only
              </span>
            </div>
            <SocialLinks className="mt-3" />
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <h6>Shop</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All products</Link></li>
              <li><Link to="/markets">Markets</Link></li>
              <li><Link to="/farmers">Farmers</Link></li>
              <li><Link to="/map">Market map</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <h6>For farmers</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/register/farmer">Register your stall</Link></li>
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/about">How it works</Link></li>
            </ul>
          </div>
          <div className="col-md-4 col-lg-2">
            <h6>Help &amp; legal</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/contact">Contact us</Link></li>
              <li><Link to="/about">About MarketLink</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/terms#terms-privacy">Privacy</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 d-none d-lg-block">
            <h6>Contact</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li>{CONTACT.phone}</li>
            </ul>
          </div>
        </div>
        <div className="row g-4 footer-extra">
          {pathname !== '/' && (
            <div className="col-lg-6">
              <NewsletterCta variant="footer" source="footer" />
            </div>
          )}
          <div className="col-lg-6">
            <h6>Visit us</h6>
            <ul className="list-unstyled d-grid gap-2 small mb-0">
              <li><i className="bi bi-geo-alt me-2" />{CONTACT.address}</li>
              <li className="d-lg-none"><i className="bi bi-envelope me-2" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li className="d-lg-none"><i className="bi bi-telephone me-2" />{CONTACT.phone}</li>
              <li><i className="bi bi-clock me-2" />{CONTACT.hours}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom d-flex flex-wrap justify-content-between gap-2">
          <span>
            © {new Date().getFullYear()} MarketLink · eGreen Basket · Built by <Link to="/about">{TEAM_NAME}</Link> · <Link to="/terms">Terms &amp; Conditions</Link>
          </span>
          <span>
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> · Photos: Open Images (CC BY 2.0) · Illustrations: Microsoft Fluent (MIT)
          </span>
        </div>
      </div>
    </footer>
  );
}
