import type { MemberRole, Membership } from '@/types/api';

/** What the current user may do in their active team (ADR 0007, ADR 0009).
 *  A flag hides a control; it never grants one — the backend policy named
 *  against each is the authority. */
export interface Capabilities {
  /** The team's roster and session history. TeamPolicy::view, SessionPolicy::viewAny. */
  canViewTeamData: boolean;
  /** Create, start, complete and transition sessions. SessionPolicy::create. */
  canConfigureSessions: boolean;
  /** Notes and replies on a reviewed timeline. SessionPolicy::annotateTimeline. */
  canAuthorAnnotations: boolean;
  /** Dead-air threshold and keyword lists. TeamSettingsPolicy::update. */
  canConfigureTeamSettings: boolean;
  /** Approve, reject and remove members. TeamPolicy::manageMembers — the single
   *  capability separating main_coach from assistant_coach. */
  canManageMembers: boolean;
}

const COACH_ROLES: readonly MemberRole[] = ['main_coach', 'assistant_coach'];

/** A user with no active membership. Hoisted so callers share one object. */
export const NO_CAPABILITIES: Capabilities = {
  canViewTeamData: false,
  canConfigureSessions: false,
  canAuthorAnnotations: false,
  canConfigureTeamSettings: false,
  canManageMembers: false,
};

/** Takes the membership rather than the role so the teamless case — which has no
 *  role at all — is answered here rather than at every call site. */
export function capabilitiesFor(membership: Membership | null): Capabilities {
  if (!membership) return NO_CAPABILITIES;

  const isCoach = COACH_ROLES.includes(membership.member_role);

  return {
    canViewTeamData: true,
    canConfigureSessions: isCoach,
    canAuthorAnnotations: isCoach,
    canConfigureTeamSettings: isCoach,
    canManageMembers: membership.member_role === 'main_coach',
  };
}
