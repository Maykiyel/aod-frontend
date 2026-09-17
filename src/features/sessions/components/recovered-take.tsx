import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button/button';
import { Surface } from '@/components/ui/surface/surface';
import { formatBytes, formatClock } from '@/features/sessions/recording';
import { useCapture } from '@/lib/capture/hooks';
import styles from './recovered-take.module.css';

/** A reload leaves the player holding two takes and the endpoint stores one per
 *  participant, so the earlier one is offered as a file and a fresh recorder
 *  starts. Uploading it and overwriting it later was rejected (spec #40). */
const STILL_RUNNING =
  'This session keeps only what your current recorder captures. The minutes before your reload cannot be delivered, so save them now if you want them.';

const ALREADY_OVER =
  'This session has already ended, so this recording can no longer be delivered to it. Save it now, or it stays in this browser.';

export function RecoveredTake({ sessionId, live }: { sessionId: number; live: boolean }) {
  const capture = useCapture();
  const queryClient = useQueryClient();
  const key = ['capture', 'recoverable', sessionId];

  // Read once on arrival, and before any run this Screen starts: a fresh
  // recorder never collides with an orphan, but a Screen that asked afterwards
  // would be offering back the take it had just begun.
  const found = useQuery({
    queryKey: key,
    queryFn: async () => {
      const orphans = await capture.recoverable();
      const held = orphans.find((orphan) => orphan.sessionId === sessionId);
      return held ? { orphan: held, saved: false } : null;
    },
    staleTime: Infinity,
  });

  if (!found.data) return null;
  const { orphan, saved } = found.data;

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

      <p className={styles.body}>{live ? STILL_RUNNING : ALREADY_OVER}</p>

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
            // Written to the cache rather than to local state: the orphan is
            // gone from the browser afterwards, so a remount must not re-offer it.
            void orphan.save().then(() => queryClient.setQueryData(key, { orphan, saved: true }));
          }}
        >
          Save recording
        </Button>
      )}
    </Surface>
  );
}
