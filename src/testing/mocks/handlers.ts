import { http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import {
  ownLineAndMedian,
  pooledHeader,
  roster,
  shortPoolHeader,
  shortPoolPlayers,
  teamSessions,
  teamSettings,
  thunderbolts,
  thunderboltsRoster,
  usersByToken,
} from '@/testing/mocks/fixtures';
import type {
  MemberRole,
  MembershipStatus,
  RegistrationRequest,
  Session,
  SessionParticipant,
  Team,
  TeamSettings,
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

/** The sessions each team holds. Writable because #6 is the first ticket that
 *  creates one and then reads it back out of the index. */
const sessionsByTeam = new Map<number, Session[]>();

const NON_TERMINAL: readonly string[] = ['queuing', 'in_progress', 'delivering'];

/** The two statuses a live run passes through, and so the window in which a
 *  participant at `recording` may upload. */
const UPLOADABLE: readonly string[] = ['in_progress', 'delivering'];

let lastSessionId = 200;

/** Put the seeded team back to `rows`. Called with no argument between tests;
 *  a test wanting a different starting point — an empty team, a session that is
 *  recording rather than in the lobby — passes its own. */
export function resetSessions(rows: Session[] = teamSessions): void {
  sessionsByTeam.clear();
  // Participants are copied too, not shared: #5 writes to them, so a shallow
  // copy would let one test's join outlive it.
  sessionsByTeam.set(
    thunderbolts.id,
    rows.map((row) => ({
      ...row,
      ...(row.participants ? { participants: row.participants.map((p) => ({ ...p })) } : {}),
    })),
  );
  lastSessionId = 200;
}

resetSessions();

/** The team's detection settings, writable because #5 edits them. Reset between
 *  tests beside the sessions, for the same reason. */
let settings: TeamSettings = teamSettings;

resetTeamSettings();

export function resetTeamSettings(next: TeamSettings = teamSettings): void {
  settings = {
    ...next,
    informative_keywords: [...next.informative_keywords],
    declarative_keywords: [...next.declarative_keywords],
  };
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

/** Active rows only, which is what `activeParticipants` loads and so the only
 *  shape `GET /sessions/{session}` ever serves. */
const active = (session: Session) =>
  (session.participants ?? []).filter((row) => row.left_at === null);

const served = (session: Session): Session => ({ ...session, participants: active(session) });

/** The caller's session, through their active team — session routes bind the
 *  session explicitly and authorize against ITS team, so an outsider gets 404. */
function locate(user: User, sessionId: number): Session | null {
  const team = activeTeamOf(user);
  if (!team) return null;
  return (sessionsByTeam.get(team.id) ?? []).find((row) => row.id === sessionId) ?? null;
}

/** The role the pivot holds, snapshotted onto a participant row at join time. */
function roleOf(user: User): MemberRole {
  const self = thunderboltsRoster.members?.find((member) => member.id === user.id);
  return (self?.member_role as MemberRole | undefined) ?? 'player';
}

/** A Coach joins with nothing to agree to; a player joins needing consent. */
const initialStatus = (role: string) =>
  COACH_ROLES.includes(role as MemberRole) ? 'ready' : 'needs_consent';

const JOINED_AT = '2026-09-16T18:10:00.000000Z';

/** Session::regressIfNobodyRecording — a run nobody is recording is not a run,
 *  so it returns to the lobby and every stored take is discarded (ADR 0013). */
function regressIfNobodyRecording(session: Session): void {
  if (!UPLOADABLE.includes(session.status)) return;
  if (active(session).some((row) => row.participant_status === 'recording')) return;

  session.status = 'queuing';
  session.started_at = null;
  for (const row of active(session)) {
    row.participant_status = initialStatus(row.participant_role);
    row.aod = null;
    row.vod = null;
  }
}

/** Session::cancelIfNoParticipantsRemain — a lobby that empties out ends. */
function cancelIfEmpty(session: Session): void {
  if (!NON_TERMINAL.includes(session.status)) return;
  if (active(session).length === 0) session.status = 'cancelled';
}

/** Join, consent, leave, start and cancel, each answering the way the controller
 *  does — including which refusals are policy denials and which are the model's
 *  own guard surfaced as 422. */
const lobbyHandlers = [
  http.post(url('/sessions/:sessionId/join'), ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const session = locate(user, Number(params.sessionId));
    if (!session) return envelope('Not found.', [], 404);
    if (!NON_TERMINAL.includes(session.status)) {
      return envelope('This session is not open for joining.', [], 403);
    }

    const role = roleOf(user);
    const rows: SessionParticipant[] = session.participants ?? [];
    const held = rows.find((row) => row.user_id === user.id);

    if (!held) {
      rows.push({
        user_id: user.id,
        username: user.username,
        participant_role: role,
        participant_status: initialStatus(role),
        joined_at: JOINED_AT,
        left_at: null,
        aod: null,
        vod: null,
      });
    } else if (held.left_at !== null) {
      // joinOrRejoin resets a returning member, which is what makes "asked
      // again after rejoining" the server's rule rather than the client's.
      held.left_at = null;
      held.joined_at = JOINED_AT;
      held.participant_role = role;
      held.participant_status = initialStatus(role);
    }

    session.participants = rows;

    return envelope('Joined session.', { session: served(session) });
  }),

  http.post(url('/sessions/:sessionId/consent'), ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const session = locate(user, Number(params.sessionId));
    if (!session) return envelope('Not found.', [], 404);

    const row = active(session).find((held) => held.user_id === user.id);
    if (!row) return envelope('You are not in this session.', [], 422);
    if (COACH_ROLES.includes(row.participant_role as MemberRole)) {
      return envelope('A coach has nothing to consent to.', [], 422);
    }
    if (
      !NON_TERMINAL.includes(session.status) ||
      !['needs_consent', 'ready'].includes(row.participant_status)
    ) {
      return envelope('Consent can no longer be recorded for this session.', [], 422);
    }

    row.participant_status = 'ready';

    return envelope('Consent recorded.', { session: served(session) });
  }),

  http.post(url('/sessions/:sessionId/leave'), ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const session = locate(user, Number(params.sessionId));
    if (!session) return envelope('Not found.', [], 404);

    const row = (session.participants ?? []).find((held) => held.user_id === user.id);
    if (!row) return envelope('You are not a participant in this session.', [], 422);

    const discarded = { audio: false, video: false };

    if (row.left_at === null) {
      row.left_at = JOINED_AT;
      // Departure resets the row and discards what that participant had stored,
      // so nothing outlives the status that authorised it (backend ADR 0013).
      row.participant_status = initialStatus(row.participant_role);
      discarded.audio = row.aod !== null;
      discarded.video = row.vod !== null;
      row.aod = null;
      row.vod = null;
      cancelIfEmpty(session);
      regressIfNobodyRecording(session);
    }

    return envelope('Left session.', { session: served(session), discarded });
  }),

  http.post(url('/sessions/:sessionId/start'), ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const session = locate(user, Number(params.sessionId));
    if (!session) return envelope('Not found.', [], 404);
    if (!isCoach(user)) return envelope('This action is unauthorized.', [], 403);
    if (session.status !== 'queuing') {
      return envelope('Only a queuing session can be started.', [], 422);
    }

    const players = active(session).filter(
      (row) => !COACH_ROLES.includes(row.participant_role as MemberRole),
    );

    if (players.length === 0) {
      return envelope('A session needs at least one player before it can start.', [], 422);
    }
    if (players.some((row) => row.participant_status !== 'ready')) {
      return envelope('Every player must consent before the session can start.', [], 422);
    }

    session.status = 'in_progress';
    session.started_at = new Date().toISOString();
    for (const player of players) player.participant_status = 'recording';

    return envelope('Session started.', { session: served(session) });
  }),

  http.post(url('/sessions/:sessionId/transitions'), async ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const session = locate(user, Number(params.sessionId));
    if (!session) return envelope('Not found.', [], 404);
    if (!isCoach(user)) return envelope('This action is unauthorized.', [], 403);

    const { to } = (await request.json()) as { to?: string };

    if (to === 'in_progress') {
      return envelope('Use POST /sessions/{session}/start to begin recording.', [], 422);
    }
    if (to === 'delivering') {
      if (session.status !== 'in_progress') {
        return envelope('Only an in_progress session can be moved to delivering.', [], 422);
      }
      // Recorders stop, uploads stay legal, and players keep `recording`
      // throughout (backend ADR 0015).
      session.status = 'delivering';
      return envelope('Session transition applied.', { session: served(session) });
    }

    if (to !== 'cancelled') {
      return envelope(
        'The given data was invalid.',
        { errors: { to: ['The selected to is invalid.'] } },
        422,
      );
    }
    if (!NON_TERMINAL.includes(session.status)) {
      return envelope('Only a live session can be cancelled.', [], 422);
    }

    // Aborting a live session discards every take stored for it (backend ADR 0012).
    session.status = 'cancelled';
    for (const row of active(session)) {
      row.left_at = JOINED_AT;
      row.aod = null;
      row.vod = null;
    }

    return envelope('Session transition applied.', { session: served(session) });
  }),

  http.post(url('/sessions/:sessionId/start-recording'), ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const session = locate(user, Number(params.sessionId));
    if (!session) return envelope('Not found.', [], 404);

    const row = active(session).find((held) => held.user_id === user.id);
    if (!row) return envelope('You are not in this session.', [], 422);
    if (COACH_ROLES.includes(row.participant_role as MemberRole)) {
      return envelope('A coach does not record.', [], 422);
    }
    if (session.status !== 'in_progress') {
      return envelope('Only an in_progress session can be recorded.', [], 422);
    }
    // Never a silent 200: a client told it is recording uploads files the server
    // then refuses (backend ADR 0013).
    if (row.participant_status === 'needs_consent') {
      return envelope('Consent is required before recording can start.', [], 422);
    }

    row.participant_status = 'recording';

    return envelope('Recording started.', {
      session: served(session),
      discarded: { audio: false, video: false },
    });
  }),

  // One participant's own audio and/or video. Eligibility is that participant's
  // own state, not the session's: `recording`, and still in it (ADR 0012).
  http.post(url('/sessions/:sessionId/recording'), async ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const session = locate(user, Number(params.sessionId));
    if (!session) return envelope('Not found.', [], 404);

    const row = active(session).find((held) => held.user_id === user.id);
    if (!row || row.participant_status !== 'recording' || !UPLOADABLE.includes(session.status)) {
      return envelope('You are not recording in this session.', [], 422);
    }

    const body = await request.formData();
    // Duck-typed rather than `instanceof Blob`: a file that crossed the
    // interceptor comes from another realm, where the constructor is not ours.
    const audio = fileIn(body, 'audio');
    const video = fileIn(body, 'video');

    if (!audio && !video) {
      return envelope(
        'The given data was invalid.',
        { errors: { audio: ['The audio field is required when video is not present.'] } },
        422,
      );
    }

    // Re-uploading replaces what that participant already sent (ADR 0012).
    if (audio) row.aod = storedFile(audio, 'audio', started(body, 'audio_client_started_at'));
    if (video) row.vod = storedFile(video, 'video', started(body, 'video_client_started_at'));

    return envelope('Recording uploaded.', { aod: row.aod, vod: row.vod });
  }),
];

