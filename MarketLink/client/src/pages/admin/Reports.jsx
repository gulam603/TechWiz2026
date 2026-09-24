import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import KpiCard from '../../components/common/KpiCard';
import { PageLoader } from '../../components/common/Loader';
import { BarList, ChartCard, ColumnChart, TrendChart } from '../../components/charts/Charts';
import DataGrid from '../../components/admin/DataGrid';
import { display, esc, moneyCell } from '../../utils/cells';
import { formatDate, formatDateKey, money, moneyCompact, ORDER_STATUS_META, toDateKey } from '../../utils/format';

/** Turns the report into rows for the table view and CSV export. */
function reportTable(report) {
  const d = report.data;
  if (d.columns) return { columns: d.columns.map((c) => c.label), rows: d.rows.map((r) => d.columns.map((c) => r[c.key])) };
  switch (report.reportType) {
    case 'revenue_by_market':
      return { columns: ['Market', 'City', 'Orders', 'Completed', 'Revenue', 'Share %'], rows: d.rows.map((r) => [r.market, r.city, r.orders, r.completed, r.revenue, r.share]) };
    case 'top_farmers':
      return {
        columns: ['Farmer', 'Orders', 'Completed', 'Items sold', 'Revenue', 'Products', 'Rating'],
        rows: d.rows.map((r) => [r.farmer, r.orders, r.completed, r.itemsSold, r.revenue, r.products, r.rating]),
      };
    default:
      return { columns: ['Date', 'Orders', 'Revenue'], rows: d.series.map((p) => [p.date, p.orders, p.revenue]) };
  }
}

