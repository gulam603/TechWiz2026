import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toQuery } from '../../api/client';
import { DashHeader } from '../../components/common/PageHeader';
import OrderCard from '../../components/order/OrderCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import FarmerOrderActions from './FarmerOrderActions';
import { ApprovalBanner } from './Dashboard';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { value: 'active', label: 'Open' },
  { value: 'placed', label: 'New' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'ready', label: 'Ready' },
  { value: 'history', label: 'History' },
];

export default function FarmerOrders() {
  useDocumentTitle('Pre-orders');
  const { user } = useAuth();
  const [params] = useSearchParams();
  const focus = params.get('focus');
  const [tab, setTab] = useState(focus ? 'all' : 'active');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, reload } = useFetch(`/farmer/orders${toQuery({ status: tab === 'all' ? '' : tab, date, search, page, limit: 15 })}`);

  const counts = data?.statusCounts || {};
  const tabCount = (v) => (v === 'active' ? (counts.placed || 0) + (counts.accepted || 0) + (counts.ready || 0) : v === 'history' ? (counts.completed || 0) + (counts.declined || 0) + (counts.cancelled || 0) : counts[v]);

  return (
    <>
      <DashHeader title="Pre-orders" subtitle="Accept or decline new pre-orders, mark them ready for pickup and complete them at the stall." />
      <ApprovalBanner status={user.status} />
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <div className="tabs-pill" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className={tab === t.value ? 'active' : ''}
              onClick={() => {
                setTab(t.value);
                setPage(1);
              }}
            >
              {t.label}
              {data && <span className="n">{tabCount(t.value) || 0}</span>}
            </button>
          ))}
        </div>
        <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Pickup date" />
        <div className="search-pill" style={{ maxWidth: 240 }}>
          <i className="bi bi-search" />
          <input placeholder="Order number" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search order number" />
        </div>
        {(date || search) && (
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => {
              setDate('');
              setSearch('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {loading && !data ? (
        <PageLoader />
      ) : data.orders.length === 0 ? (
        <EmptyState image="/illustrations/cart.webp" title="No pre-orders here" message="New pre-orders from customers will appear in this list." />
      ) : (
        <div className="d-grid gap-2">
          {data.orders.map((o) => (
            <OrderCard
              key={o._id}
              order={o}
              highlight={o._id === focus}
              footer={
                <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top">
                  <div className="small flex-grow-1">
                    <i className="bi bi-person" /> <strong>{o.customer?.name}</strong> · <a href={`tel:${o.customer?.phone}`}>{o.customer?.phone}</a>
                    <div className="fs-7 text-muted-2 mt-1">{o.items.map((i) => `${i.quantity} ${i.unit} ${i.name}`).join(' · ')}</div>
                    {o.customerNote && (
                      <div className="fs-7 mt-1">
                        <i className="bi bi-chat-left-text" /> “{o.customerNote}”
                      </div>
                    )}
                  </div>
                  <FarmerOrderActions order={o} compact onChange={reload} />
                  <Link to={`/farmer/orders/${o._id}`} className="btn btn-sm btn-white">
                    Details
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      )}
      <Pagination page={page} pages={data?.pages} onChange={setPage} />
    </>
  );
}
