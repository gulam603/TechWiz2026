import { useRef, useState } from 'react';
import ProduceImage from './ProduceImage';

function Credit({ credit }) {
  if (!credit?.author) return null;
  return (
    <p className="photo-credit">
      <i className="bi bi-camera" /> Photo: {credit.author}
      {credit.source && (
        <>
          {' '}
          ·{' '}
          <a href={credit.source} target="_blank" rel="noreferrer">
            source
          </a>
        </>
      )}
      {credit.license && <> · {credit.license}</>}
    </p>
  );
}

/**
 * Product photos: the main image plus the farmer's extra pictures. Thumbnails, arrows,
 * keyboard arrows and swipe on phones; the credit line follows the photo on screen.
 */
export default function ProductGallery({ product, children }) {
  const photos = [{ url: product.image, credit: product.imageCredit }, ...(product.gallery || [])].filter((p) => p.url);
  const [index, setIndex] = useState(0);
  const touch = useRef(null);
  const count = photos.length;
  const current = photos[Math.min(index, Math.max(count - 1, 0))] || { url: product.image };
  const go = (step) => setIndex((i) => (i + step + count) % count);

  function onKey(e) {
    if (count < 2) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  }
  function onTouchEnd(e) {
    if (touch.current === null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touch.current = null;
  }

  return (
    <div className="pd-gallery">
      <div
        className="pd-visual position-relative"
        role={count > 1 ? 'region' : undefined}
        aria-roledescription={count > 1 ? 'carousel' : undefined}
        aria-label={count > 1 ? `${product.name} photos` : undefined}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={onKey}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <ProduceImage key={current.url} src={current.url} alt={count > 1 ? `${product.name}, photo ${index + 1} of ${count}` : product.name} color={product.category?.color} className="pd-main" />
        {count > 1 && (
          <>
            <button type="button" className="pd-arrow prev" onClick={() => go(-1)} aria-label="Previous photo">
              <i className="bi bi-chevron-left" />
            </button>
            <button type="button" className="pd-arrow next" onClick={() => go(1)} aria-label="Next photo">
              <i className="bi bi-chevron-right" />
            </button>
            <span className="pd-count" aria-live="polite">
              {index + 1} / {count}
            </span>
          </>
        )}
        {children}
      </div>
      {count > 1 && (
        <div className="pd-thumbs" role="tablist" aria-label="Choose a photo">
          {photos.map((p, i) => (
            <button key={p.url} type="button" role="tab" aria-selected={i === index} aria-label={`Photo ${i + 1}`} className={i === index ? 'active' : ''} onClick={() => setIndex(i)}>
              <ProduceImage src={p.url} alt="" color={product.category?.color} />
            </button>
          ))}
        </div>
      )}
      <Credit credit={current.credit} />
    </div>
  );
}
