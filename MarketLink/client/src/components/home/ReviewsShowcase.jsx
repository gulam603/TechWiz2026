import { useRef } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../common/RatingStars';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../reviews/VerifiedBadge';
import { formatDate } from '../../utils/format';
import { productPath } from '../../utils/links';

function Bars({ stars, count }) {
  return (
    <ul className="rs-bars" aria-label="How customers rate MarketLink farmers">
      {[5, 4, 3, 2, 1].map((n) => {
        const share = count ? Math.round(((stars?.[n] || 0) / count) * 100) : 0;
        return (
          <li key={n}>
            <span className="rs-bar-label">{n} star</span>
            <span className="rs-bar" aria-hidden="true">
              <span style={{ width: `${share}%` }} />
            </span>
            <span className="rs-bar-value">{share}%</span>
          </li>
        );
      })}
    </ul>
  );
}

function ReviewCard({ review }) {
  const about = review.product || review.farmer;
  const aboutLink = review.product ? productPath(review.product) : `/farmers/${review.farmer?.slug}`;
  return (
    <figure className="rs-card">
      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <RatingStars value={review.rating} />
        <VerifiedBadge verified={review.verified} />
      </div>
      <blockquote>“{review.comment}”</blockquote>
      <figcaption>
        <Avatar name={review.customer?.name} src={review.customer?.avatar} className="avatar-sm" />
        <span className="min-w-0">
          <strong className="d-block text-truncate">{review.customer?.name || 'MarketLink customer'}</strong>
          <span className="rs-meta">
            {formatDate(review.createdAt)}
            {about && (
              <>
                {' · '}
                <Link to={aboutLink}>{review.product?.name || review.farmer?.stallName}</Link>
              </>
            )}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Home page customer reviews: rating summary on the left, a swipeable row of reviews on the right. */
export default function ReviewsShowcase({ data, loading }) {
  const rail = useRef(null);
  const reviews = data?.reviews || [];
  const summary = data?.summary;

  function scroll(step) {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('.rs-card');
    el.scrollBy({ left: step * ((card?.offsetWidth || 300) + 16), behavior: 'smooth' });
  }

  if (!loading && !reviews.length) return null;
  return (
    <section className="section reviews-showcase" aria-labelledby="reviews-title">
      <div className="container">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-4">
            <div className="rs-summary">
              <span className="eyebrow">Customer reviews</span>
              <h2 id="reviews-title" className="section-title">What families say about our farmers</h2>
              {summary ? (
                <>
                  <div className="rs-score">
                    <strong>{summary.average.toFixed(1)}</strong>
                    <span>
                      <RatingStars value={summary.average} size="1.1rem" />
                      <span className="d-block small text-muted-2">from {summary.count} reviews</span>
                    </span>
                  </div>
                  <Bars stars={summary.stars} count={summary.count} />
                  <p className="rs-verified">
                    <i className="bi bi-patch-check-fill" aria-hidden="true" /> {summary.verifiedShare}% are verified purchases
                  </p>
                </>
              ) : (
                <div className="skeleton mt-3" style={{ height: 180 }} />
              )}
            </div>
          </div>
          <div className="col-lg-8 min-w-0">
            <div className="rs-rail-head">
              <p className="mb-0 text-muted-2 small">Only customers who picked up an order get the “Verified purchase” badge.</p>
              <div className="d-flex gap-2">
                <button type="button" className="rs-arrow" onClick={() => scroll(-1)} aria-label="Previous reviews">
                  <i className="bi bi-arrow-left" aria-hidden="true" />
                </button>
                <button type="button" className="rs-arrow" onClick={() => scroll(1)} aria-label="More reviews">
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="rs-rail" ref={rail} tabIndex={0} aria-label="Reviews">
              {loading && !reviews.length
                ? [0, 1, 2].map((i) => <div key={i} className="rs-card skeleton" style={{ minHeight: 230 }} />)
                : reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
