import { act } from '@testing-library/react';
import type { ConnectionStatus, LiveHandlers, LiveUpdates } from '@/lib/live-updates/live-updates';

/** The test side of the live-updates port. An input, not a place to assert
 *  behaviour — except for subscription bookkeeping, which two subscriptions
 *  render exactly as one, so the boundary is the only place it is visible. */
export interface LiveUpdatesDouble extends LiveUpdates {
  /** Deliver a named event on a named channel, as the server would. */
  emit(channel: string, event: string): void;
  /** Move the connection, as a dropped websocket would. */
  setStatus(status: ConnectionStatus): void;
  /** Channels currently held open. */
  openChannels(): string[];
  /** Every subscribe and release, in order. */
  readonly subscribed: string[];
  readonly released: string[];
}

export function createLiveUpdatesDouble(
  initialStatus: ConnectionStatus = 'connected',
): LiveUpdatesDouble {
  let status = initialStatus;
  const watchers = new Set<() => void>();
  const channels = new Map<string, Set<LiveHandlers>>();
  const subscribed: string[] = [];
  const released: string[] = [];

  function announce(next: ConnectionStatus): void {
    if (next === status) return;
    status = next;
    for (const watcher of watchers) watcher();
  }

  return {
    connect: () => announce(initialStatus),
    disconnect: () => {
      channels.clear();
      announce('disconnected');
    },

    subscribe(channel, handlers) {
      const subscribers = channels.get(channel) ?? new Set<LiveHandlers>();
      subscribers.add(handlers);
      channels.set(channel, subscribers);
      subscribed.push(channel);

      return () => {
        released.push(channel);
        subscribers.delete(handlers);
        if (subscribers.size === 0) channels.delete(channel);
      };
    },

    status: () => status,

    watch(listener) {
      watchers.add(listener);
      return () => watchers.delete(listener);
    },

    emit(channel, event) {
      const subscribers = channels.get(channel);
      if (!subscribers) return;
      // Wrapped here rather than at every call site: an event arriving is a
      // render the test did not start.
      act(() => {
        for (const handlers of subscribers) handlers[event]?.();
      });
    },

    setStatus: (next) => act(() => announce(next)),

    openChannels: () => [...channels.keys()],

    subscribed,
    released,
  };
}
