import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button/button';
import { SectionHeader } from '@/components/ui/section-header/section-header';
import { Surface } from '@/components/ui/surface/surface';
import { EnrolmentLadder } from '@/features/auth/components/enrolment-ladder';
import { EnrolmentShell } from '@/features/auth/components/enrolment-screen';
import type { LadderStep } from '@/features/auth/enrolment';
import type { Team } from '@/types/api';
import styles from './pending-outcome.module.css';

/** Every rung is behind the user: enrolment is over, whatever it produced. */
const DONE_LADDER: LadderStep[] = [
  { step: null, index: '02', label: 'Account type' },
  { step: null, index: '04', label: 'Details' },
  { step: null, index: '05', label: 'Team', value: 'PENDING' },
];

/** Joining a team is a request, not an arrival. Said here because here is the
 *  only place it can honestly be said: the backend has no read path for a
 *  pending membership, so a refresh reads as teamless instead (#31). */
export function PendingOutcome({ team }: { team: Team | null }) {
  const navigate = useNavigate();

  return (
    <EnrolmentShell
      ladder={<EnrolmentLadder steps={DONE_LADDER} activeStep="team" onGoTo={() => undefined} />}
    >
      <div className={styles.outcome}>
        <Surface level={2} behind="var(--void)">
          <div className={styles.body}>
            <SectionHeader
              as="h1"
              eyebrow="Join request"
              title="Waiting on a coach"
              lede={
                team
                  ? `Your request to join ${team.team_name} is with its main coach.`
                  : 'Your request to join is with the team’s main coach.'
              }
            />
            <span className={styles.reading}>MEMBERSHIP:PENDING</span>
            <p className={styles.instruction}>
              You are not on the roster yet, so the team has nothing to show you until the request
              is accepted. Your account is made and you are signed in — check back after a coach
              has decided.
            </p>
            <div>
              <Button onClick={() => void navigate('/', { replace: true })}>Continue</Button>
            </div>
          </div>
        </Surface>
      </div>
    </EnrolmentShell>
  );
}
