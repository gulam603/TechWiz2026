import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const TABS = {
  guest: [
    { to: '/', icon: 'bi-house', label: 'Home', end: true },
    { to: '/products', icon: 'bi-shop', label: 'Shop' },
    { to: '/map', icon: 'bi-map', label: 'Map' },
    { to: '/cart', icon: 'bi-basket2', label: 'Basket', cart: true },
    { to: '/login', icon: 'bi-person-circle', label: 'Log in' },
  ],
  customer: [
    { to: '/', icon: 'bi-house', label: 'Home', end: true },
    { to: '/products', icon: 'bi-shop', label: 'Shop' },
    { to: '/map', icon: 'bi-map', label: 'Map' },
    { to: '/cart', icon: 'bi-basket2', label: 'Basket', cart: true },
    { to: '/account', icon: 'bi-person-circle', label: 'Account' },
  ],
  farmer: [
    { to: '/farmer', icon: 'bi-graph-up-arrow', label: 'Stall', end: true },
    { to: '/farmer/orders', icon: 'bi-receipt', label: 'Orders' },
    { to: '/farmer/products', icon: 'bi-basket', label: 'Stock' },
    { to: '/farmer/pickup', icon: 'bi-geo-alt', label: 'Pickup' },
    { to: '/farmer/profile', icon: 'bi-shop-window', label: 'Profile' },
  ],
  admin: [
    { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
    { to: '/admin/farmers', icon: 'bi-shop', label: 'Farmers' },
    { to: '/admin/orders', icon: 'bi-receipt', label: 'Orders' },
    { to: '/admin/markets', icon: 'bi-geo-alt', label: 'Markets' },
    { to: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
  ],
};

/** App-style bottom navigation shown on phones and tablets (below the lg breakpoint). */
export default function MobileTabBar() {
  const { user } = useAuth();
  const { count } = useCart();
  const tabs = TABS[user?.role] || TABS.guest;
  return (
    <nav className="mobile-tabbar d-lg-none" aria-label="Quick navigation">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="tab">
          <span className="tab-icon">
            <i className={`bi ${t.icon}`} aria-hidden="true" />
            {t.cart && count > 0 && (
              <span key={count} className="tab-count">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </span>
          <span className="tab-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
