import { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import { StarInput } from '../common/RatingStars';

const LABELS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent'];

/**
 * Write a review for a product or a farmer. With `orderId` (a completed order) it is a verified
 * purchase; without it the review is saved as "Unverified".
 */
export default function ReviewModal({ target, onClose, onDone }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const isProduct = target.type === 'product';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/reviews', {
        orderId: target.orderId,
        type: target.type,
        productId: isProduct ? target.productId : undefined,
        farmerId: isProduct ? undefined : target.farmerId,
        rating,
        comment,
      });
      toast(res.message || 'Thanks for your review!');
      onDone?.(res);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isProduct ? `Review ${target.name}` : `Review ${target.name}`}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="review-form" className="btn btn-primary" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} Post review
          </button>
        </>
      }
    >
      <form id="review-form" onSubmit={submit} className="d-grid gap-3">
        <p className="small text-muted-2 mb-0">
          {isProduct ? 'How was the product?' : 'How was the stall: freshness, friendliness and pickup?'} {target.orderNumber && <>From order {target.orderNumber}.</>}
        </p>
        {target.orderId ? (
          <div className="review-note is-verified">
            <i className="bi bi-patch-check-fill" /> You bought this, so your review shows as a <strong>verified purchase</strong>.
          </div>
        ) : (
          <div className="review-note">
            <i className="bi bi-info-circle" /> You have not bought this on MarketLink yet, so your review will show as <strong>unverified</strong>.
          </div>
        )}
        <div className="d-flex align-items-center gap-3">
          <StarInput value={rating} onChange={setRating} />
          <strong className="small">{LABELS[rating]}</strong>
        </div>
        <div>
          <label className="form-label" htmlFor="review-comment">Your review (optional)</label>
          <textarea id="review-comment" className="form-control" rows={3} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like? Anything the farmer could do better?" />
        </div>
        <p className="fs-7 text-muted-2 mb-0">Reviews are public. Please keep them honest and friendly; reviews with offensive words are checked by our team first.</p>
      </form>
    </Modal>
  );
}
