import type { MemberRole, Team, TeamMember, User } from '@/types/api';

/** Typed as the generated schemas so a mock cannot describe a response the API
 *  would never send. Values taken from a real seeded-team response. */

export const thunderbolts: Team = {
  id: 1,
  team_code: 'TM-IEH7ITRC',
  team_name: 'Thunderbolts',
  description: null,
  disbanded_at: null,
  created_at: '2026-09-11T11:52:36.000000Z',
  // Deliberately absent: the login payload and /me serialise teams WITHOUT
  // members loaded. Only GET /teams carries them. Adding members here would
  // let a test pass against a response the API never sends.
};

// `member_role` narrows to MemberRole even though the API serialises a plain
// string: a fixture must not be able to name a role the client cannot read.
function member(
  id: number,
  username: string,
  member_role: MemberRole,
  is_online = true,
): TeamMember {
  return {
    id,
    username,
    user_code: `PL-SEEDED${id}`,
    is_online,
    member_role,
    status: 'active',
    joined_at: '2026-09-11T11:52:36.000000Z',
  };
}

/** What `GET /teams` returns: the same team WITH its active members loaded.
 *  That is the only endpoint carrying `member_role`, and so the only place
 *  capabilities can be derived from (#14). */
export const thunderboltsRoster: Team = {
  ...thunderbolts,
  members: [
    member(2, 'assistantcoach', 'assistant_coach'),
    member(1, 'maincoach', 'main_coach'),
    member(3, 'playerone', 'player'),
    member(4, 'playertwo', 'player', false),
  ],
};

function user(id: number, username: string, role: 'Coach' | 'Player', teams: Team[]): User {
  return {
    id,
    username,
    email: `${username}@example.com`,
    user_code: role === 'Coach' ? `CH-SEEDED${id}` : `PL-SEEDED${id}`,
    riot_id: null,
    is_online: true,
    // The GLOBAL registration role, not the membership role. Every fixture
    // carries it precisely so a test would catch code reading capabilities here.
    roles: [role],
    teams,
    created_at: '2026-09-11T11:52:36.000000Z',
  };
}

export const mainCoach = user(1, 'maincoach', 'Coach', [thunderbolts]);
export const assistantCoach = user(2, 'assistantcoach', 'Coach', [thunderbolts]);
export const playerOne = user(3, 'playerone', 'Player', [thunderbolts]);

/** No active membership. `teams` is empty because it serialises activeTeams,
 *  and `GET /teams` answers 404 for this user — that 404 is the teamless signal. */
export const teamlessPlayer = user(9, 'teamless', 'Player', []);

/** Synthetic. Shaped like a Sanctum token so nothing is exercised differently,
 *  but obviously not a real one — fixtures must never carry live credentials. */
export const authToken = '1|test-token-not-a-real-credential';
export const assistantCoachToken = '2|test-token-not-a-real-credential';
export const playerToken = '3|test-token-not-a-real-credential';
export const teamlessToken = '9|test-token-not-a-real-credential';

/** Bearer token to the user holding it, as Sanctum would resolve it. */
export const usersByToken = new Map<string, User>([
  [authToken, mainCoach],
  [assistantCoachToken, assistantCoach],
  [playerToken, playerOne],
  [teamlessToken, teamlessPlayer],
]);
