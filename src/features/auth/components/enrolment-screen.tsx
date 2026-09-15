import type { ReactNode } from 'react';
import { AuthPanel } from '@/features/auth/components/auth-panel';
import { EnrolmentLadder } from '@/features/auth/components/enrolment-ladder';
import { ladderFor } from '@/features/auth/enrolment';
import type { EnrolmentAnswers, EnrolmentStep } from '@/features/auth/enrolment';
import styles from './enrolment-screen.module.css';

const DISCLAIMER =
  "THIS PRODUCT ISN'T ENDORSED BY RIOT GAMES AND DOESN'T REFLECT THE VIEWS OR OPINIONS OF " +
  'RIOT GAMES OR ANYONE OFFICIALLY INVOLVED IN PRODUCING OR MANAGING RIOT GAMES PROPERTIES. ' +
  'RIOT GAMES, AND ALL ASSOCIATED PROPERTIES ARE TRADEMARKS OR REGISTERED TRADEMARKS OF ' +
  'RIOT GAMES, INC.';

/** The split shell every enrolment screen wears: the plate on the left with
 *  whatever ladder the caller gives it, and the right-hand column. */
export function EnrolmentShell({ ladder, children }: { ladder: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.screen}>
      <AuthPanel status="ENROLMENT" className={styles.panel}>
        {ladder}
      </AuthPanel>

      <main className={styles.formSide}>
        <div className={styles.grid} aria-hidden="true" />
        {children}
      </main>
    </div>
  );
}

export interface EnrolmentScreenProps {
  answers: EnrolmentAnswers;
  step: EnrolmentStep;
  onGoTo: (step: EnrolmentStep) => void;
  /** The reference screen's number, shown in the eyebrow and the step count. */
  index: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
}

/** The split composition screens 02–05 share: the enrolment plate on the left
 *  with the ladder in its slot, and the step's own form on the right. */
export function EnrolmentScreen({
  answers,
  step,
  onGoTo,
  index,
  eyebrow,
  title,
  lede,
  children,
}: EnrolmentScreenProps) {
  return (
    <EnrolmentShell
      ladder={<EnrolmentLadder steps={ladderFor(answers)} activeStep={step} onGoTo={onGoTo} />}
    >
      {/* Static, as on login: a real reading needs a health check no spec asks
          for yet. */}
      <div className={styles.apiStatus}>
        <span className={styles.apiDot} />
        API:OK
      </div>

      <div className={styles.body}>
        <div className={styles.titleBlock}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowIndex}>{index}</span>
            <span className={styles.eyebrowRule} />
            <span>{eyebrow}</span>
          </div>
          <h1 className={styles.heading}>{title}</h1>
          {lede ? <p className={styles.lede}>{lede}</p> : null}
        </div>

        {children}
      </div>

      <div className={styles.footer}>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
        <p className={styles.stepCount}>STEP {index} OF 05</p>
      </div>
    </EnrolmentShell>
  );
}