let lastRecordingId = 500;

const started = (body: FormData, field: string) => (body.get(field) as string | null) || null;

/** A FormData value is a string or a file; anything else is the file. */
function fileIn(body: FormData, field: string): File | null {
  const value = body.get(field);
  return value === null || typeof value === 'string' ? null : (value as File);
}

function storedFile(file: File, kind: 'audio' | 'video', client_started_at: string | null) {
  return {
    id: (lastRecordingId += 1),
    original_filename: file.name || `${kind}.webm`,
    mime_type: file.type,
    size_bytes: file.size,
    client_started_at,
  };
}

const KEYWORD_CATEGORIES = ['informative_keywords', 'declarative_keywords'] as const;

const fold = (word: string) => word.trim().toLowerCase();

/** Every rule `UpdateTeamKeywordsRequest` enforces, reproduced so a payload the
 *  server would refuse cannot pass here either. */
function keywordConflicts(body: Record<string, unknown>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const folded: Record<string, string[]> = {};

  for (const field of KEYWORD_CATEGORIES) {
    const words = body[field];

    if (!Array.isArray(words)) {
      errors[field] = [`The ${field.replace('_', ' ')} field must be present.`];
      folded[field] = [];
      continue;
    }

    words.forEach((word: unknown, index: number) => {
      const trimmed = typeof word === 'string' ? word.trim() : '';
      if (!/^\S+$/.test(trimmed)) {
        errors[`${field}.${index}`] = [`The ${field}.${index} field format is invalid.`];
      } else if (trimmed.length > 64) {
        errors[`${field}.${index}`] = [
          `The ${field}.${index} field must not be greater than 64 characters.`,
        ];
      }
    });

    if (words.length > 200) {
      errors[field] = [`The ${field.replace('_', ' ')} field must not have more than 200 items.`];
    }

    const list = words.filter((word): word is string => typeof word === 'string').map(fold);
    folded[field] = list;

    if (new Set(list).size !== list.length) {
      errors[field] = ['This category lists the same keyword more than once (case-insensitive).'];
    }
  }

  const inBoth = [
    ...new Set(
      folded.informative_keywords.filter((word) => folded.declarative_keywords.includes(word)),
    ),
  ];

  if (inBoth.length > 0) {
    errors.declarative_keywords = [`These keywords appear in both categories: ${inBoth.join(', ')}.`];
  }

  return errors;
}

