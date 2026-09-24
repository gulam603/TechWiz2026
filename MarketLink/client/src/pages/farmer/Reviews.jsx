import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import RatingStars from '../../components/common/RatingStars';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { timeAgo } from '../../utils/format';
import Avatar from '../../components/common/Avatar';
import ReportButton from '../../components/reviews/ReportButton';
import VerifiedBadge from '../../components/reviews/VerifiedBadge';

function ReplyBox({ review, onSaved }) {
  const { toast } = useToast();
  const [text, setText] = useState(review.response?.text || '');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post(`/farmer/reviews/${review._id}/respond`, { text });
      toast('Reply posted');
      setOpen(false);
      onSaved(res.review);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button type="button" className="btn btn-sm btn-soft mt-2" onClick={() => setOpen(true)}>
        <i className="bi bi-reply" /> {review.response?.text ? 'Edit reply' : 'Reply'}
      </button>
    );
  return (
    <form className="d-flex gap-2 mt-2 flex-grow-1" onSubmit={send}>
      <input className="form-control form-control-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a friendly reply…" maxLength={1000} required aria-label="Reply" autoFocus />
      <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
        Post
      </button>
      <button type="button" className="btn btn-white btn-sm" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}

export default function FarmerReviews() {
  useDocumentTitle('Reviews');
  const [filter, setFilter] = useState('all');
  const { data, loading, setData } = useFetch(`/farmer/reviews${filter === 'unanswered' ? '?unanswered=true' : ''}`);
  if (loading && !data) return <PageLoader />;
  const reviews = data.reviews;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <>
      <DashHeader title="Customer reviews" subtitle="See what customers say about your stall and products, and reply to them." />
      <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
        <div className="tabs-pill">
          {[
            ['all', 'All reviews'],
            ['unanswered', 'Awaiting reply'],
          ].map(([v, l]) => (
            <button key={v} type="button" className={filter === v ? 'active' : ''} onClick={() => setFilter(v)}>
              {l}
            </button>
          ))}
        </div>
        {filter === 'all' && reviews.length > 0 && (
          <span className="small">
            <RatingStars value={avg} /> <strong>{avg.toFixed(2)}</strong> average from {reviews.length} reviews
          </span>
        )}
      </div>
      {reviews.length === 0 ? (
        <EmptyState image="/illustrations/sunflower.webp" title="No reviews here" message="Reviews appear after customers collect their orders." />
      ) : (
        <div className="d-grid gap-2">
          {reviews.map((r) => (
            <div key={r._id} className="panel">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Avatar name={r.customer?.name} src={r.customer?.avatar} className="avatar-sm" />
                <strong className="small">{r.customer?.name}</strong>
                <RatingStars value={r.rating} />
                <VerifiedBadge verified={r.verified} />
                <span className="chip chip-soft">{r.type === 'product' ? r.product?.name : 'Stall review'}</span>
                <span className="fs-7 text-muted-2 ms-auto">{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && <p className="mb-0 mt-2">{r.comment}</p>}
              {r.response?.text && (
                <div className="farmer-reply mt-2">
                  <strong className="d-block fs-7 text-success">Your reply</strong>
                  {r.response.text}
                </div>
              )}
              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                <ReplyBox review={r} onSaved={(rev) => setData((d) => ({ ...d, reviews: d.reviews.map((x) => (x._id === rev._id ? { ...x, response: rev.response } : x)) }))} />
                <ReportButton targetType="review" targetId={r._id} label="Report review" className="mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
