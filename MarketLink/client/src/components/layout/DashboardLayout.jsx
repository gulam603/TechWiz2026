import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';

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
    { to: '/farmer/orders', icon: 'bi-receipt', label: 'Pre-orders' },
    { to: '/farmer/products', icon: 'bi-basket', label: 'Weekly stock' },
    { to: '/farmer/pickup', icon: 'bi-geo-alt', label: 'Markets & pickup' },
    { to: '/farmer/reviews', icon: 'bi-star', label: 'Reviews' },
    { section: 'Account' },
    { to: '/farmer/profile', icon: 'bi-shop-window', label: 'Stall profile' },
    { to: '/farmer/notifications', icon: 'bi-bell', label: 'Notifications' },
  ],
  admin: [
    { section: 'Overview' },
    { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
    { to: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
    { to: '/admin/orders', icon: 'bi-receipt', label: 'All orders' },
    { section: 'Users' },
    { to: '/admin/farmers', icon: 'bi-shop', label: 'Farmers' },
    { to: '/admin/customers', icon: 'bi-people', label: 'Customers' },
    { section: 'Content' },
    { to: '/admin/markets', icon: 'bi-geo-alt', label: 'Markets' },
    { to: '/admin/products', icon: 'bi-basket', label: 'Product listings' },
    { to: '/admin/reviews', icon: 'bi-chat-square-quote', label: 'Reviews' },
    { section: 'System' },
    { to: '/admin/categories', icon: 'bi-tags', label: 'Categories' },
    { to: '/admin/announcements', icon: 'bi-megaphone', label: 'Announcements' },
    { to: '/admin/messages', icon: 'bi-envelope', label: 'Contact messages' },
    { to: '/admin/notifications', icon: 'bi-bell', label: 'Notifications' },
  ],
};

/** Sidebar layout shared by the customer, farmer and admin areas. */
export default function DashboardLayout({ role }) {
  const { user, farmer } = useAuth();
  const items = NAVS[role];
  return (
    <div className="container">
      <div className="dash">
        <aside className="dash-sidebar" aria-label="Dashboard navigation">
          <div className="dash-user">
            <span className="avatar">{initials(user?.name)}</span>
            <div className="who">
              <strong>{role === 'farmer' && farmer ? farmer.stallName : user?.name}</strong>
              <span className="fs-7 text-muted-2 text-capitalize">{role === 'admin' ? 'Administrator' : role}</span>
            </div>
          </div>
          <nav>
            {items.map((item, i) =>
              item.section ? (
                <div key={`s${i}`} className="dash-section">
                  {item.section}
                </div>
              ) : (
                <NavLink key={item.to} to={item.to} end={item.end} className="dash-link">
                  <i className={`bi ${item.icon}`} /> {item.label}
                </NavLink>
              )
            )}
          </nav>
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
