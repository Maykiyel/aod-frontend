import { http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import {
  ownLineAndMedian,
  pooledHeader,
  roster,
  shortPoolHeader,
  shortPoolPlayers,
  thunderbolts,
  thunderboltsRoster,
  usersByToken,
} from '@/testing/mocks/fixtures';
import type {
  MemberRole,
  MembershipStatus,
  RegistrationRequest,
  Team,
  User,
} from '@/types/api';

/** Wrap a payload the way every endpoint does: `{ message, data, code, error }`. */
export function envelope(message: string, data: unknown, code = 200) {
  return HttpResponse.json({ message, data, code, error: code >= 400 }, { status: code });
}

const url = (path: string) => `${env.apiUrl}${path}`;

/** Resolve the bearer the way Sanctum does, or null if it names nobody.
 *  Exported so a test overriding a handler resolves the caller identically. */
export function caller(request: Request): User | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);
  return usersByToken.get(token) ?? registeredUsers.get(token) ?? null;
}

/** Accounts and teams `POST /register` brings into being during a test, kept
 *  apart from the seeded fixtures so `resetRegistrations` can clear them —
 *  otherwise one test's new account makes the next one's username taken. */
const registeredUsers = new Map<string, User>();

/** Teams brought into being by `POST /register` during a test. #4 is the first
 *  ticket that writes to the database, so the endpoints after it have to answer
 *  for what enrolment created rather than only for the seeded team. */
const registeredTeams = new Map<number, Team>();

/** What `resolveTeam()` resolves for this caller: their ACTIVE team, or null.
 *  A pending membership resolves to null here exactly as on the server, which is
 *  the gap `Joe-Zupo/aod-backend#21` records. */
function activeTeamOf(user: User): Team | null {
  return registeredTeams.get(user.id) ?? (user.teams?.length ? thunderboltsRoster : null);
}

/** Forget everything registration created. Called between tests beside
 *  `server.resetHandlers()`, for the same reason. */
export function resetRegistrations(): void {
  registeredUsers.clear();
  registeredTeams.clear();
}

const COACH_ROLES: readonly MemberRole[] = ['main_coach', 'assistant_coach'];

/** The live team role, read off the roster exactly as the server reads the
 *  pivot. Only `GET /dashboard/players` branches on it. */
function isCoach(user: User): boolean {
  const self = thunderboltsRoster.members?.find((member) => member.id === user.id);
  return self ? COACH_ROLES.includes(self.member_role as MemberRole) : false;
}

/** Derived from the token map so an account is declared in one place only. The
 *  seeder sets every password equal to its username. */
const credentials = new Map(
  [...usersByToken].map(([token, user]) => [user.email, { user, token }] as const),
);

/** When anything registration creates came into being. One constant so the user,
 *  the team and the membership agree, and so the pivot's non-null `joined_at` is
 *  typed as one. */
const REGISTERED_AT = '2026-09-12T09:00:00.000000Z';

let lastId = 100;

const nextId = () => (lastId += 1);

/** The four unique columns the backend enforces, answered the way it does: as
 *  validation failures against the field, never as a generic rejection. */
function uniquenessConflicts(body: RegistrationRequest): Record<string, string[]> {
  const accounts = [...usersByToken.values(), ...registeredUsers.values()];
  const conflicts: Record<string, string[]> = {};

  // The role-conditional rules RegisterRequest enforces. Reproduced because a
  // mock that accepted a prohibited field would let the wrong payload pass.
  if (body.role === 'Coach' && body.riot_id != null) {
    conflicts.riot_id = ['The riot id field is prohibited.'];
  }
  if (body.role === 'Player' && body.riot_id == null) {
    conflicts.riot_id = ['The riot id field is required.'];
  }
  if (body.role !== 'Coach' && body.team_action != null) {
    conflicts.team_action = ['The team action field is prohibited.'];
  }
  if (body.team_action === 'create' && body.team_code != null) {
    conflicts.team_code = ['The team code field is prohibited.'];
  }
  if (body.password !== body.password_confirmation) {
    conflicts.password = ['The password field confirmation does not match.'];
  }

  if (accounts.some((account) => account.username === body.username)) {
    conflicts.username = ['The username has already been taken.'];
  }
  if (accounts.some((account) => account.email === body.email)) {
    conflicts.email = ['The email has already been taken.'];
  }
  if (body.riot_id && accounts.some((account) => account.riot_id === body.riot_id)) {
    conflicts.riot_id = ['The riot id has already been taken.'];
  }
  if (body.team_name === thunderbolts.team_name) {
    conflicts.team_name = ['The team name has already been taken.'];
  }

  return conflicts;
}

