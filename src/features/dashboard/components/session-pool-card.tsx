import { Badge } from '@/components/ui/badge/badge';
import { Icon } from '@/components/ui/icon/icon';
import { NotchedCard } from '@/components/ui/notched-card/notched-card';
import { Tag } from '@/components/ui/tag/tag';
import { formatCount } from '@/features/dashboard/format';
import type { DashboardWindow } from '@/features/dashboard/types';
import styles from './session-pool-card.module.css';

interface SessionPoolCardProps {
  window: DashboardWindow;
  analysisReadyCount: number;
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
  window: pool,
  analysisReadyCount,
  canConfigureSessions,
}: SessionPoolCardProps) {
  const short = pool.sessions_analyzed < pool.sessions_requested;

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
            <span className={styles.title}>Last {pool.sessions_requested} sessions</span>
          </div>
          <div className={styles.readings}>
            <Tag tone={short ? 'alert' : 'neutral'}>
              ANALYSED {pool.sessions_analyzed} OF {pool.sessions_requested}
            </Tag>
            <Tag>{formatCount(analysisReadyCount)} ANALYSIS READY</Tag>
          </div>
        </div>

        {short ? (
          <p className={styles.note}>
            The team has {formatCount(analysisReadyCount)} analysis-ready{' '}
            {analysisReadyCount === 1 ? 'session' : 'sessions'} and the pool asks for{' '}
            {pool.sessions_requested}. The data cards stay collapsed until it has that many.
            {canConfigureSessions ? ' Create a session to start recording.' : null}
          </p>
        ) : null}
      </NotchedCard>
    </section>
  );
}
