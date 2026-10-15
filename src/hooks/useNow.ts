import { useEffect, useState } from 'react';

/**
 * Ticking clock derived from Date.now() so timers stay accurate even when the
 * browser throttles intervals in background tabs.
 */
export function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
