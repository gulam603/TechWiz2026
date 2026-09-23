import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toQuery } from '../../api/client';
import { DashHeader } from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Loader';
import { formatDate, formatDateKey, money, ORDER_STATUS_META } from '../../utils/format';

export default function AdminOrders() {
  useDocumentTitle('All orders');
  const [status, setStatus] = useState('');
  const [market, setMarket] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading } = useFetch(`/admin/orders${toQuery({ status, market, search, page })}`);
  const { data: marketData } = useFetch('/admin/markets');

  return (
    <>
      <DashHeader title="All orders" subtitle={`${data?.total ?? '…'} pre-orders across every market`} />
      <div className="table-card">
        <div className="table-toolbar">
          <div className="d-flex gap-2 flex-wrap">
            <select className="form-select form-select-sm w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
              <option value="">All statuses</option>
              {Object.entries(ORDER_STATUS_META).map(([v, m]) => (
                <option key={v} value={v}>
                  {m.label}
                </option>
              ))}
            </select>
            <select className="form-select form-select-sm w-auto" value={market} onChange={(e) => { setMarket(e.target.value); setPage(1); }} aria-label="Market">
              <option value="">All markets</option>
              {(marketData?.markets || []).map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="search-pill" style={{ maxWidth: 240 }}>
            <i className="bi bi-search" />
            <input placeholder="Order number" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search order number" />
          </div>
        </div>
        {loading && !data ? (
          <PageLoader />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Farmer</th>
                  <th>Pickup</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <Link to={`/admin/orders/${o._id}`} className="fw-semi text-nowrap">
                        {o.orderNumber}
                      </Link>
                      <div className="fs-7 text-muted-2">{formatDate(o.createdAt)}</div>
                    </td>
                    <td className="small">
                      {o.customer?.name}
                      <div className="fs-7 text-muted-2">{o.customer?.email}</div>
                    </td>
                    <td className="small">{o.farmer?.stallName}</td>
                    <td className="small">
                      {formatDateKey(o.pickupDate)} {o.pickupSlot.start}
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
            {data.orders.length === 0 && <p className="text-center text-muted-2 py-4 mb-0">No orders found.</p>}
          </div>
        )}
      </div>
      <Pagination page={page} pages={data?.pages} onChange={setPage} />
    </>
  );
}
