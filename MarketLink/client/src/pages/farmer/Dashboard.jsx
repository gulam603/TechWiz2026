import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { DashHeader } from '../../components/common/PageHeader';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader } from '../../components/common/Loader';
import { BarList, ChartCard, TrendChart } from '../../components/charts/Charts';
import { formatDateKey, money, moneyCompact, ORDER_STATUS_META, time12 } from '../../utils/format';

export function ApprovalBanner({ status }) {
  if (status === 'active') return null;
  const pending = status === 'pending';
  return (
    <div className="approval-banner" style={pending ? undefined : { background: '#fdecea', borderColor: '#f6c9c3' }}>
      <span className="banner-icon" aria-hidden="true">
        <i className={`bi ${pending ? 'bi-hourglass-split' : 'bi-slash-circle'}`} />
      </span>
      <div>
        <strong>{pending ? 'Your stall is waiting for admin approval' : 'Your stall is suspended'}</strong>
        <div className="small text-muted-2">
          {pending
            ? 'Meanwhile, complete your stall profile (logo, bio, markets and map pin). Weekly stock, pre-orders and pickup times open as soon as an admin approves you.'
            : 'Your products are hidden from customers. Please contact the MarketLink team for details.'}
        </div>
      </div>
    </div>
  );
}

/** Farmers see their approval status until an admin approves them, then their insights. */
export default function FarmerDashboard() {
  const { user } = useAuth();
  return user?.status === 'active' ? <FarmerInsights /> : <FarmerWaiting status={user?.status} />;
}

