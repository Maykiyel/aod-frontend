import { useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { LiveUpdatesContext } from '@/lib/live-updates/context';
import type { ConnectionStatus, LiveHandlers, LiveUpdates } from '@/lib/live-updates/live-updates';

/** Not a character an event name can contain. */
const SEPARATOR = '\u0000';

function useLiveUpdates(): LiveUpdates {
  const live = useContext(LiveUpdatesContext);
  if (!live) throw new Error('Live updates are only available inside AppProvider.');
  return live;
}

/** The reading, wherever it is drawn. */
export function useLiveStatus(): ConnectionStatus {
  const live = useLiveUpdates();
  return useSyncExternalStore(live.watch, live.status);
}

/** One socket for the authenticated session: opened where the authenticated
 *  tree mounts, closed when it unmounts, which is what a logout or a 401 does. */
export function useLiveConnection(): ConnectionStatus {
  const live = useLiveUpdates();

  useEffect(() => {
    live.connect();
    return () => live.disconnect();
  }, [live]);

  return useLiveStatus();
}

/** A Screen's channel. Handlers are read through a ref so a new object every
 *  render does not resubscribe — resubscribing is how a grid ends up showing
 *  each participant twice. Pass `null` to subscribe to nothing. */
export function useLiveChannel(channel: string | null, handlers: LiveHandlers): void {
  const live = useLiveUpdates();
  const latest = useRef(handlers);
  // The event names, joined so a fresh handlers object of the same shape
  // compares equal as a dependency. Resubscribing is how rows end up doubled.
  const eventKey = Object.keys(handlers).sort().join(SEPARATOR);

  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    if (!channel) return;

    const bound: LiveHandlers = {};
    for (const event of eventKey.split(SEPARATOR)) {
      bound[event] = () => latest.current[event]?.();
    }

    return live.subscribe(channel, bound);
  }, [live, channel, eventKey]);
}
