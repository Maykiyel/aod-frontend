import type { ReactNode } from 'react';
import { Surface } from '@/components/ui/surface/surface';
import { cx } from '@/utils/cx';
import styles from './auth-panel.module.css';

export interface AuthPanelProps {
  /** Mono reading beside the red mark, e.g. 'AUTH_GATE' or 'ENROLMENT'. */
  status: string;
  /** Sets the plate's basis, minimum width and wordmark size — login and
   *  enrolment draw the same panel at different widths. */
  className?: string;
  /** What sits below the wordmark: the timeline motif on login, the enrolment
   *  ladder on sign-up. A slot rather than a mode prop, so neither screen
   *  carries the other's markup. */
  children?: ReactNode;
}

/** The left-hand plate every auth screen shares: machined silhouettes, corner
 *  bolts, a status reading and the wordmark, with one slot underneath. */
export function AuthPanel({ status, className, children }: AuthPanelProps) {
  return (
    <div className={cx(styles.panel, className)}>
      <Surface level={1} behind="var(--void)" padding="0" className={styles.plate}>
        <div className={styles.inner}>
          <div className={styles.statusRow}>
            <span className={styles.status}>
              <span className={styles.statusMark} />
              {status}
            </span>
            <span className={styles.build}>BUILD:4.0.2</span>
          </div>

          <div className={styles.brand}>
            <div className={styles.wordmark}>
              <div>Beyond</div>
              <div className={styles.wordmarkRow}>
                <span>Mechanics</span>
                <span className={styles.rule} />
              </div>
            </div>
            <p className={styles.strapline}>
              AUDIO-BASED COMMUNICATION ANALYSIS FOR ESPORTS TEAMS
            </p>
          </div>

          <div className={styles.slot}>{children}</div>
        </div>
      </Surface>

      {/* Machined-plate silhouettes and corner bolts. Purely decorative. */}
      <div className={styles.plateEdge} />
      <div className={styles.plateEdgeInner} />
      <div className={styles.plateFoot} />
      <span className={`${styles.bolt} ${styles.boltTopLeft}`} />
      <span className={`${styles.bolt} ${styles.boltTopRight}`} />
      <span className={`${styles.bolt} ${styles.boltBottomLeft}`} />
      <span className={`${styles.bolt} ${styles.boltBottomRight}`} />
    </div>
  );
}
