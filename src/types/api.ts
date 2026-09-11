/**
 * PLACEHOLDER types, to be replaced by generated ones.
 *
 * ADR 0003 says these are generated from the backend's OpenAPI document rather
 * than transcribed, precisely so a field rename surfaces as a type error. The
 * generator cannot run yet: it needs `composer install` and
 * `php artisan scramble:export` in the backend checkout.
 *
 * Everything below was read directly from the backend's resource classes
 * (`UserResource`, `TeamResource`, `TeamMemberResource`) rather than from the
 * design handoff, so it is accurate as of writing — but it is exactly the
 * transcription ADR 0003 warns drifts silently. Replace it, do not extend it.
 */

/** Membership role. Not a DB enum — `member_role` is a string(32) whose values
 *  are set in application code (AuthController, TeamSeeder). Capabilities derive
 *  from this, never from `User.roles`. See ADR 0007. */
export type MemberRole = 'player' | 'assistant_coach' | 'main_coach';

/** Membership status as seen in the backend's own writes. */
export type MembershipStatus = 'pending' | 'active';

export interface TeamMember {
  id: number;
  username: string;
  user_code: string;
  is_online: boolean;
  member_role: MemberRole;
  status: MembershipStatus;
  joined_at: string | null;
}

export interface Team {
  id: number;
  team_code: string;
  team_name: string;
  description: string | null;
  disbanded_at: string | null;
  created_at: string;
  /** Only present on `GET /teams`. `activeTeams` elsewhere serialises without
   *  members loaded, which is why `member_role` cannot be read off login. */
  members?: TeamMember[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_code: string;
  riot_id: string | null;
  is_online: boolean;
  /** Global registration role — `Coach` or `Player`. A different vocabulary from
   *  `MemberRole` and NOT the basis for capabilities. */
  roles?: string[];
  /** Active teams, serialised without members. */
  teams?: Team[];
  created_at: string;
}
