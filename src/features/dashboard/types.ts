import type { Team, User } from '@/types/api';

/** The dashboard endpoints as they come off the wire, hand-written rather than
 *  taken from `api.generated.ts`: the generator reads validation rules, and both
 *  bodies are assembled in the controller, so it emits `players: string` and a
 *  non-null `from`/`to` (ADR 0003 — treat generated shapes as a hint). */

/** `window` on both endpoints: the pool's size and the date span it covers. */
export interface DashboardWindow {
  sessions_requested: number;
  sessions_analyzed: number;
  /** Earliest and latest `analysis_ready_at` in the pool; null when it is empty. */
  from: string | null;
  to: string | null;
}

export interface CommunicationKpi {
  comm_frequency: number;
  /** Valence-derived, never an accuracy. Null when nothing in the pool was assessed. */
  alignment_rate: number | null;
  absence_ms: number;
  calls_classified: number;
}

export interface CommMix {
  informative: number;
  declarative: number;
  compound: number;
  /** A tally over `calls_classified`, not a fourth comm type (aod-backend ADR 0011). */
  redundant: number;
  /** Dead-air periods counted; their duration is `kpi.absence_ms`. */
  absence: number;
  calls_classified: number;
}

export interface PlayerLine {
  user_id: number;
  username: string;
  is_online: boolean;
  comm_frequency: number;
  alignment_rate: number | null;
  calls_logged: number;
  sessions_played: number;
}

/** A player's own line: the same computation minus `is_online` and `sessions_played`. */
export type OwnLine = Pick<
  PlayerLine,
  'user_id' | 'comm_frequency' | 'alignment_rate' | 'calls_logged'
>;

/** Each metric's median across the roster, computed independently. Null below a
 *  population of two. */
export interface TeamMedian {
  comm_frequency: number | null;
  alignment_rate: number | null;
  calls_logged: number | null;
}

/** A short pool replaces a data card wholesale rather than nulling its fields,
 *  so the two shapes never overlap. */
interface ShortPool {
  message: string;
}

export interface DashboardHeaderResponse {
  identity: { team: Team; user: User; analysis_ready_count: number };
  window: DashboardWindow;
  kpi: CommunicationKpi | ShortPool;
  comm_mix: CommMix | ShortPool;
}

export type DashboardPlayersResponse =
  | { window: DashboardWindow; players: PlayerLine[] }
  | { window: DashboardWindow; you: OwnLine; team_median: TeamMedian }
  | { window: DashboardWindow; message: string };

/** A data card is its numbers or the short-pool message. Discriminated once at
 *  the edge, the way `toMembership` does, so no call site tests for a `message`
 *  key. */
export type Card<T> = { status: 'pooled'; value: T } | { status: 'short'; message: string };

export interface DashboardHeader {
  team: Team;
  user: User;
  /** The team's all-time analysis-ready total, independent of the pool size. */
  analysisReadyCount: number;
  window: DashboardWindow;
  kpi: Card<CommunicationKpi>;
  commMix: Card<CommMix>;
}

/** The players body, named by the shape the server chose. The server's own role
 *  branch is the authority, so the screen reads that rather than `member_role`
 *  (ADR 0007). `short` is the one state that carries no role signal. */
export type PlayerBreakdown =
  | { status: 'roster'; window: DashboardWindow; players: PlayerLine[] }
  | { status: 'comparison'; window: DashboardWindow; you: OwnLine; teamMedian: TeamMedian }
  | { status: 'short'; window: DashboardWindow; message: string };

function isShortPool(card: object): card is ShortPool {
  return 'message' in card;
}

function toCard<T extends object>(card: T | ShortPool): Card<T> {
  return isShortPool(card) ? { status: 'short', message: card.message } : { status: 'pooled', value: card };
}

export function toDashboardHeader(response: DashboardHeaderResponse): DashboardHeader {
  return {
    team: response.identity.team,
    user: response.identity.user,
    analysisReadyCount: response.identity.analysis_ready_count,
    window: response.window,
    kpi: toCard(response.kpi),
    commMix: toCard(response.comm_mix),
  };
}

export function toPlayerBreakdown(response: DashboardPlayersResponse): PlayerBreakdown {
  if ('players' in response) {
    return { status: 'roster', window: response.window, players: response.players };
  }
  if ('you' in response) {
    return {
      status: 'comparison',
      window: response.window,
      you: response.you,
      teamMedian: response.team_median,
    };
  }
  return { status: 'short', window: response.window, message: response.message };
}
