import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toQuery } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import DayDots from '../../components/common/DayDots';
import { PageLoader } from '../../components/common/Loader';
import { formatDate } from '../../utils/format';

export default function AdminFarmers() {
  useDocumentTitle('Manage farmers');
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [suspending, setSuspending] = useState(null);
  const [reason, setReason] = useState('');
  const { data, loading, reload } = useFetch(`/admin/farmers${toQuery({ status, search, page })}`);

  async function setFarmerStatus(farmer, next, why) {
    try {
      await api.patch(`/admin/farmers/${farmer._id}/status`, { status: next, reason: why });
      toast(next === 'active' ? `${farmer.stallName} approved` : `${farmer.stallName} suspended`);
      setSuspending(null);
      setViewing(null);
      setReason('');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <DashHeader title="Farmers" subtitle="Approve new registrations before they can list products, or suspend stalls that break the guidelines." />
      <div className="table-card">
        <div className="table-toolbar">
          <div className="tabs-pill">
            {[
              ['', 'All'],
              ['pending', 'Pending approval'],
              ['active', 'Approved'],
              ['suspended', 'Suspended'],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                className={status === v ? 'active' : ''}
                onClick={() => {
                  setParams(v ? { status: v } : {});
                  setPage(1);
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="search-pill" style={{ maxWidth: 280 }}>
            <i className="bi bi-search" />
            <input placeholder="Search stall, contact or e-mail" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search farmers" />
          </div>
        </div>
        {loading && !data ? (
          <PageLoader />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Stall</th>
                  <th>Contact</th>
                  <th>Markets</th>
                  <th className="text-end">Products</th>
                  <th className="text-end">Orders</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.farmers.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="thumb-sm">
                          <img src={f.logo} alt="" />
                        </span>
                        <div>
                          <strong className="d-block small">{f.stallName}</strong>
                          <span className="fs-7 text-muted-2">Joined {formatDate(f.user?.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="small">
                      {f.contactPerson}
                      <div className="fs-7 text-muted-2">{f.email}</div>
                    </td>
                    <td className="small">{f.markets.map((m) => m.name).join(', ') || '–'}</td>
                    <td className="text-end">{f.productCount}</td>
                    <td className="text-end">{f.orderCount}</td>
                    <td>
                      <StatusBadge status={f.user?.status} label={f.user?.status === 'active' ? 'Approved' : undefined} />
                    </td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-white" onClick={() => setViewing(f)}>
                        View
                      </button>{' '}
                      {f.user?.status !== 'active' ? (
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => setFarmerStatus(f, 'active')}>
                          <i className="bi bi-check-lg" /> {f.user?.status === 'pending' ? 'Approve' : 'Re-activate'}
                        </button>
                      ) : (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setSuspending(f)}>
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.farmers.length === 0 && <p className="text-center text-muted-2 py-4 mb-0">No farmers found.</p>}
          </div>
        )}
      </div>
      <Pagination page={page} pages={data?.pages} onChange={setPage} />

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing?.stallName || ''} size="modal-lg">
        {viewing && (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="info-row"><span>Contact person</span><span>{viewing.contactPerson}</span></div>
              <div className="info-row"><span>Phone</span><span>{viewing.phone}</span></div>
              <div className="info-row"><span>E-mail</span><span>{viewing.email}</span></div>
              <div className="info-row"><span>Address</span><span>{viewing.address}</span></div>
              <div className="info-row"><span>Status</span><span><StatusBadge status={viewing.user?.status} /></span></div>
              <div className="info-row"><span>Last login</span><span>{viewing.user?.lastLoginAt ? formatDate(viewing.user.lastLoginAt, { time: true }) : '–'}</span></div>
            </div>
            <div className="col-md-6">
              <p className="small">{viewing.bio || 'No description yet.'}</p>
              <div className="mb-2"><DayDots days={viewing.operatingDays} /></div>
              <div className="small text-muted-2">Markets: {viewing.markets.map((m) => m.name).join(', ') || '–'}</div>
              <div className="small text-muted-2">Map pin: {viewing.latitude ? `${viewing.latitude}, ${viewing.longitude}` : 'not set'}</div>
              {viewing.isActive && (
                <Link to={`/farmers/${viewing.slug}`} className="btn btn-sm btn-white mt-3">
                  Open public page
                </Link>
              )}
            </div>
            <div className="col-12 d-flex justify-content-end gap-2">
              {viewing.user?.status !== 'active' ? (
                <button type="button" className="btn btn-primary" onClick={() => setFarmerStatus(viewing, 'active')}>
                  Approve stall
                </button>
              ) : (
                <button type="button" className="btn btn-outline-danger" onClick={() => setSuspending(viewing)}>
                  Suspend stall
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(suspending)}
        onClose={() => setSuspending(null)}
        title={`Suspend ${suspending?.stallName}?`}
        footer={
          <>
            <button type="button" className="btn btn-white" onClick={() => setSuspending(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setFarmerStatus(suspending, 'suspended', reason)}>
              Suspend
            </button>
          </>
        }
      >
        <p className="small text-muted-2">The farmer can no longer log in and all their products are hidden from customers.</p>
        <label className="form-label" htmlFor="suspend-reason">Reason (e-mailed to the farmer)</label>
        <textarea id="suspend-reason" className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </>
  );
}
