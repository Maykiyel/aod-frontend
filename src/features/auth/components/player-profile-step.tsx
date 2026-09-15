import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button/button';
import { Icon } from '@/components/ui/icon/icon';
import { CredentialFields } from '@/features/auth/components/credential-fields';
import {
  AgeAttestation,
  Field,
  Fields,
  FormActions,
  FormError,
  LegalNotice,
  Notice,
  NoticeReading,
  NoticeRow,
} from '@/features/auth/components/enrolment-form';
import { passwordProblem } from '@/features/auth/enrolment';
import type { EnrolmentAnswers } from '@/features/auth/enrolment';
import styles from './enrolment-form.module.css';

export interface PlayerProfileStepProps {
  answers: EnrolmentAnswers;
  onChange: (patch: Partial<EnrolmentAnswers>) => void;
  errors: Readonly<Record<string, string | undefined>>;
  formError: string | null;
  pending: boolean;
  isOfAge: boolean;
  onAttest: (checked: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
}

/** Screen 04, and the last screen of the player's enrolment: a player cannot own
 *  a team, so there is no team-setup step to go on to. The team code is
 *  optional — left blank, the registration asks for no team at all. */
export function PlayerProfileStep({
  answers,
  onChange,
  errors,
  formError,
  pending,
  isOfAge,
  onAttest,
  onSubmit,
  onBack,
}: PlayerProfileStepProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passwordProblem(answers)) return;
    onSubmit();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Fields>
        <CredentialFields answers={answers} onChange={onChange} errors={errors} disabled={pending} />
        <Field
          label="In-game name"
          name="riot_id"
          mono
          placeholder="Player A"
          required
          disabled={pending}
          value={answers.riotId}
          onChange={(event) => onChange({ riotId: event.target.value })}
          error={errors.riot_id}
        />
      </Fields>

      {/* Riot is the reserved future shape, not current scope (#31), so the
          control the screen draws is shown in its only reachable state. */}
      <Notice label="Riot account">
        <span>
          Connecting your Riot Account lets your coach and teammates see your VALORANT match data.
          You are opting in to share this data — you can disconnect at any time.
        </span>
        <NoticeRow>
          <Button variant="secondary" disabled icon={<Icon name="aperture" size={13} />}>
            Connect Riot Account
          </Button>
          <NoticeReading>NOT CONNECTED</NoticeReading>
        </NoticeRow>
      </Notice>

      <Fields>
        <Field
          label="Team code"
          name="team_code"
          mono
          placeholder="Enter code, e.g. NOVA-7X2K"
          disabled={pending}
          value={answers.teamCode}
          onChange={(event) => onChange({ teamCode: event.target.value })}
          error={errors.team_code}
        />
      </Fields>

      <AgeAttestation checked={isOfAge} onChange={onAttest} disabled={pending} />

      {formError ? <FormError>{formError}</FormError> : null}

      {/* The label follows what the action will actually do: with no code, this
          registers an account and no team at all. */}
      <FormActions
        submitLabel={answers.teamCode.trim() ? 'Join team' : 'Register'}
        pending={pending}
        onBack={onBack}
      />
      <LegalNotice />
    </form>
  );
}