function FarmerWaiting({ status }) {
  useDocumentTitle('Approval status');
  const { data } = useFetch('/farmer/me');
  const f = data?.farmer;
  const checks = f
    ? [
        { done: Boolean(f.bio), label: 'Tell customers about your farm', hint: 'About your farm' },
        { done: Boolean(f.logo), label: 'Upload your stall logo', hint: 'Logo' },
        { done: f.categories?.length > 0, label: 'Choose what you grow or sell', hint: 'Categories' },
        { done: f.markets?.length > 0, label: 'Pick the markets where you sell', hint: 'Markets' },
        { done: f.latitude != null, label: 'Drop a map pin for your farm or stall', hint: 'Map pin' },
      ]
    : [];
  const done = checks.filter((c) => c.done).length;
  const suspended = status === 'suspended';

  return (
    <>
      <DashHeader title={f?.stallName || 'My stall'} subtitle={suspended ? 'Your stall is suspended.' : 'Your registration is being reviewed by the MarketLink team.'} />
      <ApprovalBanner status={status} />
      <div className="row g-3">
        <div className="col-lg-7">
          <div className="panel">
            <div className="panel-head">
              <h5>
                <i className="bi bi-signpost-split" /> What happens next
              </h5>
            </div>
            <ol className="approval-steps">
              <li className="done">
                <strong>Registration received</strong>
                <span>Your account and stall were created.</span>
              </li>
              <li className={suspended ? 'blocked' : 'current'}>
                <strong>{suspended ? 'Suspended by the admin' : 'Admin review'}</strong>
                <span>{suspended ? 'Contact the MarketLink team to re-activate your stall.' : 'An admin checks your details. You get an e-mail when you are approved.'}</span>
              </li>
              <li>
                <strong>Start selling</strong>
                <span>Add your weekly stock, pickup windows and accept pre-orders.</span>
              </li>
            </ol>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="panel">
            <div className="panel-head">
              <h5>
                <i className="bi bi-list-check" /> Stall profile
              </h5>
              {checks.length > 0 && (
                <span className="chip chip-soft">
                  {done}/{checks.length} done
                </span>
              )}
            </div>
            <ul className="profile-checks">
              {checks.map((c) => (
                <li key={c.label} className={c.done ? 'done' : ''}>
                  <i className={`bi ${c.done ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" /> {c.label}
                </li>
              ))}
            </ul>
            <Link to="/farmer/profile" className="btn btn-primary btn-sm">
              <i className="bi bi-pencil" /> Complete stall profile
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function FarmerInsights() {
  useDocumentTitle('Farmer dashboard');
  const { farmer } = useAuth();
  const [days, setDays] = useState(30);
  const { data, loading } = useFetch(`/farmer/insights?days=${days}`);
  if (loading && !data) return <PageLoader />;
  const { kpis, series, bestSellers, statusCounts, upcoming, status } = data;
  const statusRows = Object.entries(statusCounts).map(([s, n]) => ({ label: ORDER_STATUS_META[s].label, value: n }));

  return (
    <>
      <DashHeader
        title={farmer?.stallName || 'My stall'}
        subtitle="Sales, orders and insights for your stall."
        actions={
          <>
            <Link to="/farmer/orders" className="btn btn-white">
              <i className="bi bi-receipt" /> Pre-orders {kpis.pendingOrders > 0 && <span className="badge bg-carrot">{kpis.pendingOrders}</span>}
            </Link>
            <Link to="/farmer/products" className="btn btn-primary">
              <i className="bi bi-plus-lg" /> Update weekly stock
            </Link>
          </>
        }
      />
      <ApprovalBanner status={status} />

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl">
          <KpiCard variant="accent" icon="bi-cash-stack" label="Revenue (30 days)" value={moneyCompact(kpis.revenueMonth)} sub={`${money(kpis.revenueWeek)} this week`} />
        </div>
        <div className="col-6 col-xl">
          <KpiCard icon="bi-receipt" label="Total orders" value={kpis.totalOrders} sub={`${kpis.completedOrders} completed`} />
        </div>
        <div className="col-6 col-xl">
          <KpiCard variant="warn" icon="bi-hourglass-split" label="Pending orders" value={kpis.pendingOrders} sub={`${kpis.activeOrders} open in total`} />
        </div>
        <div className="col-6 col-xl">
          <KpiCard variant="info" icon="bi-graph-up" label="Average order" value={money(Math.round(kpis.averageOrder))} sub={`${money(kpis.revenueTotal)} in total`} />
        </div>
        <div className="col-12 col-xl">
          <KpiCard icon="bi-star" label="Rating" value={kpis.ratingCount ? `${kpis.rating} / 5` : '-'} sub={`${kpis.ratingCount} reviews`} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <ChartCard
            title="Revenue from completed orders"
            subtitle={`Daily, last ${days} days · paid at pickup`}
            actions={
              <select className="form-select form-select-sm w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Range">
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            }
            table={{ columns: ['Date', 'Orders', 'Revenue'], rows: series.filter((p) => p.orders).map((p) => [formatDateKey(p.date), p.orders, money(p.revenue)]) }}
          >
            <TrendChart data={series} yKey="revenue" name="Revenue" valueFormatter={money} />
          </ChartCard>
        </div>
        <div className="col-xl-4">
          <div className="panel">
            <div className="panel-head">
              <h5>Revenue summary</h5>
            </div>
            <div className="info-row">
              <span>Last 7 days</span>
              <span>{money(kpis.revenueWeek)}</span>
            </div>
            <div className="info-row">
              <span>Last 30 days</span>
              <span>{money(kpis.revenueMonth)}</span>
            </div>
            <div className="info-row">
              <span>All time</span>
              <span>{money(kpis.revenueTotal)}</span>
            </div>
            <div className="info-row">
              <span>Products listed</span>
              <span>{kpis.productsListed}</span>
            </div>
            <div className="info-row">
              <span>Sold out now</span>
              <span className={kpis.productsSoldOut ? 'text-danger' : ''}>{kpis.productsSoldOut}</span>
            </div>
            <Link to="/farmer/products?status=sold_out" className="btn btn-soft btn-sm w-100 mt-3">
              Restock sold-out items
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <ChartCard title="Best-selling products" subtitle="Units sold in completed orders" table={{ columns: ['Product', 'Units', 'Revenue'], rows: bestSellers.map((b) => [b.name, `${b.quantity} ${b.unit}`, money(b.revenue)]) }}>
            {bestSellers.length ? <BarList data={bestSellers} labelKey="name" valueKey="quantity" name="Units sold" /> : <p className="small text-muted-2">No completed sales yet.</p>}
          </ChartCard>
        </div>
        <div className="col-xl-6">
          <ChartCard title="Orders by status" subtitle="All-time" table={{ columns: ['Status', 'Orders'], rows: statusRows.map((r) => [r.label, r.value]) }}>
            <BarList data={statusRows} labelKey="label" valueKey="value" name="Orders" />
          </ChartCard>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h5>Upcoming pickups</h5>
          <Link to="/farmer/orders" className="link-arrow small">
            Manage pre-orders <i className="bi bi-arrow-right" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="small text-muted-2 mb-0">No upcoming pickups.</p>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <Link to={`/farmer/orders?focus=${o._id}`} className="fw-semi text-nowrap">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>{o.customer?.name}</td>
                    <td className="small">
                      {formatDateKey(o.pickupDate)} · {time12(o.pickupSlot.start)}
                      <div className="fs-7 text-muted-2">{o.market?.name}</div>
                    </td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="text-end fw-semi">{money(o.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
