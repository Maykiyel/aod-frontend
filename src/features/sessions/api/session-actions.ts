import { api } from '@/lib/api-client';
import type { Session } from '@/types/api';

/** Everything the lobby can ask of a Session. Each answers with the Session as
 *  it now stands, but nothing here writes that into the cache: the caller
 *  invalidates and refetches, the same as a broadcast does (ADR 0005). */

type SessionBody = { session: Session };

const act = (sessionId: number, path: string, body?: unknown) =>
  api.post<SessionBody>(`/sessions/${sessionId}/${path}`, body);

/** Idempotent, and a member who had left is reset to `needs_consent` — which is
 *  what makes "asked again after rejoining" the server's rule rather than ours. */
export const joinSession = (sessionId: number) => act(sessionId, 'join');

export const recordConsent = (sessionId: number) => act(sessionId, 'consent');

export const leaveSession = (sessionId: number) => act(sessionId, 'leave');

export const startSession = (sessionId: number) => act(sessionId, 'start');

/** Cancelling is the one lobby move that goes through the shared transitions
 *  endpoint; start and complete are their own (ADR 0010 in the backend). */
export const cancelSession = (sessionId: number) =>
  act(sessionId, 'transitions', { to: 'cancelled' });
