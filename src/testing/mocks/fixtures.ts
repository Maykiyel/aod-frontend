import type {
  DashboardHeaderResponse,
  DashboardPlayersResponse,
} from '@/features/dashboard/types';
import type {
  MemberRole,
  Session,
  SessionParticipant,
  Team,
  TeamMember,
  TeamSettings,
  User,
} from '@/types/api';

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

/** The two dashboard bodies, from a real seeded response (#3). Numbers are the
 *  design's own readings so a screen can be checked against screens 06 and 07. */

const analysisWindow = {
  sessions_requested: 3,
  sessions_analyzed: 3,
  from: '2026-09-08T19:04:11.000000Z',
  to: '2026-09-10T21:37:02.000000Z',
};

export const pooledHeader: DashboardHeaderResponse = {
  identity: { team: thunderbolts, user: mainCoach, analysis_ready_count: 12 },
  window: analysisWindow,
  // informative + declarative + compound equals calls_classified; redundant is a
  // flag over that same total, and absence is a period count, not a fourth type.
  kpi: { comm_frequency: 18.43, alignment_rate: 87.25, absence_ms: 252481, calls_classified: 1842 },
  comm_mix: {
    informative: 774,
    declarative: 571,
    compound: 497,
    redundant: 133,
    absence: 12,
    calls_classified: 1842,
  },
};

/** A pool shorter than it asked for: the two data cards are replaced wholesale,
 *  identity and window still render. What a fresh database answers. */
export const shortPoolHeader: DashboardHeaderResponse = {
  identity: { team: thunderbolts, user: mainCoach, analysis_ready_count: 1 },
  window: { sessions_requested: 3, sessions_analyzed: 1, from: null, to: null },
  kpi: { message: 'Insufficient sessions queried for KPI of Communication' },
  comm_mix: { message: 'Insufficient sessions queried for Communication Mix' },
};

export const roster: DashboardPlayersResponse = {
  window: analysisWindow,
  players: [
    {
      user_id: 3,
      username: 'playerone',
      is_online: true,
      comm_frequency: 21.6,
      alignment_rate: 91.33,
      calls_logged: 412,
      sessions_played: 3,
    },
    {
      user_id: 4,
      username: 'playertwo',
      is_online: false,
      comm_frequency: 12.84,
      alignment_rate: 79.5,
      calls_logged: 238,
      sessions_played: 2,
    },
  ],
};

/** What playerone gets from the same endpoint: their own line and the median. */
export const ownLineAndMedian: DashboardPlayersResponse = {
  window: analysisWindow,
  you: { user_id: 3, comm_frequency: 21.6, alignment_rate: 91.33, calls_logged: 412 },
  team_median: { comm_frequency: 17.22, alignment_rate: 85.42, calls_logged: 325 },
};

export const shortPoolPlayers: DashboardPlayersResponse = {
  window: { sessions_requested: 3, sessions_analyzed: 1, from: null, to: null },
  message: 'Insufficient sessions queried for Player Stats',
};

/** The team's sessions, shaped as `GET /teams/{team}/sessions` serialises them.
 *  Values follow the demo seeder `Joe-Zupo/aod-backend#20` added, extended to
 *  every status so the list has all six states to draw. */

function session(
  id: number,
  session_name: string,
  status: string,
  created_at: string,
  transcription?: { total: number; completed: number; failed: number },
): Session {
  return {
    id,
    team_id: thunderbolts.id,
    created_by: mainCoach.id,
    // SESSION_ plus the id zero-padded to three, as Session::codeForId writes it.
    session_code: `SESSION_${String(id).padStart(3, '0')}`,
    session_name,
    status,
    created_at,
    ...(transcription ? { transcription } : {}),
  };
}

function participant(
  user_id: number,
  username: string,
  participant_role: MemberRole,
  participant_status: string,
): SessionParticipant {
  return {
    user_id,
    username,
    participant_role,
    participant_status,
    joined_at: '2026-09-16T18:04:00.000000Z',
    left_at: null,
  };
}

/** The lobby's starting roll, shaped so the two tautology traps #38 names go red
 *  when they are wrong: `playertwo` is rostered and has NOT joined, and
 *  `formermember` has joined and is NOT rostered. One player short of consent. */
export const lobbyParticipants: SessionParticipant[] = [
  participant(1, 'maincoach', 'main_coach', 'ready'),
  participant(3, 'playerone', 'player', 'needs_consent'),
  participant(7, 'formermember', 'player', 'ready'),
];

/** The team's one non-terminal session. Queuing, so it is in the lobby. */
export const lobbySession: Session = {
  ...session(48, 'Scrim vs Ronin Squad', 'queuing', '2026-09-16T18:02:00.000000Z'),
  participants: lobbyParticipants,
};

/** The same lobby with nobody in it but the Coach who made it — the other half
 *  of the start gate, which a single unhappy fixture would not separate. */
export const emptyLobbySession: Session = {
  ...lobbySession,
  participants: [participant(1, 'maincoach', 'main_coach', 'ready')],
};

/** The other non-terminal status. Never in the list beside `lobbySession` — a
 *  team holds one at a time — so a test swaps one for the other. */
export const recordingSession = session(49, 'Scrim vs Kestrel', 'in_progress', '2026-09-16T19:41:00.000000Z');

/** Two of five transcripts done. The only status carrying a transcription figure. */
export const processingSession = session(
  44,
  'Scrim vs Vertex GG',
  'processing',
  '2026-09-15T20:15:00.000000Z',
  { total: 5, completed: 2, failed: 0 },
);

export const reviewSession = session(47, 'Scrim vs Team Nova II', 'timeline_ready', '2026-09-14T21:08:00.000000Z');
export const analysedSession = session(45, 'Scrim vs Apex Order', 'analysis_ready', '2026-09-13T19:52:00.000000Z');
export const cancelledSession = session(46, 'Scrim vs Halcyon', 'cancelled', '2026-09-12T20:30:00.000000Z');

/** Date-descending, the order the index returns them in — and deliberately NOT
 *  id order, so a screen that sorted by anything of its own would fail. */
export const pastSessions: Session[] = [
  processingSession,
  reviewSession,
  analysedSession,
  cancelledSession,
];

/** Everything the team holds: the live session and the four terminal ones. */
export const teamSessions: Session[] = [lobbySession, ...pastSessions];

/** Team detection settings, as `GET /teams/settings` serialises them. The two
 *  keyword lists are short subsets of the seeded defaults: a forty-word list
 *  tells a test nothing the first four do not. */
export const teamSettings: TeamSettings = {
  team_id: thunderbolts.id,
  dead_air_threshold_ms: 5000,
  comm_event_padding_ms: 2000,
  game_alignment_window_ms: 5000,
  informative_keywords: ['smoked', 'flashed', 'spotted', 'clear'],
  declarative_keywords: ['pushing', 'rotating', 'holding'],
  updated_at: '2026-09-16T11:52:36.000000Z',
};
