/** The app's second seam (spec #38). Broadcasts never reach the HTTP boundary
 *  every other test mocks at, so what the app needs of a websocket is declared
 *  here: an Echo adapter supplies it in production, a double in tests. */

/** Three states, because that is all a reading can honestly say. A checkout with
 *  no broadcast credentials sits at `disconnected` forever. */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

/** Wire event name to its handler. The payload is a notification that something
 *  changed, never the new state (ADR 0005), so nobody reads it. */
export type LiveHandlers = Record<string, () => void>;

export interface LiveUpdates {
  /** Open the connection for an authenticated session. Idempotent. */
  connect(): void;
  /** Close it, releasing every channel with it. */
  disconnect(): void;
  /** Join a private channel. The returned function releases it, and every
   *  caller must call it — a channel outliving its Screen is this ticket's
   *  named failure mode. */
  subscribe(channel: string, handlers: LiveHandlers): () => void;
  /** The pair `useSyncExternalStore` wants. */
  status(): ConnectionStatus;
  watch(listener: () => void): () => void;
}
