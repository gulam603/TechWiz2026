import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { DashHeader } from '../../components/common/PageHeader';
import OrderCard from '../../components/order/OrderCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { value: 'active', label: 'Active' },
  { value: 'past', label: 'History' },
  { value: 'all', label: 'All' },
];

export default function CustomerOrders() {
  useDocumentTitle('My orders');
  const { user } = useAuth();
  const [tab, setTab] = useState('active');
  const [page, setPage] = useState(1);
  const { data, loading } = useFetch(`/orders/my?status=${tab}&page=${page}&limit=10`);
  const family = useFetch(user.household ? '/orders/family' : null);

  return (
    <>
      <DashHeader title="My orders" subtitle="Track, modify or cancel pre-orders before the farmer's cut-off time, and reorder past favourites." />
      <div className="tabs-pill mb-3" role="tablist">
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
          </button>
        ))}
      </div>
      {loading && !data ? (
        <PageLoader />
      ) : data.orders.length === 0 ? (
        <EmptyState title={tab === 'active' ? 'No active pre-orders' : 'No orders yet'} message="Browse this week's harvest and place your first pre-order." action={<Link to="/products" className="btn btn-primary">Start shopping</Link>} />
      ) : (
        <div className="d-grid gap-2">
          {data.orders.map((o) => (
            <OrderCard key={o._id} order={o} to={`/account/orders/${o._id}`} />
          ))}
        </div>
      )}
      <Pagination page={page} pages={data?.pages} onChange={setPage} />

      {family.data?.orders?.length > 0 && (
        <div className="mt-5">
          <h2 className="h4">
            <i className="bi bi-people" /> Family orders
          </h2>
          <p className="small text-muted-2">Pre-orders placed by members of your household.</p>
          <div className="d-grid gap-2">
            {family.data.orders.slice(0, 6).map((o) => (
              <OrderCard
                key={o._id}
                order={o}
                to={`/account/orders/${o._id}`}
                footer={<div className="fs-7 text-muted-2 mt-2">Ordered by {o.customer?.name}</div>}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
