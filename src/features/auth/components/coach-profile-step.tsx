import type { FormEvent } from 'react';
import { CredentialFields } from '@/features/auth/components/credential-fields';
import {
  AgeAttestation,
  Fields,
  FormActions,
  LegalNotice,
} from '@/features/auth/components/enrolment-form';
import { passwordProblem } from '@/features/auth/enrolment';
import type { EnrolmentAnswers } from '@/features/auth/enrolment';
import styles from './enrolment-form.module.css';

export interface CoachProfileStepProps {
  answers: EnrolmentAnswers;
  onChange: (patch: Partial<EnrolmentAnswers>) => void;
  errors: Readonly<Record<string, string | undefined>>;
  isOfAge: boolean;
  onAttest: (checked: boolean) => void;
  onContinue: () => void;
  onBack: () => void;
}

/** Screen 03. The action reads Continue, not the drawn Register: nothing is
 *  created until team setup submits the one request (#31). */
export function CoachProfileStep({
  answers,
  onChange,
  errors,
  isOfAge,
  onAttest,
  onContinue,
  onBack,
}: CoachProfileStepProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passwordProblem(answers)) return;
    onContinue();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Fields>
        <CredentialFields answers={answers} onChange={onChange} errors={errors} disabled={false} />
      </Fields>

      <AgeAttestation checked={isOfAge} onChange={onAttest} />
      <FormActions submitLabel="Continue" pending={false} onBack={onBack} />
      <LegalNotice />
    </form>
  );
}
