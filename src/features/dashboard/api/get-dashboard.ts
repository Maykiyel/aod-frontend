import { queryOptions } from '@tanstack/react-query';
import type {
  DashboardHeaderResponse,
  DashboardPlayersResponse,
} from '@/features/dashboard/types';
import { toDashboardHeader, toPlayerBreakdown } from '@/features/dashboard/types';
import { api } from '@/lib/api-client';

/** The pool size the backend defaults to. Sent explicitly so the query key and
 *  the request always agree about what the numbers cover. */
export const DEFAULT_POOL_SIZE = 3;

/** One prefix for both endpoints, so a session reaching analysis-ready can
 *  invalidate the whole dashboard in one call when #5 wires broadcasts up. */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  header: (sessions: number) => ['dashboard', 'header', sessions] as const,
  players: (sessions: number) => ['dashboard', 'players', sessions] as const,
};

/** `staleTime: 0` against the client's 30s default: the pool changes whenever a
 *  coach marks a session analysis-ready, so these are re-read on mount and on
 *  refocus rather than served from a cache the screen was opened with. */
const ALWAYS_STALE = { staleTime: 0 } as const;

export function dashboardHeaderQuery(sessions = DEFAULT_POOL_SIZE) {
  return queryOptions({
    queryKey: dashboardKeys.header(sessions),
    queryFn: async ({ signal }) =>
      toDashboardHeader(
        await api.get<DashboardHeaderResponse>(`/dashboard/header?sessions=${sessions}`, { signal }),
      ),
    ...ALWAYS_STALE,
  });
}

export function dashboardPlayersQuery(sessions = DEFAULT_POOL_SIZE) {
  return queryOptions({
    queryKey: dashboardKeys.players(sessions),
    queryFn: async ({ signal }) =>
      toPlayerBreakdown(
        await api.get<DashboardPlayersResponse>(`/dashboard/players?sessions=${sessions}`, {
          signal,
        }),
      ),
    ...ALWAYS_STALE,
  });
}
