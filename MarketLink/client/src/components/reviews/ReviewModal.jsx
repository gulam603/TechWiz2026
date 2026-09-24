import { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import { StarInput } from '../common/RatingStars';

const LABELS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent'];

/** Write a review for a product or a farmer (needs a completed order: `orderId`). */
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
      const res = await api.post('/reviews', { orderId: target.orderId, type: target.type, productId: isProduct ? target.productId : undefined, rating, comment });
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
