import { useEffect, useState } from 'react';

/** Milliseconds since `startedAt`, ticking once a second. Its zero is the moment
 *  this browser's recorder started, not the moment the Screen mounted: a player
 *  who reloads mid-run must not see their clock restart (spec #40). */
export function useElapsed(startedAt: string | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return startedAt ? now - Date.parse(startedAt) : 0;
}