function downloadCsv(report) {
  const { columns, rows } = reportTable(report);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [columns, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `marketlink-${report.reportType}-${toDateKey(new Date(report.generatedAt))}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatusTable({ byStatus }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h5>Orders by status</h5>
      </div>
      {Object.entries(byStatus).map(([s, n]) => (
        <div key={s} className="info-row">
          <span>{ORDER_STATUS_META[s].label}</span>
          <span>{n}</span>
        </div>
      ))}
    </div>
  );
}

// KPI cards of the table-based reports (sales by category, customers, inventory, cities, reviews)
const TOTAL_META = {
  revenue: ['Revenue (completed)', 'bi-cash-stack', 'money'],
  items: ['Items sold', 'bi-basket'],
  categories: ['Categories', 'bi-tags'],
  customers: ['Customers', 'bi-people'],
  active: ['Ordered in period', 'bi-bag-check'],
  newCustomers: ['New customers', 'bi-person-plus'],
  repeat: ['Repeat customers', 'bi-arrow-repeat'],
  orders: ['Orders', 'bi-receipt'],
  products: ['Products', 'bi-basket'],
  lowStock: ['Low stock', 'bi-exclamation-triangle'],
  soldOut: ['Sold out', 'bi-x-circle'],
  units: ['Units in stock', 'bi-box-seam'],
  stockValue: ['Stock value', 'bi-wallet2', 'money'],
  cities: ['Cities', 'bi-buildings'],
  activeCities: ['Cities with orders', 'bi-geo-alt'],
  reviews: ['Reviews', 'bi-chat-square-quote'],
  averageRating: ['Average rating', 'bi-star'],
  removedReviews: ['Removed reviews', 'bi-eye-slash'],
  reports: ['Content reports', 'bi-flag'],
  openReports: ['Open reports', 'bi-hourglass-split'],
  resolvedReports: ['Handled reports', 'bi-check2-circle'],
};
const VARIANTS = ['accent', '', 'info', 'warn', '', 'danger'];

function GenericReport({ report }) {
  const d = report.data;
  const chart = d.chart;
  const chartData = chart ? (chart.data ? d[chart.data] : d.rows).filter((r) => r[chart.value] > 0).slice(0, chart.top || 12) : [];
  const columns = d.columns.map((c) => ({
    data: c.key,
    title: c.label,
    className: c.num || c.money ? 'text-end' : '',
    render: c.money ? display(moneyCell) : c.key === d.columns[0].key ? display((v) => `<strong class="small">${esc(v)}</strong>`) : undefined,
  }));
  const totals = Object.entries(d.totals).filter(([k]) => TOTAL_META[k]);
  const col = totals.length > 4 ? 'col-6 col-md-4 col-xl-2' : totals.length === 4 ? 'col-6 col-lg-3' : 'col-6 col-md-4';
  return (
    <>
      <div className="row g-2 g-xl-3 mb-3 kpi-row">
        {totals.map(([k, v], i) => {
          const [label, icon, kind] = TOTAL_META[k];
          return (
            <div key={k} className={col}>
              <KpiCard variant={VARIANTS[i % VARIANTS.length] || undefined} icon={icon} label={label} value={kind === 'money' ? moneyCompact(v) : v} />
            </div>
          );
        })}
      </div>
      <div className="row g-3">
        {chart && (
          <div className="col-xl-4">
            <ChartCard title={chart.data ? 'Reviews by rating' : `${chart.name} by ${chart.label}`} subtitle={chart.top ? `Top ${chart.top}` : undefined}>
              {chartData.length ? <BarList data={chartData} labelKey={chart.label} valueKey={chart.value} name={chart.name} valueFormatter={chart.money ? moneyCompact : undefined} /> : <p className="small text-muted-2 mb-0">No data in this period.</p>}
            </ChartCard>
          </div>
        )}
        <div className={chart ? 'col-xl-8' : 'col-12'}>
          <div className="table-card">
            <DataGrid key={report._id || report.generatedAt} data={d.rows} columns={columns} order={[]} exportName={report.title} pageLength={10} />
          </div>
        </div>
      </div>
    </>
  );
}

function ReportView({ report }) {
  const d = report.data;
  const t = d.totals;
  const table = reportTable(report);

  if (d.columns) return <GenericReport report={report} />;

  if (report.reportType === 'revenue_by_market') {
    return (
      <>
        <div className="row g-3 mb-4">
          <div className="col-md-4"><KpiCard variant="accent" icon="bi-cash-stack" label="Revenue (completed)" value={moneyCompact(t.revenue)} /></div>
          <div className="col-md-4"><KpiCard icon="bi-receipt" label="Orders" value={t.orders} /></div>
          <div className="col-md-4"><KpiCard variant="info" icon="bi-geo-alt" label="Markets" value={t.markets} /></div>
        </div>
        <ChartCard title="Revenue by market" subtitle="Completed orders in the selected period" table={{ columns: table.columns, rows: table.rows.map((r) => [r[0], r[1], r[2], r[3], money(r[4]), `${r[5]}%`]) }}>
          <BarList data={d.rows} labelKey="market" valueKey="revenue" name="Revenue" valueFormatter={money} />
        </ChartCard>
      </>
    );
  }

  if (report.reportType === 'top_farmers') {
    return (
      <>
        <div className="row g-3 mb-4">
          <div className="col-md-6"><KpiCard variant="accent" icon="bi-shop" label="Farmers" value={t.farmers} /></div>
          <div className="col-md-6"><KpiCard icon="bi-activity" label="Farmers with orders" value={t.activeSellers} /></div>
        </div>
        <div className="row g-4">
          <div className="col-xl-5">
            <ChartCard title="Most active farmers" subtitle="Orders in the selected period">
              <BarList data={d.rows.slice(0, 10)} labelKey="farmer" valueKey="orders" name="Orders" />
            </ChartCard>
          </div>
          <div className="col-xl-7">
            <div className="table-card">
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th className="text-end">Orders</th>
                      <th className="text-end">Completed</th>
                      <th className="text-end">Items</th>
                      <th className="text-end">Revenue</th>
                      <th className="text-end">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.rows.map((r) => (
                      <tr key={r.farmerId}>
                        <td className="fw-semi small">{r.farmer}</td>
                        <td className="text-end">{r.orders}</td>
                        <td className="text-end">{r.completed}</td>
                        <td className="text-end">{r.itemsSold}</td>
                        <td className="text-end">{money(r.revenue)}</td>
                        <td className="text-end">{r.reviews ? r.rating : '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // platform_overview and orders_summary
  return (
    <>
      <div className="row g-3 mb-4">
        {report.reportType === 'platform_overview' && (
          <>
            <div className="col-6 col-lg-3"><KpiCard variant="accent" icon="bi-people" label="Customers" value={t.customers} sub={`${t.newCustomers} new in period`} /></div>
            <div className="col-6 col-lg-3"><KpiCard icon="bi-shop" label="Approved farmers" value={t.farmersActive} sub={`${t.farmersPending} pending`} /></div>
            <div className="col-6 col-lg-3"><KpiCard variant="info" icon="bi-geo-alt" label="Markets" value={t.markets} /></div>
            <div className="col-6 col-lg-3"><KpiCard icon="bi-basket" label="Products" value={t.products} /></div>
          </>
        )}
        <div className="col-6 col-lg-3"><KpiCard icon="bi-receipt" label="Orders" value={t.orders} /></div>
        <div className="col-6 col-lg-3"><KpiCard icon="bi-check2-circle" label="Completed" value={t.completed} /></div>
        <div className="col-6 col-lg-3"><KpiCard variant="warn" icon="bi-cash-stack" label="Revenue" value={moneyCompact(t.revenue)} /></div>
        <div className="col-6 col-lg-3"><KpiCard variant="info" icon="bi-graph-up" label="Average order" value={money(Math.round(t.averageOrder))} /></div>
      </div>
      <div className="row g-4">
        <div className="col-xl-8 d-grid gap-4">
          <ChartCard title="Orders per day" table={{ columns: table.columns, rows: d.series.map((p) => [formatDateKey(p.date), p.orders, money(p.revenue)]) }}>
            <ColumnChart data={d.series} yKey="orders" name="Orders" />
          </ChartCard>
          <ChartCard title="Revenue per day" subtitle="Completed orders">
            <TrendChart data={d.series} yKey="revenue" name="Revenue" valueFormatter={money} />
          </ChartCard>
        </div>
        <div className="col-xl-4">
          <StatusTable byStatus={d.byStatus} />
        </div>
      </div>
    </>
  );
}

export default function AdminReports() {
  useDocumentTitle('Reports');
  const { toast } = useToast();
  const { data, reload } = useFetch('/admin/reports');
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 29);
  const [form, setForm] = useState({ reportType: 'orders_summary', from: toDateKey(monthAgo), to: toDateKey(today) });
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);

  // Show the latest saved report on first load
  useEffect(() => {
    if (!report && data?.reports?.[0]) api.get(`/admin/reports/${data.reports[0]._id}`).then((r) => setReport(r.report)).catch(() => {});
  }, [data, report]);

  async function generate(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/admin/reports', form);
      setReport(res.report);
      toast('Report generated and saved');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function open(id) {
    const res = await api.get(`/admin/reports/${id}`);
    setReport(res.report);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id) {
    await api.del(`/admin/reports/${id}`);
    if (report?._id === id) setReport(null);
    reload();
  }

  if (!data) return <PageLoader />;
  return (
    <div className="report-print">
      <DashHeader title="Reports & analytics" subtitle="Platform-wide reports: orders, revenue by market, city and category, farmers, customers, inventory and reviews & moderation." />
      <form className="panel mb-4 no-print" onSubmit={generate}>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label" htmlFor="rp-type">Report type</label>
            <select id="rp-type" className="form-select" value={form.reportType} onChange={(e) => setForm({ ...form, reportType: e.target.value })}>
              {data.types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="rp-from">From</label>
            <input id="rp-from" type="date" className="form-control" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="rp-to">To</label>
            <input id="rp-to" type="date" className="form-control" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100" disabled={busy}>
              {busy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-lightning-charge" />} Generate
            </button>
          </div>
        </div>
      </form>

      {report && (
        <section className="mb-5">
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <span className="eyebrow">Report</span>
              <h2 className="h3 mb-0">{report.title}</h2>
              <div className="small text-muted-2">
                {formatDate(report.from)} – {formatDate(report.to)} · generated {formatDate(report.generatedAt, { time: true })}
                {report.generatedBy?.name && ` by ${report.generatedBy.name}`}
              </div>
            </div>
            <div className="d-flex gap-2 no-print">
              <button type="button" className="btn btn-white btn-sm" onClick={() => downloadCsv(report)}>
                <i className="bi bi-filetype-csv" /> Export CSV
              </button>
              <button type="button" className="btn btn-white btn-sm" onClick={() => window.print()}>
                <i className="bi bi-printer" /> Print / PDF
              </button>
            </div>
          </div>
          <ReportView report={report} />
        </section>
      )}

      <div className="table-card no-print">
        <div className="table-toolbar">
          <strong>Saved reports</strong>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Report</th>
                <th>Period</th>
                <th>Generated</th>
                <th>By</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.reports.map((r) => (
                <tr key={r._id} className={report?._id === r._id ? 'table-active' : ''}>
                  <td className="fw-semi small">{r.title}</td>
                  <td className="small">
                    {formatDate(r.from)} – {formatDate(r.to)}
                  </td>
                  <td className="small">{formatDate(r.generatedAt, { time: true })}</td>
                  <td className="small">{r.generatedBy?.name}</td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-sm btn-soft" onClick={() => open(r._id)}>
                      Open
                    </button>{' '}
                    <button type="button" className="btn btn-sm btn-white btn-icon" onClick={() => remove(r._id)} aria-label="Delete report">
                      <i className="bi bi-trash3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
