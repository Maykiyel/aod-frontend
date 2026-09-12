import { Badge } from '@/components/ui/badge/badge';
import { Icon } from '@/components/ui/icon/icon';
import { NotchedCard } from '@/components/ui/notched-card/notched-card';
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
 * The screen's one notched card, on the pool every other number is computed
 * over. Flagged because it is what a short pool collapses the data cards for,
 * and the card that still explains the screen when they are gone.
 */
export function SessionPoolCard({
  window: analysisWindow,
  canConfigureSessions,
}: SessionPoolCardProps) {
  const short = analysisWindow.sessions_analyzed < analysisWindow.sessions_requested;

  return (
    <section aria-label="Session pool">
      <NotchedCard
        level={2}
        padding="var(--notch-clearance) var(--space-6) var(--space-6)"
        badge={
          <Badge>
            <Icon name="flagAdd" size={14} />
          </Badge>
        }
      >
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
      </NotchedCard>
    </section>
  );
}
