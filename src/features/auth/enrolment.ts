import type { RegistrationRequest } from '@/types/api';

/** The wizard's model. Enrolment is one atomic `POST /api/register` (#31), so the
 *  four screens accumulate answers here and persist nothing until the last one.
 *  Screen-local by decision, never the session store (ADR 0010). */

/** Read off the generated request rather than re-typed, per ADR 0003. */
export type EnrolmentRole = NonNullable<RegistrationRequest['role']>;

/** The team-setup tabs. `join` is not an action the API knows — a team code with
 *  no `team_action` is how joining is expressed (#31). */
export type TeamMode = 'create' | 'join';

export type EnrolmentStep = 'role' | 'profile' | 'team';

export interface EnrolmentAnswers {
  role: EnrolmentRole | null;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  /** The in-game identifier. Required for a Player, prohibited for a Coach. */
  riotId: string;
  teamMode: TeamMode;
  teamName: string;
  description: string;
  teamCode: string;
}

export const EMPTY_ANSWERS: EnrolmentAnswers = {
  role: null,
  username: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  riotId: '',
  teamMode: 'create',
  teamName: '',
  description: '',
  teamCode: '',
};

/** Shape the one request. The role decides the request's shape, not just which
 *  screens appear: `riot_id` on a coach registration and `team_action` on a
 *  player's are both outright rejections (#31). */
export function toRegistrationRequest(answers: EnrolmentAnswers): RegistrationRequest {
  const role: EnrolmentRole = answers.role === 'Player' ? 'Player' : 'Coach';
  const base = {
    username: answers.username.trim(),
    email: answers.email.trim(),
    password: answers.password,
    password_confirmation: answers.passwordConfirmation,
    role,
  };

  const teamCode = answers.teamCode.trim();

  if (answers.role === 'Player') {
    return { ...base, riot_id: answers.riotId.trim(), ...(teamCode ? { team_code: teamCode } : {}) };
  }

  if (answers.teamMode === 'create') {
    const description = answers.description.trim();
    return {
      ...base,
      team_action: 'create',
      team_name: answers.teamName.trim(),
      ...(description ? { description } : {}),
    };
  }

  return { ...base, ...(teamCode ? { team_code: teamCode } : {}) };
}

/** The one rule the browser cannot express with an attribute. Withheld until the
 *  user has typed a confirmation, so it does not accuse them mid-keystroke. */
export function passwordProblem(answers: EnrolmentAnswers): string | undefined {
  if (!answers.passwordConfirmation) return undefined;
  return answers.password === answers.passwordConfirmation
    ? undefined
    : 'The passwords do not match.';
}

/** Which screen owns a field the server rejected, so the message lands under the
 *  input rather than as a banner. A Player answers everything on one screen. */
export function stepForField(field: string, role: EnrolmentRole): EnrolmentStep | null {
  if (role === 'Player') {
    return field === 'team_action' || field === 'team_name' ? null : 'profile';
  }
  switch (field) {
    case 'username':
    case 'email':
    case 'password':
      return 'profile';
    case 'team_name':
    case 'description':
    case 'team_code':
      return 'team';
    default:
      return null;
  }
}

export interface LadderStep {
  /** Null for a rung that is not a screen of this wizard — the player's ladder
   *  ends on the dashboard it leads to. */
  step: EnrolmentStep | null;
  /** The reference screen's own number, which is what the design draws. */
  index: string;
  label: string;
  /** The answer already given, shown beside a completed rung. */
  value?: string;
}

/** The left panel's rungs, per `docs/design/02`–`05`. The player's sequence runs
 *  02 → 04 → 07 and the coach's 02 → 03 → 05, so the ladder follows the role. */
export function ladderFor(answers: EnrolmentAnswers): LadderStep[] {
  if (answers.role === 'Player') {
    return [
      { step: 'role', index: '02', label: 'Account type', value: 'PLAYER' },
      {
        step: 'profile',
        index: '04',
        label: 'Player details',
        value: answers.teamCode.trim().toUpperCase() || undefined,
      },
      { step: null, index: '07', label: 'Dashboard' },
    ];
  }

  return [
    { step: 'role', index: '02', label: 'Account type', value: answers.role ? 'COACH' : undefined },
    { step: 'profile', index: '03', label: 'Profile', value: answers.username.trim() || undefined },
    { step: 'team', index: '05', label: 'Team' },
  ];
}
