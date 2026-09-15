import type { components } from '@/types/api.generated';

/** Domain-facing view of the API. `api.generated.ts` comes from `pnpm gen:api`
 *  and is never hand-edited; this is the thin layer over it, carrying the
 *  narrowings the generator cannot express (ADR 0003). */

type Schemas = components['schemas'];

export type User = Schemas['UserResource'];
export type Team = Schemas['TeamResource'];
export type TeamMember = Schemas['TeamMemberResource'];
export type TeamSettings = Schemas['TeamSettingsResource'];
export type Session = Schemas['SessionResource'];

/** The one atomic enrolment body (#31). Role-conditional in ways the schema
 *  cannot express — `toRegistrationRequest` is where those rules are applied. */
export type RegistrationRequest = Schemas['RegisterRequest'];

/** Basis for every capability (ADR 0007). The generator emits plain `string`
 *  because the legal values live in app code, not a DB enum. NOT `User.roles`,
 *  which is the global registration role and never drives capabilities. */
export type MemberRole = 'player' | 'assistant_coach' | 'main_coach';

/** Membership status, narrowed for the same reason as `MemberRole`. */
export type MembershipStatus = 'pending' | 'active';

/** TeamMember with role and status narrowed. Cross the gap with `toMembership`
 *  so the narrowing happens once, at the edge, not as a cast per call site. */
export interface Membership extends Omit<TeamMember, 'member_role' | 'status'> {
  member_role: MemberRole;
  status: MembershipStatus;
}

const MEMBER_ROLES: readonly string[] = ['player', 'assistant_coach', 'main_coach'];
const MEMBERSHIP_STATUSES: readonly string[] = ['pending', 'active'];

export function isMemberRole(value: string): value is MemberRole {
  return MEMBER_ROLES.includes(value);
}

export function isMembershipStatus(value: string): value is MembershipStatus {
  return MEMBERSHIP_STATUSES.includes(value);
}

/** Narrow a member, or null if its role or status is unknown here — a backend
 *  that has moved on should not take down a whole roster. */
export function toMembership(member: TeamMember): Membership | null {
  if (!isMemberRole(member.member_role)) return null;
  if (!isMembershipStatus(member.status)) return null;
  return { ...member, member_role: member.member_role, status: member.status };
}
