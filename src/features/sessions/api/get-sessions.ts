import { queryOptions } from '@tanstack/react-query';
import { toSessionIndex } from '@/features/sessions/types';
import type { SessionIndexResponse } from '@/features/sessions/types';
import { api } from '@/lib/api-client';

/** One prefix, so #5 can invalidate everything a broadcast touches at once. */
export const sessionKeys = {
  index: (teamId: number) => ['sessions', 'index', teamId] as const,
  detail: (sessionId: number) => ['sessions', 'detail', sessionId] as const,
};

/** `staleTime: 0` against the client's 30s default: the list moves whenever
 *  anyone on the team starts, cancels or completes a session. */
export function teamSessionsQuery(teamId: number) {
  return queryOptions({
    queryKey: sessionKeys.index(teamId),
    queryFn: async ({ signal }) =>
      toSessionIndex(
        await api.get<SessionIndexResponse>(`/teams/${teamId}/sessions`, { signal }),
      ),
    staleTime: 0,
  });
}
