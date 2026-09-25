import { useState } from 'react';
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
            <span className="rs-bar-label">
              {n} <i className="bi bi-star-fill" aria-hidden="true" />
              <span className="visually-hidden"> stars</span>
            </span>
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

function ReviewCard({ review, copy = false }) {
  const { product, farmer, customer } = review;
  return (
    <figure className="rs-card" aria-hidden={copy || undefined}>
      <i className="bi bi-quote rs-quote" aria-hidden="true" />
      <div className="rs-card-top">
        <RatingStars value={review.rating} />
        <VerifiedBadge verified={review.verified} />
      </div>
      <blockquote>
        <p>{review.comment}</p>
      </blockquote>
      {(product || farmer) && (
        <Link to={product ? productPath(product) : `/farmers/${farmer.slug}`} className="rs-product" tabIndex={copy ? -1 : undefined}>
          <img src={product?.image || farmer?.logo} alt="" loading="lazy" />
          <span className="min-w-0">
            <strong className="d-block text-truncate">{product?.name || farmer?.stallName}</strong>
            {product && farmer && <span className="d-block text-truncate">from {farmer.stallName}</span>}
          </span>
        </Link>
      )}
      <figcaption>
        <Avatar name={customer?.name} src={customer?.avatar} className="avatar-sm" />
        <span className="min-w-0">
          <strong className="d-block text-truncate">{customer?.name || 'MarketLink customer'}</strong>
          <span className="rs-meta">
            {customer?.city && `${customer.city} · `}
            <time dateTime={String(review.createdAt).slice(0, 10)}>{formatDate(review.createdAt)}</time>
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** One row of the review wall; the cards are repeated once so the row can scroll without a gap. */
function Row({ reviews, reverse }) {
  return (
    <div className={`rs-track ${reverse ? 'is-reverse' : ''}`} style={{ '--rs-duration': `${Math.max(36, reviews.length * 9)}s` }}>
      {reviews.map((r) => (
        <ReviewCard key={r._id} review={r} />
      ))}
      {reviews.map((r) => (
        <div key={`copy-${r._id}`} className="rs-copy">
          <ReviewCard review={r} copy />
        </div>
      ))}
    </div>
  );
}

/**
 * Home page customer reviews: rating summary and a "wall" of review cards that slowly slides
 * (two rows in opposite directions). It pauses under the mouse, while a card has the keyboard
 * focus and with the pause button; with reduced motion it is a normal scrollable row.
 */
export default function ReviewsShowcase({ data, loading }) {
  const [paused, setPaused] = useState(false);
  const reviews = data?.reviews || [];
  const summary = data?.summary;
  const half = reviews.length >= 8 ? Math.ceil(reviews.length / 2) : reviews.length;
  const rows = [reviews.slice(0, half), reviews.slice(half)].filter((r) => r.length);

  if (!loading && !reviews.length) return null;
  return (
    <section className="section reviews-showcase" aria-labelledby="reviews-title">
      <div className="container">
        <div className="rs-head">
          <div className="rs-intro">
            <span className="eyebrow">Customer reviews</span>
            <h2 id="reviews-title" className="section-title">
              Loved by families who shop at the market
            </h2>
            <p className="text-muted-2 mb-3">Real words from customers who pre-ordered on MarketLink and collected their food at the stall.</p>
            <p className="rs-verified-note">
              <i className="bi bi-patch-check-fill" aria-hidden="true" /> Only customers who picked up an order get the “Verified purchase” badge.
            </p>
          </div>
          <div className="rs-summary">
            {summary ? (
              <>
                <div className="rs-score">
                  <strong>{summary.average.toFixed(1)}</strong>
                  <span>
                    <RatingStars value={summary.average} size="1.15rem" />
                    <span className="d-block small">from {summary.count} reviews</span>
                    <span className="rs-verified">
                      <i className="bi bi-patch-check-fill" aria-hidden="true" /> {summary.verifiedShare}% verified purchases
                    </span>
                  </span>
                </div>
                <Bars stars={summary.stars} count={summary.count} />
              </>
            ) : (
              <div className="skeleton" style={{ height: 150, opacity: 0.25 }} />
            )}
          </div>
        </div>
      </div>

      <div className={`rs-wall ${paused ? 'is-paused' : ''}`} aria-label="What customers say">
        {loading && !reviews.length ? (
          <div className="rs-track">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rs-card skeleton" style={{ minHeight: 250 }} />
            ))}
          </div>
        ) : (
          rows.map((row, i) => <Row key={i} reviews={row} reverse={i === 1} />)
        )}
      </div>
      <div className="container rs-controls">
        <button type="button" className="rs-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          <i className={`bi ${paused ? 'bi-play-fill' : 'bi-pause-fill'}`} aria-hidden="true" /> {paused ? 'Play reviews' : 'Pause reviews'}
        </button>
      </div>
    </section>
  );
}
