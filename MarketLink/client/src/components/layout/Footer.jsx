import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import SocialLinks from '../common/SocialLinks';
import NewsletterCta from '../home/NewsletterCta';
import { CONTACT, TEAM_NAME } from '../../config';
import { t } from '../../i18n';
import { LanguageSwitch } from '../../i18n/LanguageProvider';

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
              {t('MarketLink brings local farmers markets online. See what\'s in stock before you go, pre-order for pickup and support the growers in your community.')}
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <span className="chip chip-lime">
                <i className="bi bi-cash-coin" /> {t('Pay at pickup')}
              </span>
              <span className="chip">
                <i className="bi bi-geo-alt" /> {t('Pickup only')}
              </span>
            </div>
            <SocialLinks className="mt-3" />
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <h6>{t('Shop')}</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/">{t('Home')}</Link></li>
              <li><Link to="/products">{t('All products')}</Link></li>
              <li><Link to="/markets">{t('Markets')}</Link></li>
              <li><Link to="/farmers">{t('Farmers')}</Link></li>
              <li><Link to="/map">{t('Market map')}</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <h6>{t('For farmers')}</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/register/farmer">{t('Register your stall')}</Link></li>
              <li><Link to="/login">{t('Log in')}</Link></li>
              <li><Link to="/about">{t('How it works')}</Link></li>
            </ul>
          </div>
          <div className="col-md-4 col-lg-2">
            <h6>{t('Help & legal')}</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/faq">{t('FAQs')}</Link></li>
              <li><Link to="/contact">{t('Contact us')}</Link></li>
              <li><Link to="/about">{t('About MarketLink')}</Link></li>
              <li><Link to="/terms">{t('Terms & Conditions')}</Link></li>
              <li><Link to="/terms#terms-privacy">{t('Privacy')}</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 d-none d-lg-block">
            <h6>{t('Contact')}</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><bdi dir="ltr">{CONTACT.phone}</bdi></li>
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
            <h6>{t('Visit us')}</h6>
            <ul className="list-unstyled d-grid gap-2 small mb-0">
              <li><i className="bi bi-geo-alt me-2" />{t(CONTACT.address)}</li>
              <li className="d-lg-none"><i className="bi bi-envelope me-2" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li className="d-lg-none"><i className="bi bi-telephone me-2" /><bdi dir="ltr">{CONTACT.phone}</bdi></li>
              <li><i className="bi bi-clock me-2" />{t(CONTACT.hours)}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom d-flex flex-wrap justify-content-between gap-2">
          <span>
            © {new Date().getFullYear()} {t('MarketLink · eGreen Basket · Built by')} <Link to="/about">{TEAM_NAME}</Link> · <Link to="/terms">{t('Terms & Conditions')}</Link>
          </span>
          <LanguageSwitch className="lang-switch-footer" />
          <span>
            {t('Map data ©')} <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">{t('OpenStreetMap')}</a> {t('· Photos: Open Images (CC BY 2.0)')}
          </span>
        </div>
      </div>
    </footer>
  );
}
