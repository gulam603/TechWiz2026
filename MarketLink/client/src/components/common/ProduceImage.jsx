import { useState } from 'react';
import { imageKind } from '../../utils/images';

/**
 * Product / farmer image on a soft coloured tile. 3D illustrations (.webp in /uploads/seed) and
 * photos without a background (/uploads/cutouts) are shown "floating"; other photos fill the tile.
 */
export default function ProduceImage({ src, alt = '', color, className = '', style }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`produce-tile ${className}`} style={{ '--tile-bg': color || undefined, ...style }}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" className={imageKind(src)} onError={() => setFailed(true)} />
      ) : (
        <i className="bi bi-basket2 tile-fallback" aria-hidden="true" />
      )}
    </div>
  );
}
