import { api } from '@/lib/api-client';
import type { Session } from '@/types/api';

/** `session_name` is the only field `StoreSessionRequest` takes, and its limit.
 *  Held here so the field can stop an over-long name before a round trip. */
export const SESSION_NAME_MAX_LENGTH = 255;

/** Creates the Session and adds the calling coach as its first participant. The
 *  server refuses 422 when the team already has an active one. */
export async function createSession(teamId: number, sessionName: string): Promise<Session> {
  const { session } = await api.post<{ session: Session }>(`/teams/${teamId}/sessions`, {
    session_name: sessionName,
  });
  return session;
}
