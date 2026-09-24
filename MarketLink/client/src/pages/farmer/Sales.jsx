import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashHeader } from '../../components/common/PageHeader';
import KpiCard from '../../components/common/KpiCard';
import { PageLoader } from '../../components/common/Loader';
import { BarList, ChartCard, ColumnChart, TrendChart } from '../../components/charts/Charts';
import DataGrid from '../../components/admin/DataGrid';
import { dateCell, display, esc, moneyCell, muted } from '../../utils/cells';
import { formatDateKey, money, moneyCompact } from '../../utils/format';

const PRESETS = [
  [7, 'Last 7 days'],
  [30, 'Last 30 days'],
  [90, 'Last 90 days'],
  [365, 'Last 12 months'],
];

const PRODUCT_COLUMNS = [
  { data: 'product', title: 'Product', render: display((v) => `<strong class="small">${esc(v)}</strong>`) },
  { data: 'quantity', title: 'Sold', className: 'text-end', render: display((v, r) => `${esc(v)} <span class="fs-7 text-muted-2">${esc(r.unit)}</span>`) },
  { data: 'orders', title: 'Orders', className: 'text-end' },
  { data: 'revenue', title: 'Revenue', className: 'text-end', render: display(moneyCell) },
  { data: 'share', title: 'Share', className: 'text-end', render: display((v) => `<span class="share-bar" style="--w:${Math.min(100, v)}%">${esc(v)}%</span>`) },
];

const CUSTOMER_COLUMNS = [
  { data: 'customer', title: 'Customer', render: display((v, r) => `<strong class="small d-block">${esc(v)}</strong>${muted(r.city)}`) },
  { data: 'orders', title: 'Orders', className: 'text-end' },
  { data: 'revenue', title: 'Spent', className: 'text-end', render: display(moneyCell) },
  { data: 'last', title: 'Last order', render: display((v) => dateCell(v)) },
];

const change = (v) => (v === null || v === undefined ? 'no earlier data' : `${v > 0 ? '+' : ''}${v}% vs previous period`);

