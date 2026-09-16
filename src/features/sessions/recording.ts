import { isCoachRole } from '@/types/api';
import type { Session, SessionParticipant, TeamMember } from '@/types/api';

/** What the capture table and the rail readings are computed from. The Session
 *  endpoint returns only Members who have joined, so the roster is merged in the
 *  way the lobby merges it: a Coach needs to see who never arrived (spec #40). */

/** The four states `participant_status` can honestly say about one player. Named
 *  apart from the port's `CaptureReading`, which is this browser's own device
 *  state: the two are different facts and only one of them can leave the machine. */
export type PlayerCapture = 'capturing' | 'not-capturing' | 'not-agreed' | 'not-joined';

export const CAPTURE_LABELS: Record<PlayerCapture, string> = {
  capturing: 'CAPTURING',
  'not-capturing': 'NOT CAPTURING',
  'not-agreed': 'NOT AGREED',
  'not-joined': 'NOT JOINED',
};

/** What that participant has stored for this run. A Coach never has either. */
export type DeliveryReading = 'both' | 'audio-only' | 'video-only' | 'nothing';

export interface CaptureRow {
  userId: number;
  username: string;
  isSelf: boolean;
  capture: PlayerCapture;
  delivery: DeliveryReading;
  /** Total delivered, so the table says "AUDIO + VIDEO — 451 MB" rather than a
   *  tick (aod-backend ADR 0015). */
  bytes: number;
}

function captureOf(status: string): PlayerCapture {
  if (status === 'recording') return 'capturing';
  return status === 'needs_consent' ? 'not-agreed' : 'not-capturing';
}

function deliveryOf(row: SessionParticipant): DeliveryReading {
  if (row.aod && row.vod) return 'both';
  if (row.aod) return 'audio-only';
  return row.vod ? 'video-only' : 'nothing';
}

/** One row, from a participant if they joined and from the roster alone if they
 *  did not. Both sources build the same shape, so both build it here. */
function rowFor(
  identity: { userId: number; username: string },
  participant: SessionParticipant | undefined,
  selfId: number | null,
): CaptureRow {
  return {
    ...identity,
    isSelf: identity.userId === selfId,
    capture: participant ? captureOf(participant.participant_status) : 'not-joined',
    delivery: participant ? deliveryOf(participant) : 'nothing',
    bytes: (participant?.aod?.size_bytes ?? 0) + (participant?.vod?.size_bytes ?? 0),
  };
}

/** A run is not a fact about the Coach who watches it, so their rows are left
 *  out: a row that can never read CAPTURING is noise on the one table whose
 *  whole job is saying who is. Both design screens list players only. */
const activePlayers = (session: Session) =>
  (session.participants ?? []).filter((row) => row.left_at === null && !isCoachRole(row.participant_role));

/** Capturing first, then the rest by name, so the rows a Coach has to act on
 *  are not scattered and the table does not reshuffle as people start. */
function compare(a: CaptureRow, b: CaptureRow): number {
  const order: PlayerCapture[] = ['capturing', 'not-capturing', 'not-agreed', 'not-joined'];
  const rank = order.indexOf(a.capture) - order.indexOf(b.capture);
  return rank !== 0 ? rank : a.username.localeCompare(b.username);
}

export function captureRows(
  session: Session,
  members: TeamMember[],
  selfId: number | null,
): CaptureRow[] {
  const joined = new Map(activePlayers(session).map((row) => [row.user_id, row]));

  const fromRoster = members
    .filter((member) => !isCoachRole(member.member_role) || joined.has(member.id))
    .map((member) =>
      rowFor({ userId: member.id, username: member.username }, joined.get(member.id), selfId),
    );

  const rostered = new Set(members.map((member) => member.id));

  // Someone recording who is no longer on the roster is still delivering a take
  // the Session will be analysed on, so they are drawn rather than dropped.
  const offRoster = [...joined.values()]
    .filter((row) => !rostered.has(row.user_id))
    .map((row) =>
      rowFor({ userId: row.user_id, username: row.username ?? `User ${row.user_id}` }, row, selfId),
    );

  return [...fromRoster, ...offRoster].sort(compare);
}

/** Capturing over joined, which is the reading the design draws. Not the roster:
 *  a player who never joined is not a player the Coach is waiting on mid-run. */
export function captureCount(rows: CaptureRow[]): { capturing: number; joined: number } {
  const present = rows.filter((row) => row.capture !== 'not-joined');
  return {
    capturing: present.filter((row) => row.capture === 'capturing').length,
    joined: present.length,
  };
}

/** The caller's own row, or null when they are not in the Session. */
export function selfRow(session: Session, selfId: number | null): SessionParticipant | null {
  return (
    (session.participants ?? []).find((row) => row.left_at === null && row.user_id === selfId) ??
    null
  );
}

const pad = (value: number) => String(value).padStart(2, '0');

/** `00:14:22`. Counts this player's own recorder, never a Session clock — the
 *  design's `ELAPSED ON SESSION CLOCK` label is wrong about it (spec #40). */
export function formatElapsed(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

/** UTC, for the same reason `formatDay` is: a reading should not shift with
 *  whichever timezone the browser happens to sit in. */
const CLOCK = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

export const formatClock = (iso: string | null) => (iso ? CLOCK.format(new Date(iso)) : '—');

/** Whole units, because a delivered file's size is a fact a Coach glances at.
 *  MB against the endpoint's own ceilings, which are quoted in MB and GB. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${Math.round(bytes / 1_000_000)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

/** What the delivery column says. `nothing` reads differently once the run has
 *  ended: before then no upload has been asked for, so it is not yet a finding. */
export function deliveryLabel(row: CaptureRow, sessionStatus: string): string {
  if (row.capture === 'not-joined') return '—';

  const size = row.bytes > 0 ? ` — ${formatBytes(row.bytes)}` : '';

  switch (row.delivery) {
    case 'both':
      return `AUDIO + VIDEO${size}`;
    case 'audio-only':
      return `AUDIO ONLY${size}`;
    case 'video-only':
      return `VIDEO ONLY${size}`;
    case 'nothing':
      return sessionStatus === 'delivering' ? 'NOTHING DELIVERED' : 'NOTHING YET';
  }
}
