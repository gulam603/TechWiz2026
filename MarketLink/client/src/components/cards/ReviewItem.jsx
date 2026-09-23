import { Link } from 'react-router-dom';
import RatingStars from '../common/RatingStars';
import { initials, timeAgo } from '../../utils/format';

export default function ReviewItem({ review, showProduct = false, farmerName }) {
  return (
    <div className="review-item">
      <div className="d-flex align-items-center gap-2 mb-1">
        <span className="avatar avatar-sm">{initials(review.customer?.name || 'Customer')}</span>
        <div className="flex-grow-1">
          <strong className="small">{review.customer?.name || 'Customer'}</strong>
          <div className="fs-7 text-muted-2">{timeAgo(review.createdAt)}</div>
        </div>
        <RatingStars value={review.rating} />
      </div>
      {showProduct && review.product?.name && (
        <div className="fs-7 text-muted-2 mb-1">
          on <Link to={`/products/${review.product._id}`}>{review.product.name}</Link>
        </div>
      )}
      {review.comment && <p className="mb-0 small">{review.comment}</p>}
      {review.response?.text && (
        <div className="farmer-reply">
          <strong className="d-block fs-7 text-success mb-1">
            <i className="bi bi-reply-fill" /> Reply from {farmerName || 'the farmer'}
          </strong>
          {review.response.text}
        </div>
      )}
    </div>
  );
}
