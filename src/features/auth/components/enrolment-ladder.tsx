import { cx } from '@/utils/cx';
import type { EnrolmentStep, LadderStep } from '@/features/auth/enrolment';
import styles from './enrolment-ladder.module.css';

export interface EnrolmentLadderProps {
  steps: LadderStep[];
  activeStep: EnrolmentStep;
  onGoTo: (step: EnrolmentStep) => void;
}

/** Progress through enrolment, with completed rungs clickable so an answer three
 *  screens back can be changed without starting over. Completed rungs are
 *  buttons, upcoming ones plain rows — the ladder never skips ahead. */
export function EnrolmentLadder({ steps, activeStep, onGoTo }: EnrolmentLadderProps) {
  const activeIndex = steps.findIndex((rung) => rung.step === activeStep);

  return (
    <nav className={styles.ladder} aria-label="Enrolment sequence">
      <span className={styles.caption}>ENROLMENT SEQUENCE</span>

      <div className={styles.rungs}>
        {steps.map((rung, position) => {
          const isActive = position === activeIndex;
          // Null unless this rung is a completed screen, which also narrows the
          // step for the handler below.
          const target = position < activeIndex ? rung.step : null;

          const content = (
            <>
              <span className={styles.index}>{rung.index}</span>
              <span className={styles.pip} aria-hidden="true" />
              <span className={styles.label}>{rung.label}</span>
              {rung.value ? <span className={styles.value}>{rung.value}</span> : null}
            </>
          );

          return target ? (
            <button
              key={rung.index}
              type="button"
              className={cx(styles.rung, styles.done)}
              onClick={() => onGoTo(target)}
            >
              {content}
            </button>
          ) : (
            <div
              key={rung.index}
              className={cx(styles.rung, isActive ? styles.active : null)}
              aria-current={isActive ? 'step' : undefined}
            >
              {content}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
