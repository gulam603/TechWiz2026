import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

/**
 * Loads data from the API and re-loads when `path` changes.
 * const { data, loading, error, reload, setData } = useFetch('/products?page=1');
 * Pass `null` as the path to skip loading.
 */
export default function useFetch(path, { keepPrevious = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    if (!keepPrevious && !first.current) setData(null);
    api
      .get(path, { signal: controller.signal })
      .then((result) => {
        setData(result);
        setLoading(false);
        first.current = false;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });
    return () => controller.abort();
  }, [path, tick, keepPrevious]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload, setData };
}
