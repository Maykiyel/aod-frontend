import type { components } from '@/types/api.generated';

/**
 * The domain-facing view of the API's shapes.
 *
 * `api.generated.ts` is produced from the backend's own OpenAPI document by
 * `pnpm gen:api` and must never be edited. This file is the thin layer over it:
 * short names for the shapes screens actually name, plus the few narrowings the
 * generator cannot express.
 *
 * ADR 0003 warns the spec under-describes the API, because Scramble reads
 * validation rules and cannot see what a controller enforces. Two consequences
 * are visible right here — see `MemberRole` and `MembershipStatus`.
 */

type Schemas = components['schemas'];

export type User = Schemas['UserResource'];
export type Team = Schemas['TeamResource'];
export type TeamMember = Schemas['TeamMemberResource'];
export type TeamSettings = Schemas['TeamSettingsResource'];
export type Session = Schemas['SessionResource'];

/**
 * Membership role — the basis for every capability in the app (ADR 0007).
 *
 * The generator types this as plain `string`: `member_role` is a `string(32)`
 * column whose legal values live in application code, so nothing in the OpenAPI
 * document narrows it. Hand-written here because a capability model branching on
 * an unconstrained string is the bug this union exists to prevent.
 *
 * NOT the same vocabulary as `User.roles`, which is the global registration role
 * (`Coach` / `Player`). Capabilities never derive from that.
 */
export type MemberRole = 'player' | 'assistant_coach' | 'main_coach';

/** Membership status, narrowed for the same reason as `MemberRole`. */
export type MembershipStatus = 'pending' | 'active';

/**
 * A team member whose role and status are narrowed to the unions above.
 *
 * Use this rather than `TeamMember` wherever the value is about to be branched
 * on, and cross the gap with `toActiveMembership` so the narrowing happens once,
 * at the edge, instead of as a cast at every call site.
 */
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

/**
 * Narrow a member the API returned, or `null` if it carries a role or status
 * this client does not know.
 *
 * Returning `null` rather than throwing is deliberate: an unrecognised role is
 * a backend that has moved on, and one stale member should not take down a
 * roster. Callers drop what they cannot place.
 */
export function toMembership(member: TeamMember): Membership | null {
  if (!isMemberRole(member.member_role)) return null;
  if (!isMembershipStatus(member.status)) return null;
  return { ...member, member_role: member.member_role, status: member.status };
}
