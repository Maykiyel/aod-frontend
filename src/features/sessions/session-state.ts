import type { TagTone } from '@/components/ui/tag/tag';

/** A Session's lifecycle state, as the backend's CONTEXT.md fixes it. */
export type SessionStatus =
  | 'queuing'
  | 'in_progress'
  | 'processing'
  | 'timeline_ready'
  | 'analysis_ready'
  | 'cancelled';

/** The Screen opening a Session leads to. Four belong to later tickets, which
 *  replace the Screen rather than the route (spec #33). */
export type SessionScreen =
  | 'lobby'
  | 'recording'
  | 'processing'
  | 'review'
  | 'cancelled'
  | 'unknown';

export interface SessionState {
  /** The state tag on a list item. Uppercase, per the copy rules. */
  label: string;
  tone: TagTone;
  /** Pulses. Only the two states someone is actually sitting in. */
  dot: boolean;
  screen: SessionScreen;
}

const STATES: Record<SessionStatus, SessionState> = {
  queuing: { label: 'LOBBY', tone: 'live', dot: true, screen: 'lobby' },
  in_progress: { label: 'RECORDING', tone: 'live', dot: true, screen: 'recording' },
  // Neutral rather than alert: the pipeline running is not an error, and cyan
  // would claim a session nobody is in is live.
  processing: { label: 'PROCESSING', tone: 'neutral', dot: false, screen: 'processing' },
  timeline_ready: { label: 'IN REVIEW', tone: 'neutral', dot: false, screen: 'review' },
  analysis_ready: { label: 'ANALYSED', tone: 'aligned', dot: false, screen: 'review' },
  // Not alert either: a cancelled session is an abandoned scrim, not a failure.
  cancelled: { label: 'CANCELLED', tone: 'neutral', dot: false, screen: 'cancelled' },
};

/** A status this client does not know. Drawn plainly rather than dropped — a row
 *  vanishing from a list is worse than one reading UNKNOWN. */
const UNKNOWN_STATE: SessionState = {
  label: 'UNKNOWN',
  tone: 'neutral',
  dot: false,
  screen: 'unknown',
};

/** Both surfaces and the open-a-session route read the same table. */
export function sessionState(status: string): SessionState {
  return STATES[status as SessionStatus] ?? UNKNOWN_STATE;
}
