import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { DashHeader } from '../../components/common/PageHeader';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader } from '../../components/common/Loader';
import { BarList, ChartCard, ColumnChart, TrendChart } from '../../components/charts/Charts';
import { formatDate, formatDateKey, money, moneyCompact, ORDER_STATUS_META, timeAgo } from '../../utils/format';

export default function AdminDashboard() {
  useDocumentTitle('Admin dashboard');
  const { data, loading } = useFetch('/admin/dashboard');
  if (loading && !data) return <PageLoader />;
  const { totals, last30, topFarmers, recentOrders, pendingFarmers } = data;
  const statusRows = Object.entries(last30.byStatus).map(([s, n]) => ({ label: ORDER_STATUS_META[s].label, value: n }));

  return (
    <>
      <DashHeader
        title="Platform overview"
        subtitle={`Key MarketLink metrics · ${formatDate(new Date())}`}
        actions={
          <Link to="/admin/reports" className="btn btn-primary">
            <i className="bi bi-file-earmark-bar-graph" /> Generate report
          </Link>
        }
      />

      {totals.pendingFarmers > 0 && (
        <div className="approval-banner">
          <img src="/illustrations/farmer.webp" alt="" />
          <div className="flex-grow-1">
            <strong>
              {totals.pendingFarmers} farmer registration{totals.pendingFarmers > 1 ? 's' : ''} waiting for approval
            </strong>
            <div className="small text-muted-2">{pendingFarmers.map((f) => f.stallName).join(', ')}</div>
          </div>
          <Link to="/admin/farmers?status=pending" className="btn btn-forest btn-sm">
            Review now
          </Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4 col-xxl-2">
          <KpiCard variant="accent" icon="bi-shop" label="Total farmers" value={totals.farmers} sub={`${totals.pendingFarmers} pending`} />
        </div>
        <div className="col-6 col-lg-4 col-xxl-2">
          <KpiCard icon="bi-people" label="Total customers" value={totals.customers} />
        </div>
        <div className="col-6 col-lg-4 col-xxl-2">
          <KpiCard variant="info" icon="bi-geo-alt" label="Total markets" value={totals.markets} />
        </div>
        <div className="col-6 col-lg-4 col-xxl-2">
          <KpiCard icon="bi-receipt" label="Total orders" value={totals.orders} sub={`${totals.openOrders} open now`} />
        </div>
        <div className="col-6 col-lg-4 col-xxl-2">
          <KpiCard variant="warn" icon="bi-cash-stack" label="Revenue (completed)" value={moneyCompact(totals.revenue)} sub="settled at pickup" />
        </div>
        <div className="col-6 col-lg-4 col-xxl-2">
          <KpiCard variant="danger" icon="bi-envelope" label="New messages" value={totals.newMessages} sub={<Link to="/admin/messages">Open inbox</Link>} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <ChartCard
            title="Orders per day"
            subtitle={`Last 30 days · ${last30.totals.orders} orders`}
            table={{ columns: ['Date', 'Orders', 'Revenue'], rows: last30.series.map((p) => [formatDateKey(p.date), p.orders, money(p.revenue)]) }}
          >
            <ColumnChart data={last30.series} yKey="orders" name="Orders" />
          </ChartCard>
        </div>
        <div className="col-xl-6">
          <ChartCard title="Revenue from completed orders" subtitle={`Last 30 days · ${money(last30.totals.revenue)}`} table={{ columns: ['Date', 'Revenue'], rows: last30.series.map((p) => [formatDateKey(p.date), money(p.revenue)]) }}>
            <TrendChart data={last30.series} yKey="revenue" name="Revenue" valueFormatter={money} />
          </ChartCard>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-5">
          <ChartCard title="Orders by status" subtitle="Last 30 days" table={{ columns: ['Status', 'Orders'], rows: statusRows.map((r) => [r.label, r.value]) }}>
            <BarList data={statusRows} labelKey="label" valueKey="value" name="Orders" />
          </ChartCard>
        </div>
        <div className="col-xl-7">
          <div className="panel">
            <div className="panel-head">
              <h5>Most active farmers</h5>
              <span className="fs-7 text-muted-2">last 30 days</span>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th className="text-end">Orders</th>
                    <th className="text-end">Completed</th>
                    <th className="text-end">Revenue</th>
                    <th className="text-end">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topFarmers.map((f, i) => (
                    <tr key={f.farmerId}>
                      <td>
                        <span className="text-muted-2 me-2">{i + 1}</span>
                        <Link to={`/farmers/${f.slug}`} className="fw-semi">
                          {f.farmer}
                        </Link>
                      </td>
                      <td className="text-end">{f.orders}</td>
                      <td className="text-end">{f.completed}</td>
                      <td className="text-end fw-semi">{money(f.revenue)}</td>
                      <td className="text-end text-nowrap">{f.reviews ? (
                            <>
                              {f.rating} <i className="bi bi-star-fill text-warning" />
                            </>
                          ) : (
                            '–'
                          )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h5>Recent orders</h5>
          <Link to="/admin/orders" className="link-arrow small">
            All orders <i className="bi bi-arrow-right" />
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Farmer</th>
                <th>Market</th>
                <th>Status</th>
                <th className="text-end">Total</th>
                <th className="text-end">Placed</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/admin/orders/${o._id}`} className="fw-semi text-nowrap">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>{o.customer?.name}</td>
                  <td>{o.farmer?.stallName}</td>
                  <td className="small">{o.market?.name}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="text-end fw-semi">{money(o.totalAmount)}</td>
                  <td className="text-end small text-muted-2">{timeAgo(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
