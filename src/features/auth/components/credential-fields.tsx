import { Field } from '@/features/auth/components/enrolment-form';
import { passwordProblem } from '@/features/auth/enrolment';
import type { EnrolmentAnswers } from '@/features/auth/enrolment';

export interface CredentialFieldsProps {
  answers: EnrolmentAnswers;
  onChange: (patch: Partial<EnrolmentAnswers>) => void;
  /** The server's objections, keyed by its own field names. */
  errors: Readonly<Record<string, string | undefined>>;
  disabled: boolean;
}

/** Named for whoever is filling them in: the reference only ever drew these on
 *  the coach screen, so its examples address a coach. */
const EXAMPLES = {
  Coach: { username: 'Coach Juan', email: 'coach@teamnova.gg' },
  Player: { username: 'Player A', email: 'player@teamnova.gg' },
} as const;

/** Username, email and password with its confirmation. Both profile screens
 *  carry this block: the drawn player screen collects no credentials at all and
 *  so cannot produce a valid registration (#31). Minimums match the backend's
 *  own rules, so malformed input never costs a round trip. */
export function CredentialFields({ answers, onChange, errors, disabled }: CredentialFieldsProps) {
  const example = EXAMPLES[answers.role ?? 'Coach'];

  return (
    <>
      <Field
        label="Username"
        name="username"
        autoComplete="username"
        placeholder={example.username}
        minLength={3}
        required
        disabled={disabled}
        value={answers.username}
        onChange={(event) => onChange({ username: event.target.value })}
        error={errors.username}
      />
      <Field
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder={example.email}
        required
        disabled={disabled}
        value={answers.email}
        onChange={(event) => onChange({ email: event.target.value })}
        error={errors.email}
      />
      <Field
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="•••••••••"
        minLength={8}
        required
        disabled={disabled}
        value={answers.password}
        onChange={(event) => onChange({ password: event.target.value })}
        error={errors.password}
      />
      <Field
        label="Confirm password"
        type="password"
        name="password_confirmation"
        autoComplete="new-password"
        placeholder="•••••••••"
        required
        disabled={disabled}
        value={answers.passwordConfirmation}
        onChange={(event) => onChange({ passwordConfirmation: event.target.value })}
        error={passwordProblem(answers)}
      />
    </>
  );
}
