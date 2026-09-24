/** "Verified purchase" when the customer bought what they reviewed, "Unverified" otherwise. */
export default function VerifiedBadge({ verified }) {
  return verified ? (
    <span className="review-badge is-verified" title="This customer bought it on MarketLink">
      <i className="bi bi-patch-check-fill" aria-hidden="true" /> Verified purchase
    </span>
  ) : (
    <span className="review-badge" title="Written without a MarketLink purchase">
      <i className="bi bi-question-circle" aria-hidden="true" /> Unverified
    </span>
  );
}
