import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { visibleItems } from './navConfig';

export const NAVS = {
  customer: [
    { section: 'My account' },
    { to: '/account', icon: 'bi-grid-1x2', label: 'Dashboard', end: true },
    { to: '/account/orders', icon: 'bi-bag', label: 'My orders' },
    { to: '/account/favorites', icon: 'bi-heart', label: 'Favourites' },
    { to: '/account/notifications', icon: 'bi-bell', label: 'Notifications' },
    { to: '/account/profile', icon: 'bi-person-gear', label: 'Profile & family' },
    { section: 'Shop' },
    { to: '/products', icon: 'bi-basket', label: 'Browse products' },
    { to: '/map', icon: 'bi-map', label: 'Market map' },
  ],
  farmer: [
    { section: 'My stall' },
    { to: '/farmer', icon: 'bi-graph-up-arrow', label: 'Dashboard & insights', end: true },
    { to: '/farmer/orders', icon: 'bi-receipt', label: 'Pre-orders', approved: true },
    { to: '/farmer/products', icon: 'bi-basket', label: 'Weekly stock', approved: true },
    { to: '/farmer/pickup', icon: 'bi-geo-alt', label: 'Markets & pickup', approved: true },
    { to: '/farmer/reviews', icon: 'bi-star', label: 'Reviews', approved: true },
    { section: 'Account' },
    { to: '/farmer/profile', icon: 'bi-shop-window', label: 'Stall profile' },
    { to: '/farmer/notifications', icon: 'bi-bell', label: 'Notifications' },
  ],
};

const COLLAPSE_KEY = 'ml_dash_sidebar';
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === 'collapsed';
  } catch {
    return false;
  }
};

/** Sidebar layout of the customer and farmer areas (the admin area has its own AdminLayout). */
export default function DashboardLayout({ role }) {
  const { user, farmer } = useAuth();
  const items = visibleItems(NAVS[role], user);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  function toggle() {
    setCollapsed(!collapsed);
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? 'open' : 'collapsed');
    } catch {
      /* not remembered in private mode */
    }
  }

  return (
    <div className="container">
      <div className={`dash ${collapsed ? 'is-collapsed' : ''}`}>
        <aside className="dash-sidebar" aria-label="Dashboard navigation">
          <div className="dash-user">
            <Avatar name={user?.name} src={user?.avatar} />
            <div className="who">
              <strong>{role === 'farmer' && farmer ? farmer.stallName : user?.name}</strong>
              <span className="fs-7 text-muted-2 text-capitalize">{role === 'farmer' && user?.status !== 'active' ? `Farmer · ${user?.status}` : role}</span>
            </div>
          </div>
          <nav>
            {items.map((item, i) =>
              item.section ? (
                <div key={`s${i}`} className="dash-section">
                  <span>{item.section}</span>
                </div>
              ) : (
                <NavLink key={item.to} to={item.to} end={item.end} className="dash-link" title={collapsed ? item.label : undefined}>
                  <i className={`bi ${item.icon}`} /> <span className="dash-link-label">{item.label}</span>
                </NavLink>
              )
            )}
          </nav>
          <button type="button" className="dash-collapse" onClick={toggle} aria-pressed={collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <i className={`bi ${collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`} aria-hidden="true" />
            <span className="dash-link-label">Collapse</span>
          </button>
        </aside>
        <div className="dash-main">
          <nav className="dash-mobile-nav" aria-label="Dashboard navigation">
            {items
              .filter((i) => !i.section)
              .map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `filter-chip ${isActive ? 'active' : ''}`}>
                  <i className={`bi ${item.icon}`} /> {item.label}
                </NavLink>
              ))}
          </nav>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
