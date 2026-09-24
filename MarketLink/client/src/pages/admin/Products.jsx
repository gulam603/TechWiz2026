import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toQuery } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import { money } from '../../utils/format';
import { productPath } from '../../utils/links';

export default function AdminProducts() {
  useDocumentTitle('Moderate products');
  const { toast } = useToast();
  const [state, setState] = useState('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState(null);
  const [reason, setReason] = useState('Violates platform guidelines');
  const { data, loading, reload } = useFetch(`/admin/products${toQuery({ state, search, page })}`);

  async function moderate(product, action, why) {
    try {
      await api.patch(`/admin/products/${product._id}/moderate`, { action, reason: why });
      toast(action === 'remove' ? 'Listing removed and farmer notified' : 'Listing restored');
      setRemoving(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <DashHeader title="Product listings" subtitle="Review listings and remove anything inappropriate or against the platform guidelines." />
      <div className="table-card">
        <div className="table-toolbar">
          <div className="tabs-pill">
            {[
              ['active', 'Live'],
              ['removed', 'Removed'],
              ['', 'All'],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                className={state === v ? 'active' : ''}
                onClick={() => {
                  setState(v);
                  setPage(1);
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="search-pill" style={{ maxWidth: 260 }}>
            <i className="bi bi-search" />
            <input placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
          </div>
        </div>
        {loading && !data ? (
          <PageLoader />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Farmer</th>
                  <th>Price</th>
                  <th className="text-end">Stock</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="thumb-sm" style={{ background: p.category?.color }}>
                          <img src={p.image} alt="" className={p.image?.includes('/seed/') ? '' : 'photo'} />
                        </span>
                        <div>
                          {p.isRemoved ? <strong className="small d-block">{p.name}</strong> : <Link to={productPath(p)} className="small fw-semi d-block">{p.name}</Link>}
                          <span className="fs-7 text-muted-2">{p.category?.name}</span>
                          {p.isRemoved && <div className="fs-7 text-danger">Removed: {p.removedReason}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="small">{p.farmer?.stallName}</td>
                    <td className="small text-nowrap">
                      {money(p.price)}/{p.unit}
                    </td>
                    <td className="text-end">{p.quantityAvailable}</td>
                    <td>{p.isRemoved ? <StatusBadge status="removed" label="Removed" /> : <StatusBadge status={p.status} />}</td>
                    <td className="text-end">
                      {p.isRemoved ? (
                        <button type="button" className="btn btn-sm btn-soft" onClick={() => moderate(p, 'restore')}>
                          Restore
                        </button>
                      ) : (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setRemoving(p)}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.products.length === 0 && <p className="text-center text-muted-2 py-4 mb-0">Nothing here.</p>}
          </div>
        )}
      </div>
      <Pagination page={page} pages={data?.pages} onChange={setPage} />
      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={`Remove “${removing?.name}”?`}
        footer={
          <>
            <button type="button" className="btn btn-white" onClick={() => setRemoving(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={() => moderate(removing, 'remove', reason)}>
              Remove listing
            </button>
          </>
        }
      >
        <label className="form-label" htmlFor="rm-reason">Reason (sent to the farmer)</label>
        <input id="rm-reason" className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </>
  );
}
