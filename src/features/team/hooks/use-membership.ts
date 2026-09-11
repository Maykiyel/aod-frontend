import { useQuery } from '@tanstack/react-query';
import { activeTeamQuery } from '@/features/team/api/get-team';
import { capabilitiesFor, NO_CAPABILITIES } from '@/features/team/capabilities';
import type { Capabilities } from '@/features/team/capabilities';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { toMembership } from '@/types/api';
import type { Membership, Team } from '@/types/api';

/** Who the signed-in user is inside their active team. The four states are the
 *  four things a screen has to draw, so a screen picks a treatment by switching
 *  on `status` rather than by unpicking loading flags and error codes. */
export type MembershipState =
  | { status: 'loading' }
  | { status: 'teamless' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'member'; team: Team; membership: Membership; capabilities: Capabilities };

const NO_MEMBERSHIP_MESSAGE = 'This team loaded without an active membership for this account.';

/** Resolves the active team, finds the caller in its members and derives their
 *  capabilities — the one place that happens (ADR 0007). Not from the login
 *  payload: it omits members, and `User.roles` is the registration role (#14). */
export function useMembership(): MembershipState {
  const { status: authStatus, user } = useAuth();
  const query = useQuery({ ...activeTeamQuery, enabled: authStatus === 'authenticated' });

  if (query.isPending) return { status: 'loading' };

  if (query.error) {
    // resolveTeam() aborts 404 when the caller has no ACTIVE team, so a 404 is
    // the teamless state rather than a failure. A pending membership lands here
    // too, indistinguishably — Joe-Zupo/aod-backend#21.
    if (query.error instanceof ApiError && query.error.status === 404) {
      return { status: 'teamless' };
    }
    return {
      status: 'error',
      message: query.error.message,
      retry: () => void query.refetch(),
    };
  }

  const team = query.data.team;
  const self = team.members?.find((member) => member.id === user?.id);
  const membership = self ? toMembership(self) : null;

  // Either the roster came back without this account on it, or its role is one
  // this client does not know. Both are data problems, not empty states.
  if (!membership) {
    return { status: 'error', message: NO_MEMBERSHIP_MESSAGE, retry: () => void query.refetch() };
  }

  return { status: 'member', team, membership, capabilities: capabilitiesFor(membership) };
}

/** What the caller may do in whatever state the membership is in. Nobody has a
 *  capability until a membership resolves, and this is where that is said once. */
export function capabilitiesOf(state: MembershipState): Capabilities {
  return state.status === 'member' ? state.capabilities : NO_CAPABILITIES;
}