/** Sales insights for the farmer: what sells, where, when and to whom; printable and exportable. */
export default function FarmerSales() {
  useDocumentTitle('Sales report');
  const { farmer } = useAuth();
  const [range, setRange] = useState({ days: 30, from: '', to: '' });
  const query = range.from && range.to ? { from: range.from, to: range.to } : { days: range.days };
  const { data, loading } = useFetch(`/farmer/reports/sales${toQuery(query)}`);

  return (
    <div className="sales-report">
      <DashHeader
        title="Sales report"
        subtitle={data ? `${farmer?.stallName || 'My stall'} · ${formatDateKey(data.period.from, { withYear: true })} – ${formatDateKey(data.period.to, { withYear: true })}` : 'Sales insights for your stall'}
        actions={
          <button type="button" className="btn btn-white btn-sm d-print-none" onClick={() => window.print()}>
            <i className="bi bi-printer" /> Print report
          </button>
        }
      />
      <div className="panel mb-3 d-print-none">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="tabs-pill">
            {PRESETS.map(([d, l]) => (
              <button key={d} type="button" className={!range.from && range.days === d ? 'active' : ''} onClick={() => setRange({ days: d, from: '', to: '' })}>
                {l}
              </button>
            ))}
          </div>
          <label className="filter-field is-date">
            <span>From</span>
            <input type="date" className="form-control form-control-sm" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </label>
          <label className="filter-field is-date">
            <span>To</span>
            <input type="date" className="form-control form-control-sm" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </label>
        </div>
      </div>

      {loading && !data ? (
        <PageLoader />
      ) : (
        <>
          <div className="row g-2 g-xl-3 mb-3 kpi-row">
            <div className="col-6 col-md-4 col-xxl-2">
              <KpiCard variant="accent" icon="bi-cash-stack" label="Revenue" value={moneyCompact(data.kpis.revenue)} sub={change(data.kpis.revenueChange)} />
            </div>
            <div className="col-6 col-md-4 col-xxl-2">
              <KpiCard icon="bi-receipt" label="Completed orders" value={data.kpis.orders} sub={change(data.kpis.ordersChange)} />
            </div>
            <div className="col-6 col-md-4 col-xxl-2">
              <KpiCard icon="bi-basket" label="Items sold" value={data.kpis.items} sub={`avg order ${money(data.kpis.averageOrder)}`} />
            </div>
            <div className="col-6 col-md-4 col-xxl-2">
              <KpiCard variant="info" icon="bi-people" label="Customers" value={data.kpis.customers} sub={`${data.kpis.repeatCustomers} returning · ${data.kpis.newCustomers} new`} />
            </div>
            <div className="col-6 col-md-4 col-xxl-2">
              <KpiCard variant="warn" icon="bi-hourglass-split" label="Open pre-orders" value={data.kpis.openOrders} sub={`${money(data.kpis.openValue)} to collect`} />
            </div>
            <div className="col-6 col-md-4 col-xxl-2">
              <KpiCard variant="danger" icon="bi-x-circle" label="Cancelled / declined" value={data.kpis.cancelled} sub={`${data.kpis.cancellationRate}% of pre-orders`} />
            </div>
          </div>

          {data.insights.length > 0 && (
            <div className="panel mb-3">
              <div className="panel-head">
                <h5>
                  <i className="bi bi-lightbulb" /> Insights
                </h5>
              </div>
              <ul className="insight-list">
                {data.insights.map((i) => (
                  <li key={i.text}>
                    <i className={`bi ${i.icon}`} aria-hidden="true" /> {i.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="row g-3 mb-3">
            <div className="col-xl-8">
              <ChartCard title="Revenue per day" subtitle="completed orders, paid at pickup" table={{ columns: ['Date', 'Orders', 'Revenue'], rows: data.series.map((d) => [formatDateKey(d.date), d.orders, money(d.revenue)]) }}>
                <TrendChart data={data.series} yKey="revenue" name="Revenue" valueFormatter={money} height={240} />
              </ChartCard>
            </div>
            <div className="col-xl-4">
              <ChartCard title="Sales by category" table={{ columns: ['Category', 'Items', 'Revenue'], rows: data.categories.map((c) => [c.category, c.quantity, money(c.revenue)]) }}>
                {data.categories.length ? <BarList data={data.categories} labelKey="category" valueKey="revenue" name="Revenue" valueFormatter={moneyCompact} /> : <p className="small text-muted-2 mb-0">No sales in this period.</p>}
              </ChartCard>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-lg-6 col-xl-4">
              <ChartCard title="Pickup days" subtitle="completed orders by weekday" table={{ columns: ['Day', 'Orders', 'Revenue'], rows: data.weekdays.map((d) => [d.day, d.orders, money(d.revenue)]) }}>
                <ColumnChart data={data.weekdays.map((d) => ({ ...d, label: d.day.slice(0, 3) }))} xKey="label" yKey="orders" name="Orders" dateAxis={false} height={200} />
              </ChartCard>
            </div>
            <div className="col-lg-6 col-xl-4">
              <ChartCard title="Pickup times" subtitle="orders by slot hour" table={{ columns: ['Hour', 'Orders'], rows: data.slots.map((s) => [`${s.hour}:00`, s.orders]) }}>
                <ColumnChart data={data.slots.map((s) => ({ ...s, label: `${s.hour}:00` }))} xKey="label" yKey="orders" name="Orders" dateAxis={false} height={200} />
              </ChartCard>
            </div>
            <div className="col-xl-4">
              <ChartCard title="Markets" subtitle="revenue by pickup market" table={{ columns: ['Market', 'Orders', 'Revenue'], rows: data.markets.map((m) => [m.market, m.orders, money(m.revenue)]) }}>
                {data.markets.length ? <BarList data={data.markets} labelKey="market" valueKey="revenue" name="Revenue" valueFormatter={moneyCompact} /> : <p className="small text-muted-2 mb-0">No sales in this period.</p>}
              </ChartCard>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-xl-7">
              <div className="table-card">
                <div className="panel-head px-3 pt-3">
                  <h5>
                    <i className="bi bi-basket" /> Products
                  </h5>
                </div>
                <DataGrid data={data.products} columns={PRODUCT_COLUMNS} order={[[3, 'desc']]} exportName="Sales by product" />
              </div>
            </div>
            <div className="col-xl-5">
              <div className="table-card">
                <div className="panel-head px-3 pt-3">
                  <h5>
                    <i className="bi bi-people" /> Customers
                  </h5>
                </div>
                <DataGrid data={data.customers} columns={CUSTOMER_COLUMNS} order={[[2, 'desc']]} exportName="Sales by customer" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
