import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toQuery } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { ConfirmModal } from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import { formatDate } from '../../utils/format';
import Avatar from '../../components/common/Avatar';

export default function AdminCustomers() {
  useDocumentTitle('Manage customers');
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const { data, loading, reload } = useFetch(`/admin/customers${toQuery({ status, search, page })}`);

  async function toggle() {
    const next = target.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/admin/customers/${target._id}/status`, { status: next });
      toast(`${target.name} ${next === 'active' ? 'activated' : 'deactivated'}`);
      setTarget(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <DashHeader title="Customers" subtitle="View customer accounts and deactivate them in case of policy violations." />
      <div className="table-card">
        <div className="table-toolbar">
          <div className="tabs-pill">
            {[
              ['', 'All'],
              ['active', 'Active'],
              ['inactive', 'Deactivated'],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                className={status === v ? 'active' : ''}
                onClick={() => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="search-pill" style={{ maxWidth: 280 }}>
            <i className="bi bi-search" />
            <input placeholder="Search name, e-mail, phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search customers" />
          </div>
        </div>
        {loading && !data ? (
          <PageLoader />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th className="text-end">Orders</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={c.name} src={c.avatar} className="avatar-sm" />
                        <strong className="small">{c.name}</strong>
                        {c.household && <span className="chip chip-soft" title="Family account">Family</span>}
                      </div>
                    </td>
                    <td className="small">
                      {c.email}
                      <div className="fs-7 text-muted-2">{c.phone}</div>
                    </td>
                    <td className="small">{c.address}</td>
                    <td className="text-end">{c.orderCount}</td>
                    <td className="small">{formatDate(c.createdAt)}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-end">
                      <button type="button" className={`btn btn-sm ${c.status === 'active' ? 'btn-outline-danger' : 'btn-primary'}`} onClick={() => setTarget(c)}>
                        {c.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.customers.length === 0 && <p className="text-center text-muted-2 py-4 mb-0">No customers found.</p>}
          </div>
        )}
      </div>
      <Pagination page={page} pages={data?.pages} onChange={setPage} />
      <ConfirmModal
        open={Boolean(target)}
        title={target?.status === 'active' ? `Deactivate ${target?.name}?` : `Activate ${target?.name}?`}
        message={target?.status === 'active' ? 'The customer will not be able to log in or place pre-orders.' : 'The customer will be able to log in again.'}
        confirmLabel={target?.status === 'active' ? 'Deactivate' : 'Activate'}
        danger={target?.status === 'active'}
        onConfirm={toggle}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
