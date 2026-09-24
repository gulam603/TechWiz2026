import { useState } from 'react';
import { isIllustration } from '../../utils/images';

/**
 * Product / farmer image on a soft coloured tile. 3D illustrations (.webp in /uploads/seed)
 * are shown "floating"; real photos (seeded stock photos and farmer uploads) fill the tile.
 */
export default function ProduceImage({ src, alt = '', color, className = '', style }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`produce-tile ${className}`} style={{ '--tile-bg': color || undefined, ...style }}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" className={isIllustration(src) ? '' : 'photo'} onError={() => setFailed(true)} />
      ) : (
        <i className="bi bi-basket2 tile-fallback" aria-hidden="true" />
      )}
    </div>
  );
}
