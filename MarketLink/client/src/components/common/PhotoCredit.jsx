/** Small "Photo: author (licence)" line on a banner photo, linking to the original. */
export default function PhotoCredit({ credit }) {
  if (!credit?.author) return null;
  return (
    <span className="hero-credit">
      <i className="bi bi-camera" aria-hidden="true" /> Photo:{' '}
      {credit.source ? (
        <a href={credit.source} target="_blank" rel="noreferrer">
          {credit.author}
        </a>
      ) : (
        credit.author
      )}
      {credit.license && ` (${credit.license})`}
    </span>
  );
}
