import { FlagBadge } from '@/components/flag-badge/flag-badge';
import { NotchedCard } from '@/components/ui/notched-card/notched-card';
import { Surface } from '@/components/ui/surface/surface';
import { Tag } from '@/components/ui/tag/tag';
import type { DashboardWindow } from '@/features/dashboard/types';
import styles from './session-pool-card.module.css';

interface SessionPoolCardProps {
  window: DashboardWindow;
  /** Whether to offer the one action that lengthens the pool. Hides a control,
   *  never grants one — `SessionPolicy::create` is the authority. */
  canConfigureSessions: boolean;
}

/**
 * The pool every other number on the screen is computed over, plain: a live
 * session has taken the screen's one notch (#6).
 */
export function SessionPoolCard(props: SessionPoolCardProps) {
  return (
    <section aria-label="Session pool">
      <Surface level={2} behind="var(--void)">
        <SessionPoolReading {...props} />
      </Surface>
    </section>
  );
}

/**
 * The same card carrying the screen's one inward notch, for when no session is
 * live. Flagged because it is what a short pool collapses the data cards for,
 * and the card that still explains the screen when they are gone.
 */
export function FlaggedSessionPoolCard(props: SessionPoolCardProps) {
  return (
    <section aria-label="Session pool">
      <NotchedCard
        level={2}
        padding="var(--notch-clearance) var(--space-6) var(--space-6)"
        badge={<FlagBadge />}
      >
        <SessionPoolReading {...props} />
      </NotchedCard>
    </section>
  );
}

function SessionPoolReading({
  window: analysisWindow,
  canConfigureSessions,
}: SessionPoolCardProps) {
  const short = analysisWindow.sessions_analyzed < analysisWindow.sessions_requested;

  return (
    <>
      <div className={styles.head}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>SESSION POOL</span>
          <span className={styles.title}>Last {analysisWindow.sessions_requested} sessions</span>
        </div>
        <div className={styles.readings}>
          <Tag tone={short ? 'alert' : 'neutral'}>
            ANALYSED {analysisWindow.sessions_analyzed} OF {analysisWindow.sessions_requested}
          </Tag>
        </div>
      </div>

      {short && canConfigureSessions ? (
        <p className={styles.note}>Create a session to start recording.</p>
      ) : null}
    </>
  );
}
