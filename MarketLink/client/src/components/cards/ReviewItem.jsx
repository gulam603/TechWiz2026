import { Link } from 'react-router-dom';
import RatingStars from '../common/RatingStars';
import { timeAgo } from '../../utils/format';
import { productPath } from '../../utils/links';
import Avatar from '../common/Avatar';

export default function ReviewItem({ review, showProduct = false, farmerName }) {
  return (
    <div className="review-item">
      <div className="d-flex align-items-center gap-2 mb-1">
        <Avatar name={review.customer?.name || 'Customer'} src={review.customer?.avatar} className="avatar-sm" />
        <div className="flex-grow-1">
          <strong className="small">{review.customer?.name || 'Customer'}</strong>
          <div className="fs-7 text-muted-2">{timeAgo(review.createdAt)}</div>
        </div>
        <RatingStars value={review.rating} />
      </div>
      {showProduct && review.product?.name && (
        <div className="fs-7 text-muted-2 mb-1">
          on <Link to={productPath(review.product)}>{review.product.name}</Link>
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