/**
 * The happy path. Individual tests override a handler with `server.use(...)`
 * rather than editing these, so the default stays the behaviour most tests want.
 */
export const handlers = [
  http.post(url('/login'), async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const account = body.email ? credentials.get(body.email) : undefined;

    // The real backend answers bad credentials with a 422 validation failure on
    // `email`, NOT a 401. Reproduced exactly, because treating it as a 401 is
    // the bug this seam is here to catch.
    if (!account || body.password !== account.user.username) {
      return envelope(
        'The provided credentials are incorrect.',
        { errors: { email: ['The provided credentials are incorrect.'] } },
        422,
      );
    }

    return envelope('Login successful.', { user: account.user, token: account.token });
  }),

  http.get(url('/me'), ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    return envelope('Profile retrieved.', { user });
  }),

  // resolveTeam() aborts 404 when the caller has no active team, so teamless and
  // "team does not exist" are the same response. That 404 is the teamless signal.
  http.get(url('/teams'), ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    const team = activeTeamOf(user);
    if (!team) return envelope('Team not found.', [], 404);
    return envelope('Team retrieved.', { team });
  }),

  // Both dashboard endpoints resolve the caller's active team and serve any
  // active member; only `players` shapes its body by role (ADR 0011).
  http.get(url('/dashboard/header'), ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    const team = activeTeamOf(user);
    if (!team) return envelope('Team not found.', [], 404);

    // A team created during the test has no analysed sessions at all, which is
    // the short-pool body a fresh database answers.
    const pooled = team === thunderboltsRoster;
    const body = pooled ? pooledHeader : shortPoolHeader;

    return envelope('Dashboard header retrieved.', {
      ...body,
      identity: {
        team,
        user,
        analysis_ready_count: pooled ? pooledHeader.identity.analysis_ready_count : 0,
      },
    });
  }),

  http.get(url('/dashboard/players'), ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    const team = activeTeamOf(user);
    if (!team) return envelope('Team not found.', [], 404);
    if (team !== thunderboltsRoster) {
      return envelope('Dashboard players retrieved.', shortPoolPlayers);
    }
    return envelope('Dashboard players retrieved.', isCoach(user) ? roster : ownLineAndMedian);
  }),

  // Mirrors AuthController::register: one transaction producing the user, the
  // team and the membership, with every unique column raised as a field error.
  http.post(url('/register'), async ({ request }) => {
    const body = (await request.json()) as RegistrationRequest;
    const conflicts = uniquenessConflicts(body);

    if (Object.keys(conflicts).length > 0) {
      return envelope('The given data was invalid.', { errors: conflicts }, 422);
    }

    const id = nextId();
    const user: User = {
      id,
      username: body.username,
      email: body.email,
      user_code: `${body.role === 'Coach' ? 'CH' : 'PL'}-NEW${id}`,
      riot_id: body.riot_id ?? null,
      is_online: true,
      roles: [body.role],
      teams: [],
      created_at: REGISTERED_AT,
    };

    let team: Team | null = null;
    let status: MembershipStatus | null = null;

    if (body.team_action === 'create') {
      team = {
        id,
        team_code: `TM-NEW${id}`,
        team_name: body.team_name ?? '',
        description: body.description ?? null,
        disbanded_at: null,
        created_at: REGISTERED_AT,
      };
      status = 'active';
      // activeTeams, so GET /teams resolves it. The team in the RESPONSE carries
      // no members: the controller never loads them, and a mock that did would
      // let a test pass against a body the API does not send.
      user.teams = [team];
      registeredTeams.set(id, {
        ...team,
        members: [
          {
            id,
            username: user.username,
            user_code: user.user_code,
            is_online: true,
            member_role: 'main_coach',
            status: 'active',
            joined_at: REGISTERED_AT,
          },
        ],
      });
    } else if (body.team_code) {
      if (body.team_code.toUpperCase() !== thunderbolts.team_code) {
        return envelope(
          'The given data was invalid.',
          { errors: { team_code: ['The provided team code does not exist.'] } },
          422,
        );
      }
      // Attached as pending, which is not an active membership: `teams` stays
      // empty and GET /teams still answers 404 (Joe-Zupo/aod-backend#21).
      team = thunderbolts;
      status = 'pending';
    }

    const token = `${id}|test-token-not-a-real-credential`;
    registeredUsers.set(token, user);

    return envelope(
      'Registration successful.',
      { user, team, team_membership_status: status, token },
      201,
    );
  }),

  http.post(url('/logout'), () => envelope('Logout successful.', [])),
];
