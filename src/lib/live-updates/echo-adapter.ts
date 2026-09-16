import { env } from '@/config/env';
import { readToken } from '@/lib/auth-token';
import type { ConnectionStatus, LiveHandlers, LiveUpdates } from '@/lib/live-updates/live-updates';

/** The production side of the port. Echo rather than raw Pusher: the backend
 *  names its events by full class name and prefixes its channels, and Echo is
 *  what addresses both correctly — raw Pusher fails silently (spec #38). */

type EchoChannel = {
  listen(event: string, handler: () => void): EchoChannel;
  stopListening(event: string, handler: () => void): EchoChannel;
};

type EchoClient = {
  private(channel: string): EchoChannel;
  leave(channel: string): void;
  disconnect(): void;
  connector: { pusher: { connection: { state: string; bind(event: string, handler: (payload: { current: string }) => void): void } } };
};

/** Pusher's own state vocabulary, narrowed to the three a reading can say. */
function toStatus(state: string): ConnectionStatus {
  if (state === 'connected') return 'connected';
  return state === 'connecting' || state === 'initialized' ? 'connecting' : 'disconnected';
}

/** Built lazily: no credentials means Echo is never imported, the socket is
 *  never opened, and the reading stays `disconnected` rather than lying. */
export function createEchoLiveUpdates(): LiveUpdates {
  let client: EchoClient | null = null;
  let opening: Promise<void> | null = null;
  let status: ConnectionStatus = 'disconnected';

  const watchers = new Set<() => void>();
  const channels = new Map<string, Set<LiveHandlers>>();

  function announce(next: ConnectionStatus): void {
    if (next === status) return;
    status = next;
    for (const watcher of watchers) watcher();
  }

  function bind(channel: string, handlers: LiveHandlers): void {
    const joined = client?.private(channel);
    if (!joined) return;
    for (const [event, handler] of Object.entries(handlers)) joined.listen(event, handler);
  }

  async function open(key: string): Promise<void> {
    const [{ default: Echo }, { default: Pusher }] = await Promise.all([
      import('laravel-echo'),
      import('pusher-js'),
    ]);

    const echo = new Echo({
      broadcaster: 'pusher',
      key,
      cluster: env.pusherCluster,
      forceTLS: true,
      // Constructed here rather than left to Echo so pusher-js never has to be
      // hung off `window`. Bearer, not cookies (ADR 0004).
      client: new Pusher(key, {
        cluster: env.pusherCluster,
        forceTLS: true,
        channelAuthorization: {
          endpoint: env.broadcastAuthUrl,
          transport: 'ajax',
          headers: { Authorization: `Bearer ${readToken() ?? ''}` },
        },
      }),
    }) as unknown as EchoClient;

    client = echo;
    echo.connector.pusher.connection.bind('state_change', ({ current }) =>
      announce(toStatus(current)),
    );
    announce(toStatus(echo.connector.pusher.connection.state));

    for (const [channel, subscribers] of channels) {
      for (const handlers of subscribers) bind(channel, handlers);
    }
  }

  return {
    connect() {
      const key = env.pusherKey;
      if (opening || !key) return;
      announce('connecting');
      // Cleared on failure, so a handshake that fails once does not pin the
      // reading at disconnected for the rest of the session.
      opening = open(key).catch(() => {
        opening = null;
        announce('disconnected');
      });
    },

    disconnect() {
      client?.disconnect();
      client = null;
      opening = null;
      channels.clear();
      announce('disconnected');
    },

    subscribe(channel, handlers) {
      const subscribers = channels.get(channel) ?? new Set<LiveHandlers>();
      subscribers.add(handlers);
      channels.set(channel, subscribers);
      bind(channel, handlers);

      return () => {
        subscribers.delete(handlers);
        const joined = client?.private(channel);
        if (joined) {
          for (const [event, handler] of Object.entries(handlers)) {
            joined.stopListening(event, handler);
          }
        }
        if (subscribers.size > 0) return;
        channels.delete(channel);
        client?.leave(channel);
      };
    },

    status: () => status,

    watch(listener) {
      watchers.add(listener);
      return () => watchers.delete(listener);
    },
  };
}
