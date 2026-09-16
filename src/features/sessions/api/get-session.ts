import { queryOptions } from '@tanstack/react-query';
import { sessionKeys } from '@/features/sessions/api/get-sessions';
import { api, ApiError } from '@/lib/api-client';
import type { Session } from '@/types/api';

/** What reading one Session can settle on. A processing Session is a known
 *  outcome with its own treatment, never an error the boundary catches. */
export type SessionRead = { status: 'readable'; session: Session } | { status: 'processing' };

/** Fetched rather than pre-empted on the status the list happened to carry:
 *  a shared link and a refresh have no such knowledge and must behave the same. */
export function sessionQuery(sessionId: number) {
  return queryOptions({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: async ({ signal }): Promise<SessionRead> => {
      try {
        const { session } = await api.get<{ session: Session }>(`/sessions/${sessionId}`, {
          signal,
        });
        return { status: 'readable', session };
      } catch (cause) {
        // 409 is the endpoint's settled answer while the pipeline is mid-run.
        if (cause instanceof ApiError && cause.status === 409) return { status: 'processing' };
        throw cause;
      }
    },
    staleTime: 0,
  });
}
