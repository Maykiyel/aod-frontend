import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button/button';
import { Surface } from '@/components/ui/surface/surface';
import { formatBytes, formatClock } from '@/features/sessions/recording';
import { useCapture } from '@/lib/capture/hooks';
import type { Session } from '@/types/api';
import styles from './recovered-take.module.css';

const LIVE_SESSIONS: readonly string[] = ['queuing', 'in_progress', 'delivering'];

/** A reload leaves the player holding two takes, and the endpoint stores one
 *  file per participant. Only one of them can ever reach the Session, so the
 *  earlier one is offered as a file to save and a fresh recorder starts.
 *  Uploading it and letting the continuation overwrite it was rejected: it
 *  destroys something the player was told was safe (spec #40). */
const STILL_RUNNING =
  'This session keeps only what your current recorder captures. The minutes before your reload cannot be delivered, so save them now if you want them.';

const ALREADY_OVER =
  'This session has already ended, so this recording can no longer be delivered to it. Save it now, or it stays in this browser.';

export function RecoveredTake({ session }: { session: Session }) {
  const capture = useCapture();
  const [saved, setSaved] = useState(false);

  // Read once on arrival, and before any run this Screen starts: a fresh
  // recorder never collides with an orphan, but a Screen that asked afterwards
  // would be offering back the take it had just begun.
  const found = useQuery({
    queryKey: ['capture', 'recoverable', session.id],
    queryFn: async () => {
      const orphans = await capture.recoverable();
      return orphans.find((orphan) => orphan.sessionId === session.id) ?? null;
    },
    staleTime: Infinity,
  });

  const orphan = found.data;
  if (!orphan) return null;

  return (
    <Surface
      as="section"
      level={2}
      behind="var(--void)"
      padding="var(--space-5)"
      aria-label="Unfinished recording"
      className={styles.panel}
    >
      <span className={styles.head}>
        <span className={styles.mark} aria-hidden="true" />
        UNFINISHED RECORDING FOUND IN THIS BROWSER
      </span>

      <p className={styles.body}>
        {LIVE_SESSIONS.includes(session.status) ? STILL_RUNNING : ALREADY_OVER}
      </p>

      <dl className={styles.readings}>
        <div className={styles.reading}>
          <dt className={styles.term}>Started</dt>
          <dd className={styles.value}>{formatClock(orphan.startedAt)}</dd>
        </div>
        <div className={styles.reading}>
          <dt className={styles.term}>Size</dt>
          <dd className={styles.value}>{formatBytes(orphan.bytes)}</dd>
        </div>
      </dl>

      {saved ? (
        <p className={styles.saved}>SAVED — THIS BROWSER NO LONGER HOLDS IT</p>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            void orphan.save().then(() => setSaved(true));
          }}
        >
          Save recording
        </Button>
      )}
    </Surface>
  );
}
