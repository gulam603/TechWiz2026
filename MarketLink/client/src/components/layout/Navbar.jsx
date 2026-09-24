import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import { homeFor, useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import useClickOutside from '../../hooks/useClickOutside';
import MobileMenu from './MobileMenu';
import { LINKS, MENUS, visibleItems } from './navConfig';
import Avatar from '../common/Avatar';

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
        <Avatar name={user.name} src={user.avatar} />
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
          {visibleItems(MENUS[user.role] || [], user).map((m) => (
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
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  // The drawer remembers the page it was opened on, so it closes by itself after any navigation.
  const [menuPath, setMenuPath] = useState(null);
  const menuOpen = menuPath === location.pathname;
  const closeMenu = useCallback(() => setMenuPath(null), []);
  const isAdminArea = location.pathname.startsWith('/admin');
  const showCart = !user || user.role === 'customer';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`ml-navbar ${scrolled ? 'scrolled' : ''}`}>
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
          <button type="button" className="nav-icon-btn d-none d-sm-inline-flex" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" aria-expanded={searchOpen}>
            <i className={`bi ${searchOpen ? 'bi-x-lg' : 'bi-search'}`} />
          </button>
          {showCart && (
            <Link to="/cart" className="nav-icon-btn" aria-label={`Basket (${count} items)`}>
              <i className="bi bi-basket2" />
              {count > 0 && (
                <span key={count} className="count">
                  {count > 99 ? '99+' : count}
                </span>
              )}
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
          <button type="button" className="nav-icon-btn d-lg-none" onClick={() => setMenuPath(location.pathname)} aria-label="Open menu" aria-expanded={menuOpen}>
            <i className="bi bi-list" />
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="container pb-3">
          <GlobalSearch autoFocus />
        </div>
      )}

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </header>
  );
}
