import { FlagBadge } from '@/components/ui/badge/badge';
import { ButtonLink } from '@/components/ui/button/button';
import { NotchedCard } from '@/components/ui/notched-card/notched-card';
import { Tag } from '@/components/ui/tag/tag';
import { sessionState } from '@/features/sessions/session-state';
import type { Session } from '@/types/api';
import styles from './live-session-card.module.css';

/** The dashboard's one notched card while a Session is live. With none it is not
 *  rendered at all and the notch returns to the session pool (spec #33). */
export function LiveSessionCard({ session }: { session: Session }) {
  const state = sessionState(session.status);

  return (
    <section aria-label="Live session">
      <NotchedCard
        level={2}
        padding="var(--notch-clearance) var(--space-6) var(--space-6)"
        badge={<FlagBadge />}
      >
        <div className={styles.body}>
          <div className={styles.identity}>
            <span className={styles.code}>{session.session_code}</span>
            <span className={styles.name}>{session.session_name}</span>
          </div>
          <div className={styles.actions}>
            <Tag tone={state.tone} dot={state.dot}>
              {state.label}
            </Tag>
            <ButtonLink to={`/sessions/${session.id}`}>Open session</ButtonLink>
          </div>
        </div>
      </NotchedCard>
    </section>
  );
}