/** Team-wide, resolved through the caller's active team, and restricted to any
 *  active Coach — main or assistant. */
const teamSettingsHandlers = [
  http.get(url('/teams/settings'), ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    if (!activeTeamOf(user)) return envelope('Team not found.', [], 404);
    if (!isCoach(user)) return envelope('This action is unauthorized.', [], 403);

    return envelope('Team settings retrieved.', { settings });
  }),

  http.put(url('/teams/settings'), async ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    if (!activeTeamOf(user)) return envelope('Team not found.', [], 404);
    if (!isCoach(user)) return envelope('This action is unauthorized.', [], 403);

    const body = (await request.json()) as { dead_air_threshold_ms?: unknown };
    const threshold = body.dead_air_threshold_ms;

    if (!Number.isInteger(threshold) || (threshold as number) < 1) {
      return envelope(
        'The given data was invalid.',
        {
          errors: {
            dead_air_threshold_ms: ['The dead air threshold ms field must be at least 1.'],
          },
        },
        422,
      );
    }

    settings = { ...settings, dead_air_threshold_ms: threshold as number };

    return envelope('Team settings updated.', { settings });
  }),

  http.put(url('/teams/settings/keywords'), async ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    if (!activeTeamOf(user)) return envelope('Team not found.', [], 404);
    if (!isCoach(user)) return envelope('This action is unauthorized.', [], 403);

    const body = (await request.json()) as Record<string, unknown>;
    const conflicts = keywordConflicts(body);

    if (Object.keys(conflicts).length > 0) {
      return envelope('The given data was invalid.', { errors: conflicts }, 422);
    }

    settings = {
      ...settings,
      informative_keywords: (body.informative_keywords as string[]).map((word) => word.trim()),
      declarative_keywords: (body.declarative_keywords as string[]).map((word) => word.trim()),
    };

    return envelope('Team keywords updated.', { settings });
  }),
];

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
  // active member; only `players` shapes its body by role (aod-backend ADR 0011).
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

  // Session routes bind {team}/{session} explicitly and authorize against that
  // team, not the caller's "active team" — an outsider is denied as not found.
  http.get(url('/teams/:teamId/sessions'), ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const teamId = Number(params.teamId);
    if (activeTeamOf(user)?.id !== teamId) return envelope('Not found.', [], 404);

    const rows = sessionsByTeam.get(teamId) ?? [];
    const live = rows.find((row) => NON_TERMINAL.includes(row.status)) ?? null;
    const past = rows.filter((row) => row !== live);

    // The index never loads participants; only the detail endpoint does.
    const withoutParticipants = (row: Session): Session => {
      const copy = { ...row };
      delete copy.participants;
      return copy;
    };

    return envelope('Sessions retrieved.', {
      live_session: live ? withoutParticipants(live) : null,
      past_sessions: past.map(withoutParticipants),
      pagination: {
        current_page: 1,
        total_pages: 1,
        count: past.length,
        per_page: 15,
        total: past.length,
      },
    });
  }),

  http.post(url('/teams/:teamId/sessions'), async ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const teamId = Number(params.teamId);
    if (activeTeamOf(user)?.id !== teamId) return envelope('Not found.', [], 404);
    if (!isCoach(user)) return envelope('This action is unauthorized.', [], 403);

    const body = (await request.json()) as { session_name?: string };
    const name = body.session_name;

    if (!name) {
      return envelope(
        'The given data was invalid.',
        { errors: { session_name: ['The session name field is required.'] } },
        422,
      );
    }
    if (name.length > 255) {
      return envelope(
        'The given data was invalid.',
        { errors: { session_name: ['The session name field must not be greater than 255 characters.'] } },
        422,
      );
    }

    const rows = sessionsByTeam.get(teamId) ?? [];
    // Session::createForTeam returns null when one is already open, and the
    // controller turns that into a 422 with no field errors on it.
    if (rows.some((row) => NON_TERMINAL.includes(row.status))) {
      return envelope('This team already has an active session.', [], 422);
    }

    const id = (lastSessionId += 1);
    const session: Session = {
      id,
      team_id: teamId,
      created_by: user.id,
      session_code: `SESSION_${String(id).padStart(3, '0')}`,
      session_name: name,
      status: 'queuing',
      created_at: new Date().toISOString(),
      started_at: null,
    };

    sessionsByTeam.set(teamId, [session, ...rows]);

    return envelope('Session created.', { session }, 201);
  }),

  // Refused with 409 while processing: the pipeline is mid-run and there is no
  // coherent view to return. Progress is on the team session index instead.
  http.get(url('/sessions/:sessionId'), ({ request, params }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);

    const sessionId = Number(params.sessionId);
    const team = activeTeamOf(user);
    const session = team
      ? (sessionsByTeam.get(team.id) ?? []).find((row) => row.id === sessionId)
      : undefined;

    if (!session) return envelope('Not found.', [], 404);
    if (session.status === 'processing') {
      return envelope('This session is still processing.', [], 409);
    }

    return envelope('Session retrieved.', { session: served(session) });
  }),

  ...lobbyHandlers,
  ...teamSettingsHandlers,

  http.post(url('/logout'), () => envelope('Logout successful.', [])),
];
