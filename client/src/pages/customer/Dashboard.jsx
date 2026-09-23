import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { DashHeader } from '../../components/common/PageHeader';
import KpiCard from '../../components/common/KpiCard';
import OrderCard from '../../components/order/OrderCard';
import ProductCard from '../../components/cards/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { money, timeAgo } from '../../utils/format';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function CustomerDashboard() {
  useDocumentTitle('My dashboard');
  const { user } = useAuth();
  const { data, loading } = useFetch('/customer/dashboard');
  if (loading && !data) return <PageLoader />;
  const { stats, upcoming, notifications, suggestions } = data;
  const ready = upcoming.filter((o) => o.status === 'ready');

  return (
    <>
      <DashHeader
        title={`${greeting()}, ${user.name.split(' ')[0]} 👋`}
        subtitle="Here's what's happening with your market orders."
        actions={
          <Link to="/products" className="btn btn-primary">
            <i className="bi bi-basket" /> Shop this week's harvest
          </Link>
        }
      />

      {ready.length > 0 && (
        <div className="approval-banner" style={{ background: 'linear-gradient(120deg,#e9f7d4,#f7fbe9)', borderColor: '#cfe9a8' }}>
          <img src="/illustrations/basket.webp" alt="" />
          <div className="flex-grow-1">
            <strong>{ready.length === 1 ? 'An order is' : `${ready.length} orders are`} ready for pickup!</strong>
            <div className="small text-muted-2">
              {ready.map((o) => `${o.farmer?.stallName} at ${o.market?.name}`).join(' · ')}. Remember to pay at the stall.
            </div>
          </div>
          <Link to={`/account/orders/${ready[0]._id}`} className="btn btn-forest btn-sm">
            View pickup details
          </Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <KpiCard variant="accent" icon="bi-bag" label="Active pre-orders" value={stats.activeOrders} sub="placed, accepted or ready" />
        </div>
        <div className="col-6 col-xl-3">
          <KpiCard icon="bi-check2-circle" label="Completed pickups" value={stats.completedOrders} />
        </div>
        <div className="col-6 col-xl-3">
          <KpiCard variant="info" icon="bi-wallet2" label="Spent at markets" value={money(stats.totalSpent)} sub="paid at pickup" />
        </div>
        <div className="col-6 col-xl-3">
          <KpiCard variant="warn" icon="bi-heart" label="Favourites" value={stats.favorites} sub={`${stats.savedMarkets} saved markets`} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <div className="panel">
            <div className="panel-head">
              <h5>Upcoming pickups</h5>
              <Link to="/account/orders" className="link-arrow small">
                All orders <i className="bi bi-arrow-right" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState title="No upcoming pickups" message="Your next pre-order will show up here." action={<Link to="/products" className="btn btn-primary btn-sm">Browse products</Link>} />
            ) : (
              <div className="d-grid gap-2">
                {upcoming.map((o) => (
                  <OrderCard key={o._id} order={o} to={`/account/orders/${o._id}`} />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-xl-4">
          <div className="panel">
            <div className="panel-head">
              <h5>Latest updates</h5>
              <Link to="/account/notifications" className="link-arrow small">
                All <i className="bi bi-arrow-right" />
              </Link>
            </div>
            {notifications.length === 0 && <p className="small text-muted-2">No notifications yet.</p>}
            <div className="d-grid gap-1">
              {notifications.map((n) => (
                <Link key={n._id} to={n.link || '/account/notifications'} className={`notif-item ${n.read ? '' : 'unread'}`}>
                  <span className="notif-icon">
                    <i className={`bi ${n.type === 'order' ? 'bi-bag-check' : n.type === 'restock' ? 'bi-arrow-repeat' : 'bi-megaphone'}`} />
                  </span>
                  <span className="min-w-0">
                    <strong className="d-block small text-truncate">{n.title}</strong>
                    <span className="fs-7 text-muted-2">{timeAgo(n.createdAt)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h5>Picked for you</h5>
          <Link to="/account/favorites" className="link-arrow small">
            Favourites <i className="bi bi-arrow-right" />
          </Link>
        </div>
        <div className="row g-3">
          {suggestions.map((p) => (
            <div key={p._id} className="col-6 col-lg-3">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
