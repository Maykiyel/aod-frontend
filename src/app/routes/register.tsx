import { useState } from 'react';
import { useFetcher } from 'react-router';
import { CoachProfileStep } from '@/features/auth/components/coach-profile-step';
import { EnrolmentScreen } from '@/features/auth/components/enrolment-screen';
import { PendingOutcome } from '@/features/auth/components/pending-outcome';
import { PlayerProfileStep } from '@/features/auth/components/player-profile-step';
import { RoleStep } from '@/features/auth/components/role-step';
import { TeamStep } from '@/features/auth/components/team-step';
import { EMPTY_ANSWERS, stepForField, toRegistrationRequest } from '@/features/auth/enrolment';
import type {
  EnrolmentAnswers,
  EnrolmentRole,
  EnrolmentStep,
} from '@/features/auth/enrolment';
import type { RegisterActionData } from '@/app/routes/register-action';

/** The screen a rejection belongs on: the field it names decides, so a taken
 *  username is never a banner on team setup. */
function rejectedStep(
  result: RegisterActionData | undefined,
  role: EnrolmentRole | null,
): EnrolmentStep | null {
  if (result?.outcome !== 'rejected' || !role) return null;
  for (const field of Object.keys(result.fieldErrors)) {
    const owner = stepForField(field, role);
    if (owner) return owner;
  }
  return null;
}

/** Screens 02–05. Four screens, one request at the end — so the answers live
 *  here, screen-local (ADR 0010), and nothing persists until the final action. */
export function RegisterRoute() {
  const fetcher = useFetcher<RegisterActionData>();
  const [answers, setAnswers] = useState<EnrolmentAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState<EnrolmentStep>('role');
  const [isOfAge, setIsOfAge] = useState(false);
  const [seenResult, setSeenResult] = useState<RegisterActionData | undefined>(undefined);

  const result = fetcher.data;
  const pending = fetcher.state !== 'idle';

  // A new rejection moves the user to the screen that owns the field, adjusted
  // during render rather than in an effect (`rerender-derived-state-no-effect`).
  if (result !== seenResult) {
    setSeenResult(result);
    const owner = rejectedStep(result, answers.role);
    if (owner) setStep(owner);
  }

  if (result?.outcome === 'pending') return <PendingOutcome team={result.team} />;

  function change(patch: Partial<EnrolmentAnswers>) {
    setAnswers((current) => ({ ...current, ...patch }));
  }

  function submit() {
    // JSON rather than a form body: the payload is accumulated across four
    // screens, and its role-conditional shape is not a flat set of inputs.
    void fetcher.submit(toRegistrationRequest(answers), {
      method: 'post',
      encType: 'application/json',
    });
  }

  // A rejection naming no field of this screen's own is the page's to report.
  const rejection = result?.outcome === 'rejected' ? result : undefined;
  const ownedFields = Object.keys(rejection?.fieldErrors ?? {}).filter(
    (field) => answers.role && stepForField(field, answers.role) === step,
  );
  const formError = rejection && ownedFields.length === 0 ? rejection.message : null;
  const fieldErrors = Object.fromEntries(
    ownedFields.map((field) => [field, rejection?.fieldErrors[field]?.[0]]),
  );

  const shared = { answers, step, onGoTo: setStep };

  if (step === 'role') {
    return (
      <EnrolmentScreen
        {...shared}
        index="02"
        eyebrow="ACCOUNT TYPE"
        title="Who is signing up?"
        lede="This sets what you see after login. Coaches get the roster and review board; players get their own sessions and consent controls."
      >
        <RoleStep
          role={answers.role}
          onChange={(role: EnrolmentRole) => change({ role })}
          onContinue={() => setStep('profile')}
        />
      </EnrolmentScreen>
    );
  }

  if (answers.role === 'Player') {
    // The player's last screen: a player cannot own a team, so there is no team
    // setup to go on to and this is where the one request is sent.
    return (
      <EnrolmentScreen {...shared} index="04" eyebrow="SIGN UP — PLAYER" title="Your player details">
        <PlayerProfileStep
          answers={answers}
          onChange={change}
          errors={fieldErrors}
          formError={formError}
          pending={pending}
          isOfAge={isOfAge}
          onAttest={setIsOfAge}
          onSubmit={submit}
          onBack={() => setStep('role')}
        />
      </EnrolmentScreen>
    );
  }

  if (step === 'team') {
    return (
      <EnrolmentScreen {...shared} index="05" eyebrow="TEAM SETUP" title="Set up your team">
        <TeamStep
          answers={answers}
          onChange={change}
          errors={fieldErrors}
          formError={formError}
          pending={pending}
          onSubmit={submit}
          onBack={() => setStep('profile')}
        />
      </EnrolmentScreen>
    );
  }

  return (
    <EnrolmentScreen {...shared} index="03" eyebrow="SIGN UP — COACH" title="Make your profile">
      <CoachProfileStep
        answers={answers}
        onChange={change}
        errors={fieldErrors}
        isOfAge={isOfAge}
        onAttest={setIsOfAge}
        onContinue={() => setStep('team')}
        onBack={() => setStep('role')}
      />
    </EnrolmentScreen>
  );
}
