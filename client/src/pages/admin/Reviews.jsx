import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toQuery } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import RatingStars from '../../components/common/RatingStars';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Loader';
import { formatDate } from '../../utils/format';

export default function AdminReviews() {
  useDocumentTitle('Moderate reviews');
  const { toast } = useToast();
  const [state, setState] = useState('active');
  const [rating, setRating] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, reload } = useFetch(`/admin/reviews${toQuery({ state, rating, search, page })}`);

  async function moderate(review, action) {
    try {
      await api.patch(`/admin/reviews/${review._id}/moderate`, { action, reason: 'Violates review guidelines' });
      toast(action === 'remove' ? 'Review removed' : 'Review restored');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <DashHeader title="Reviews" subtitle="Remove reviews that are abusive, spam or break the platform guidelines. Ratings are recalculated automatically." />
      <div className="table-card">
        <div className="table-toolbar">
          <div className="tabs-pill">
            {[
              ['active', 'Visible'],
              ['removed', 'Removed'],
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
          <div className="d-flex gap-2">
            <select className="form-select form-select-sm" value={rating} onChange={(e) => setRating(e.target.value)} aria-label="Rating filter">
              <option value="">All ratings</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <div className="search-pill" style={{ maxWidth: 240 }}>
              <i className="bi bi-search" />
              <input placeholder="Search comments" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search comments" />
            </div>
          </div>
        </div>
        {loading && !data ? (
          <PageLoader />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Review</th>
                  <th>About</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.reviews.map((r) => (
                  <tr key={r._id}>
                    <td style={{ maxWidth: 360 }}>
                      <RatingStars value={r.rating} />
                      <div className="small">{r.comment || <em className="text-muted-2">No comment</em>}</div>
                      {r.isRemoved && <div className="fs-7 text-danger">Removed: {r.removedReason}</div>}
                    </td>
                    <td className="small">
                      {r.type === 'product' ? r.product?.name : 'Stall'}
                      <div className="fs-7 text-muted-2">{r.farmer?.stallName}</div>
                    </td>
                    <td className="small">{r.customer?.name}</td>
                    <td className="small text-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="text-end">
                      {r.isRemoved ? (
                        <button type="button" className="btn btn-sm btn-soft" onClick={() => moderate(r, 'restore')}>
                          Restore
                        </button>
                      ) : (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => moderate(r, 'remove')}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.reviews.length === 0 && <p className="text-center text-muted-2 py-4 mb-0">No reviews found.</p>}
          </div>
        )}
      </div>
      <Pagination page={page} pages={data?.pages} onChange={setPage} />
    </>
  );
}
