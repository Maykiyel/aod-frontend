import { isCoachRole } from '@/types/api';
import type { Session, TeamMember } from '@/types/api';

/** What the lobby grid and the start gate are computed from. The Session
 *  endpoint returns only Members who have joined, so the roster is merged in:
 *  a Coach needs to see who is still missing (spec #38). */

/** The three things a row can say. The design also draws `NEEDS: MIC` and
 *  `NEEDS: SCREEN SHARE`; both are device state and belong to #7. */
export type ParticipantReading = 'ready' | 'needs-consent' | 'not-joined';

export const READING_LABELS: Record<ParticipantReading, string> = {
  ready: 'READY',
  'needs-consent': 'NEEDS: CONSENT',
  'not-joined': 'NOT JOINED YET',
};

export interface LobbyRow {
  userId: number;
  username: string;
  isCoach: boolean;
  isSelf: boolean;
  reading: ParticipantReading;
}

export interface StartGate {
  /** Joined players who have agreed, over joined players. Not the roster: a
   *  rostered player who never joined does not block `Session::start()`. */
  ready: number;
  joined: number;
  canStart: boolean;
  /** Named so a Coach knows whether to wait or to act. Null when it can start. */
  reason: string | null;
}

/** `needs_consent` is the only participant status the lobby withholds a start
 *  for; `recording` and `completed` cannot occur while a Session is queuing. */
const readingFor = (status: string): ParticipantReading =>
  status === 'needs_consent' ? 'needs-consent' : 'ready';

/** Active participants only. `activeParticipants` already excludes departed
 *  rows, but a stale body should not resurrect one. */
function activeParticipants(session: Session) {
  return (session.participants ?? []).filter((row) => row.left_at === null);
}

/** Coaches first, then joined before absent, then by name — so the grid does not
 *  reshuffle as people arrive. */
function compare(a: LobbyRow, b: LobbyRow): number {
  if (a.isCoach !== b.isCoach) return a.isCoach ? -1 : 1;
  const aAbsent = a.reading === 'not-joined';
  const bAbsent = b.reading === 'not-joined';
  if (aAbsent !== bAbsent) return aAbsent ? 1 : -1;
  return a.username.localeCompare(b.username);
}

export function lobbyRows(
  session: Session,
  members: TeamMember[],
  selfId: number | null,
): LobbyRow[] {
  const joined = new Map(activeParticipants(session).map((row) => [row.user_id, row]));
  const rostered = new Set(members.map((member) => member.id));

  const fromRoster = members.map((member): LobbyRow => {
    const participant = joined.get(member.id);
    return {
      userId: member.id,
      username: member.username,
      // The participant row snapshots the role at join time, so it wins over
      // the roster's current one wherever the two disagree.
      isCoach: isCoachRole(participant?.participant_role ?? member.member_role),
      isSelf: member.id === selfId,
      reading: participant ? readingFor(participant.participant_status) : 'not-joined',
    };
  });

  // Someone in the Session who is no longer on the roster still holds the start
  // gate, so they are drawn rather than dropped.
  const offRoster = [...joined.values()]
    .filter((row) => !rostered.has(row.user_id))
    .map(
      (row): LobbyRow => ({
        userId: row.user_id,
        username: row.username ?? `User ${row.user_id}`,
        isCoach: isCoachRole(row.participant_role),
        isSelf: row.user_id === selfId,
        reading: readingFor(row.participant_status),
      }),
    );

  return [...fromRoster, ...offRoster].sort(compare);
}

export function startGate(rows: LobbyRow[]): StartGate {
  const players = rows.filter((row) => !row.isCoach && row.reading !== 'not-joined');
  const ready = players.filter((row) => row.reading === 'ready').length;
  const outstanding = players.length - ready;

  if (players.length === 0) {
    return { ready, joined: 0, canStart: false, reason: 'No players have joined yet.' };
  }

  if (outstanding > 0) {
    const reason =
      outstanding === 1
        ? '1 player has not agreed to be recorded yet.'
        : `${outstanding} players have not agreed to be recorded yet.`;
    return { ready, joined: players.length, canStart: false, reason };
  }

  return { ready, joined: players.length, canStart: true, reason: null };
}

/** The caller's own row, or null when they are not in the Session. Drives the
 *  Consent panel's two states and whether leaving is offered. */
export function selfParticipant(session: Session, selfId: number | null) {
  return activeParticipants(session).find((row) => row.user_id === selfId) ?? null;
}

/** Two characters, as the HexSlot takes them. */
export const initialsOf = (username: string) => username.slice(0, 2).toUpperCase();
