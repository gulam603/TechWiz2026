import { useState } from 'react';

/**
 * Product / farmer image on a soft coloured tile. 3D illustrations (.webp in /uploads/seed)
 * are shown "floating"; real photos uploaded by farmers fill the tile.
 */
export default function ProduceImage({ src, alt = '', color, className = '', style }) {
  const [failed, setFailed] = useState(false);
  const isIllustration = src?.includes('/uploads/seed/') || src?.includes('/illustrations/');
  return (
    <div className={`produce-tile ${className}`} style={{ '--tile-bg': color || undefined, ...style }}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" className={isIllustration ? '' : 'photo'} onError={() => setFailed(true)} />
      ) : (
        <i className="bi bi-basket2 tile-fallback" aria-hidden="true" />
      )}
    </div>
  );
}
