import type { FormEvent } from 'react';
import { Icon } from '@/components/ui/icon/icon';
import {
  Field,
  Fields,
  FormActions,
  FormError,
} from '@/features/auth/components/enrolment-form';
import type { EnrolmentAnswers, TeamMode } from '@/features/auth/enrolment';
import formStyles from './enrolment-form.module.css';
import styles from './team-step.module.css';

/** Joining with no code entered is not a join — it registers with no team, and
 *  the button has to say so. */
function joinLabel(teamCode: string): string {
  return teamCode.trim() ? 'Join team' : 'Register';
}

const HELPER: Record<TeamMode, string> = {
  create:
    'Creating a team generates a join code. Players enter it on their own sign-up step, so you can invite the roster after this.',
  join: 'Joining files a request. The main coach sees it on their team page and decides whether to accept it. Leave the code blank to register without a team and join one later.',
};

export interface TeamStepProps {
  answers: EnrolmentAnswers;
  onChange: (patch: Partial<EnrolmentAnswers>) => void;
  errors: Readonly<Record<string, string | undefined>>;
  formError: string | null;
  pending: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

/** Screen 05, coaches only: a player cannot own a team, and `team_action` is
 *  prohibited on any other role (#31). The tab swaps the fields and the action's
 *  label together, so the button always names what it is about to do. */
export function TeamStep({
  answers,
  onChange,
  errors,
  formError,
  pending,
  onSubmit,
  onBack,
}: TeamStepProps) {
  const { teamMode } = answers;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <div className={styles.tabs} role="tablist" aria-label="Team setup">
        <TeamModeTab mode="create" label="CREATE TEAM" current={teamMode} onChange={onChange} />
        <TeamModeTab mode="join" label="JOIN TEAM" current={teamMode} onChange={onChange} />
      </div>

      <div className={styles.panel} role="tabpanel">
        {teamMode === 'create' ? (
          <Fields>
            <Field
              label="Team name"
              name="team_name"
              placeholder="Team Nova"
              required
              disabled={pending}
              value={answers.teamName}
              onChange={(event) => onChange({ teamName: event.target.value })}
              error={errors.team_name}
            />
            <Field
              label="Description"
              name="description"
              placeholder="Valorant scrim squad"
              disabled={pending}
              value={answers.description}
              onChange={(event) => onChange({ description: event.target.value })}
              error={errors.description}
            />
          </Fields>
        ) : (
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
        )}
      </div>

      {formError ? <FormError>{formError}</FormError> : null}

      {/* The label follows the tab, and within the join tab it follows the
          answer: with no code this registers an account and no team. */}
      <FormActions
        submitLabel={teamMode === 'create' ? 'Create team' : joinLabel(answers.teamCode)}
        pending={pending}
        onBack={onBack}
      />

      <p className={styles.helper}>
        <span className={styles.helperMark} aria-hidden="true">
          <Icon name="add" size={11} />
        </span>
        {HELPER[teamMode]}
      </p>
    </form>
  );
}

function TeamModeTab({
  mode,
  label,
  current,
  onChange,
}: {
  mode: TeamMode;
  label: string;
  current: TeamMode;
  onChange: (patch: Partial<EnrolmentAnswers>) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      className={styles.tab}
      aria-selected={current === mode}
      onClick={() => onChange({ teamMode: mode })}
    >
      {label}
    </button>
  );
}
