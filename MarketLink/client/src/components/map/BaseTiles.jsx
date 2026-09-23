import { useRef, useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { TILE_PROVIDERS } from '../../config';

/**
 * Background map tiles with automatic fallback: if several tiles of the current
 * provider fail (blocked / offline), the next provider in TILE_PROVIDERS is used.
 * `onUnavailable` is called when no provider could load tiles.
 */
export default function BaseTiles({ onUnavailable }) {
  const [index, setIndex] = useState(0);
  const failures = useRef(0);
  const loaded = useRef(false);
  const provider = TILE_PROVIDERS[index];

  function handleError() {
    if (loaded.current) return; // a few missing tiles after a good start are normal
    failures.current += 1;
    if (failures.current < 4) return;
    failures.current = 0;
    if (index < TILE_PROVIDERS.length - 1) setIndex(index + 1);
    else onUnavailable?.();
  }

  return (
    <TileLayer
      key={provider.name}
      url={provider.url}
      attribution={provider.attribution}
      subdomains={provider.subdomains || 'abc'}
      maxZoom={provider.maxZoom}
      referrerPolicy="strict-origin-when-cross-origin"
      eventHandlers={{
        tileerror: handleError,
        tileload: () => {
          loaded.current = true;
        },
      }}
    />
  );
}
