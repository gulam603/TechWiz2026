import { useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import { homeFor, useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import useClickOutside from '../../hooks/useClickOutside';
import { initials } from '../../utils/format';

const LINKS = [
  { to: '/products', label: 'Shop' },
  { to: '/markets', label: 'Markets' },
  { to: '/farmers', label: 'Farmers' },
  { to: '/map', label: 'Map' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const MENUS = {
  customer: [
    { to: '/account', icon: 'bi-grid', label: 'My dashboard' },
    { to: '/account/orders', icon: 'bi-bag', label: 'My orders' },
    { to: '/account/favorites', icon: 'bi-heart', label: 'Favourites' },
    { to: '/account/profile', icon: 'bi-person', label: 'Profile & family' },
  ],
  farmer: [
    { to: '/farmer', icon: 'bi-graph-up', label: 'Dashboard & insights' },
    { to: '/farmer/orders', icon: 'bi-receipt', label: 'Pre-orders' },
    { to: '/farmer/products', icon: 'bi-basket', label: 'Weekly stock' },
    { to: '/farmer/pickup', icon: 'bi-geo-alt', label: 'Markets & pickup' },
  ],
  admin: [
    { to: '/admin', icon: 'bi-speedometer2', label: 'Admin dashboard' },
    { to: '/admin/farmers', icon: 'bi-shop', label: 'Farmers' },
    { to: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
  ],
};

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <div className="ml-dropdown" ref={ref}>
      <button type="button" className="btn p-0 border-0 d-flex align-items-center gap-2" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu">
        <span className="avatar">{initials(user.name)}</span>
        <span className="d-none d-xl-inline fw-semi small text-forest">{user.name.split(' ')[0]}</span>
        <i className="bi bi-chevron-down small d-none d-xl-inline" />
      </button>
      {open && (
        <div className="ml-dropdown-menu">
          <div className="px-3 py-2">
            <strong className="d-block">{user.name}</strong>
            <span className="fs-7 text-muted-2">{user.email}</span>
            <span className="chip chip-soft mt-1 text-capitalize">{user.role}</span>
          </div>
          <hr className="my-1" />
          {(MENUS[user.role] || []).map((m) => (
            <Link key={m.to} to={m.to} className="ml-dropdown-item" onClick={() => setOpen(false)}>
              <i className={`bi ${m.icon}`} /> {m.label}
            </Link>
          ))}
          <hr className="my-1" />
          <button type="button" className="ml-dropdown-item" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');
  const showCart = !user || user.role === 'customer';

  return (
    <header className="ml-navbar">
      <nav className="container d-flex align-items-center gap-3" style={{ minHeight: 'var(--ml-nav-h)' }} aria-label="Main">
        <Logo />
        {isAdminArea && user?.role === 'admin' && <span className="chip chip-dark d-none d-sm-inline-flex">Admin console</span>}

        <ul className="navbar-nav flex-row gap-1 mx-auto d-none d-lg-flex">
          {LINKS.map((l) => (
            <li key={l.to} className="nav-item">
              <NavLink to={l.to} className="nav-link">
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="d-flex align-items-center gap-2 ms-auto ms-lg-0">
          <button type="button" className="nav-icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" aria-expanded={searchOpen}>
            <i className={`bi ${searchOpen ? 'bi-x-lg' : 'bi-search'}`} />
          </button>
          {showCart && (
            <Link to="/cart" className="nav-icon-btn" aria-label={`Basket (${count} items)`}>
              <i className="bi bi-basket2" />
              {count > 0 && <span className="count">{count > 99 ? '99+' : count}</span>}
            </Link>
          )}
          {user && <NotificationBell allLink={`${homeFor(user)}/notifications`} />}
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className="btn btn-white d-none d-sm-inline-flex">
                Log in
              </Link>
              <Link to="/register/farmer" className="btn btn-lime d-none d-md-inline-flex">
                <i className="bi bi-shop" /> Sell with us
              </Link>
            </>
          )}
          <button type="button" className="nav-icon-btn d-lg-none" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
            <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} />
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="container pb-3">
          <GlobalSearch autoFocus />
        </div>
      )}

      {menuOpen && (
        <div className="container pb-3 d-lg-none">
          <ul className="navbar-nav gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className="nav-link" onClick={() => setMenuOpen(false)}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            {!user && (
              <li className="d-flex gap-2 mt-2">
                <Link to="/login" className="btn btn-white flex-fill" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register/farmer" className="btn btn-lime flex-fill" onClick={() => setMenuOpen(false)}>
                  Sell with us
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
