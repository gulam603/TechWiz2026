import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import useClickOutside from '../../hooks/useClickOutside';
import Avatar from '../common/Avatar';
import Logo, { LogoMark } from '../common/Logo';
import NotificationBell from '../layout/NotificationBell';
import AdminOrderModal from './AdminOrderModal';
import AdminAccountModal from './AdminAccountModal';

// Sidebar of the admin area. Reports is intentionally the last item.
export const ADMIN_NAV = [
  { section: 'Overview' },
  { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: 'bi-receipt', label: 'Orders', badge: 'openOrders' },
  { section: 'People' },
  { to: '/admin/farmers', icon: 'bi-shop', label: 'Farmers', badge: 'pendingFarmers', badgeTone: 'warn' },
  { to: '/admin/customers', icon: 'bi-people', label: 'Customers' },
  { section: 'Catalogue' },
  { to: '/admin/markets', icon: 'bi-geo-alt', label: 'Markets' },
  { to: '/admin/cities', icon: 'bi-buildings', label: 'Cities' },
  { to: '/admin/categories', icon: 'bi-tags', label: 'Categories' },
  { to: '/admin/products', icon: 'bi-basket', label: 'Product listings' },
  { to: '/admin/reviews', icon: 'bi-chat-square-quote', label: 'Reviews' },
  { section: 'Communication' },
  { to: '/admin/announcements', icon: 'bi-megaphone', label: 'Announcements' },
  { to: '/admin/messages', icon: 'bi-envelope', label: 'Contact messages', badge: 'newMessages', badgeTone: 'warn' },
  { to: '/admin/notifications', icon: 'bi-bell', label: 'Notifications' },
  { section: 'Insights' },
  { to: '/admin/purchases', icon: 'bi-diagram-3', label: 'Customer purchases' },
  { to: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
];

const COLLAPSE_KEY = 'ml_admin_sidebar';

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function pageTitle(pathname) {
  const items = ADMIN_NAV.filter((i) => i.to && (i.end ? pathname === i.to : pathname.startsWith(i.to)));
  const match = items.sort((a, b) => b.to.length - a.to.length)[0];
  if (pathname.startsWith('/admin/orders/')) return 'Order details';
  if (pathname.startsWith('/admin/customers/')) return 'Customer details';
  return match?.label || 'Admin';
}

function AdminUserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div className="ml-dropdown" ref={ref}>
      <button type="button" className="btn p-0 border-0 d-flex align-items-center gap-2" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu">
        <Avatar name={user.name} src={user.avatar} />
        <span className="d-none d-md-inline text-start lh-sm">
          <strong className="d-block small">{user.name}</strong>
          <span className="fs-7 text-muted-2">Administrator</span>
        </span>
        <i className="bi bi-chevron-down small d-none d-md-inline" />
      </button>
      {open && (
        <div className="ml-dropdown-menu">
          <div className="px-3 py-2">
            <strong className="d-block">{user.name}</strong>
            <span className="fs-7 text-muted-2">{user.email}</span>
          </div>
          <hr className="my-1" />
          <Link to="/" className="ml-dropdown-item" onClick={() => setOpen(false)}>
            <i className="bi bi-globe2" /> View website
          </Link>
          <Link to="/admin/notifications" className="ml-dropdown-item" onClick={() => setOpen(false)}>
            <i className="bi bi-bell" /> Notifications
          </Link>
          <hr className="my-1" />
          <button
            type="button"
            className="ml-dropdown-item"
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate('/admin/login');
            }}
          >
            <i className="bi bi-box-arrow-right" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Admin area shell: its own sidebar and top bar (no public navbar, footer or chat).
 * The sidebar collapses to icons on laptops and becomes a slide-in drawer on phones.
 */
export default function AdminLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  // The drawer remembers the page it was opened on and closes itself after navigation
  const [drawerPath, setDrawerPath] = useState(null);
  const drawerOpen = drawerPath === pathname;
  const [badges, setBadges] = useState({});
  const [modal, setModal] = useState(null); // 'order' | 'farmer' | 'customer'
  const [changed, setChanged] = useState(0); // bumps after a modal creates something, so pages reload

  const refreshBadges = useCallback(() => {
    api.get('/admin/badges').then(setBadges).catch(() => {});
  }, []);

  useEffect(() => {
    refreshBadges();
  }, [pathname, changed, refreshBadges]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerPath(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? 'collapsed' : 'open');
    } catch {
      /* private mode: the choice is simply not remembered */
    }
  }

  const done = () => {
    setModal(null);
    setChanged((n) => n + 1);
  };

  return (
    <div className={`admin-shell ${collapsed ? 'is-collapsed' : ''} ${drawerOpen ? 'drawer-open' : ''}`}>
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <aside className="admin-side" aria-label="Admin navigation">
        <div className="admin-brand">
          <span className="brand-full">
            <Logo light to="/admin" />
          </span>
          <Link to="/admin" className="brand-mini" aria-label="Admin dashboard">
            <LogoMark size={36} />
          </Link>
          <button type="button" className="admin-drawer-close" onClick={() => setDrawerPath(null)} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <nav className="admin-nav">
          {ADMIN_NAV.map((item, i) =>
            item.section ? (
              <div key={`s${i}`} className="admin-section">
                <span>{item.section}</span>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end} className="admin-link" title={collapsed ? item.label : undefined}>
                <i className={`bi ${item.icon}`} aria-hidden="true" />
                <span className="admin-link-label">{item.label}</span>
                {item.badge && badges[item.badge] > 0 && <span className={`admin-badge ${item.badgeTone || ''}`}>{badges[item.badge]}</span>}
              </NavLink>
            )
          )}
        </nav>
        <button type="button" className="admin-collapse" onClick={toggleCollapsed} aria-pressed={collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <i className={`bi ${collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`} aria-hidden="true" />
          <span className="admin-link-label">Collapse sidebar</span>
        </button>
      </aside>
      <button type="button" className="admin-backdrop" aria-label="Close menu" tabIndex={-1} onClick={() => setDrawerPath(null)} />

      <div className="admin-body">
        <header className="admin-top">
          <button type="button" className="nav-icon-btn admin-menu-btn" onClick={() => setDrawerPath(pathname)} aria-label="Open menu" aria-expanded={drawerOpen}>
            <i className="bi bi-list" />
          </button>
          <button type="button" className="nav-icon-btn admin-collapse-btn" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <i className={`bi ${collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'}`} />
          </button>
          <div className="admin-title">
            <span className="fs-7 text-muted-2 d-none d-sm-block">Admin</span>
            <strong>{pageTitle(pathname)}</strong>
          </div>
          <div className="admin-top-actions">
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setModal('order')}>
              <i className="bi bi-bag-plus" aria-hidden="true" /> <span className="d-none d-lg-inline">Place order</span>
            </button>
            <button type="button" className="btn btn-sm btn-lime" onClick={() => setModal('farmer')}>
              <i className="bi bi-person-plus" aria-hidden="true" /> <span className="d-none d-lg-inline">Add farmer</span>
            </button>
            <Link to="/" className="nav-icon-btn d-none d-sm-inline-flex" title="View website" aria-label="View website">
              <i className="bi bi-globe2" />
            </Link>
            <NotificationBell allLink="/admin/notifications" />
            <AdminUserMenu />
          </div>
        </header>
        <main id="admin-main" className="admin-content page-enter" key={pathname}>
          <Outlet context={{ openModal: setModal, changed, refreshBadges }} />
        </main>
      </div>

      {modal === 'order' && <AdminOrderModal onClose={() => setModal(null)} onPlaced={done} />}
      {(modal === 'farmer' || modal === 'customer') && <AdminAccountModal type={modal} onClose={() => setModal(null)} onCreated={done} />}
    </div>
  );
}
