import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { CONTACT, TEAM_NAME } from '../../config';

export default function Footer() {
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
          </div>
          <div className="col-6 col-lg-2">
            <h6>Shop</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/products">All products</Link></li>
              <li><Link to="/markets">Markets</Link></li>
              <li><Link to="/farmers">Farmers</Link></li>
              <li><Link to="/map">Market map</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h6>For farmers</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/register/farmer">Register your stall</Link></li>
              <li><Link to="/login">Farmer login</Link></li>
              <li><Link to="/about">How it works</Link></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h6>Contact</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><i className="bi bi-geo-alt me-2" />{CONTACT.address}</li>
              <li><i className="bi bi-envelope me-2" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><i className="bi bi-telephone me-2" />{CONTACT.phone}</li>
              <li><i className="bi bi-clock me-2" />{CONTACT.hours}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom d-flex flex-wrap justify-content-between gap-2">
          <span>
            © {new Date().getFullYear()} MarketLink · eGreen Basket · Built by <Link to="/about">{TEAM_NAME}</Link>
          </span>
          <span>
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> · Photos: Open Images (CC BY 2.0) · Illustrations: Microsoft Fluent (MIT) · <Link to="/terms">Terms</Link> ·{' '}
            <Link to="/admin/login">Admin</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
