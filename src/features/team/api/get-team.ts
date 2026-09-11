import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Team } from '@/types/api';

interface TeamResponse {
  team: Team;
}

/** `GET /api/teams` — the only endpoint that loads active members, and so the
 *  only source of `member_role` (#14). A caller with no active team gets 404. */
export function getTeam(signal?: AbortSignal) {
  return api.get<TeamResponse>('/teams', { signal });
}

export const activeTeamQuery = queryOptions({
  queryKey: ['team', 'active'],
  queryFn: ({ signal }) => getTeam(signal),
});
