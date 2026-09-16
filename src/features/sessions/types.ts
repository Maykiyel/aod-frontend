import type { Session } from '@/types/api';

/** `GET /teams/{team}/sessions` as it comes off the wire: a split body rather
 *  than a flat list. The server excludes the live Session from the rest. */
export interface SessionIndexResponse {
  live_session: Session | null;
  past_sessions: Session[];
  pagination: {
    current_page: number;
    total_pages: number;
    count: string;
    per_page: number;
    total: number;
  };
}

/** What both surfaces read. `all` is the order each draws — the live Session,
 *  then the past ones in the order the server returned them. */
export interface SessionIndex {
  live: Session | null;
  past: Session[];
  all: Session[];
  total: number;
}

/** Split once at the edge, the way `toMembership` does, so no Screen tests for
 *  a `live_session` key of its own. Nothing is re-ordered here. */
export function toSessionIndex(response: SessionIndexResponse): SessionIndex {
  const live = response.live_session;
  const past = response.past_sessions;

  return {
    live,
    past,
    all: live ? [live, ...past] : past,
    total: response.pagination.total + (live ? 1 : 0),
  };
}
