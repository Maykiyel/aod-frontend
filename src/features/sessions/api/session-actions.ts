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

/** What a departure destroyed. Stopping and leaving both destroy work and return
 *  200, so this block is the only thing separating "you left, nothing lost" from
 *  "your take is gone" (aod-backend ADR 0013). */
export interface Discarded {
  audio: boolean;
  video: boolean;
}

/** Leaving during a run, which is the only way out of one: stopping has the same
 *  destructive effect, so shipping both would be two controls for one outcome. */
export const leaveRun = (sessionId: number) =>
  api.post<SessionBody & { discarded: Discarded }>(`/sessions/${sessionId}/leave`);

/** Player-driven, because `getDisplayMedia` needs a user gesture and no client
 *  can begin capturing off the back of a broadcast. Called once both tracks are
 *  live, which is what makes `participant_status` honest about who is capturing. */
export const startRecording = (sessionId: number) => act(sessionId, 'start-recording');

/** The Coach's "match over". It broadcasts like every other status move, and
 *  that broadcast is what tells five browsers to finish and upload (ADR 0015).
 *  Completing the Session is a second control, and belongs to #8. */
export const endRun = (sessionId: number) => act(sessionId, 'transitions', { to: 'delivering' });
