import { Button } from '@/components/ui/button/button';
import { RailPanel } from '@/components/rail-panel/rail-panel';
import type { DeliveryState } from '@/features/sessions/hooks/use-delivery';
import styles from './run-controls.module.css';

const WAITING =
  'Your take is delivered when the coach ends the run. Nothing is uploaded before then.';

/** The browser's own warning can only say its own generic sentence, so the real
 *  one sits beside it. */
const KEEP_OPEN = 'KEEP THIS TAB OPEN UNTIL YOUR TAKE HAS LANDED';

/** One player's own delivery, as it happens. Progress is rendered because a
 *  player deciding whether to close the tab needs to know whether to wait. */
export function DeliveryReadout({ state, onRetry }: { state: DeliveryState; onRetry: () => void }) {
  return (
    <RailPanel title="Your delivery">
      {state.phase === 'holding' ? <p className={styles.lede}>{WAITING}</p> : null}

      {state.phase === 'finishing' ? (
        <p className={styles.reading}>FINISHING YOUR RECORDING</p>
      ) : null}

      {state.phase === 'uploading' ? (
        <>
          <p className={styles.reading}>UPLOADING — {Math.round(state.progress * 100)}%</p>
          <span
            className={styles.bar}
            role="progressbar"
            aria-label="Upload progress"
            aria-valuenow={Math.round(state.progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className={styles.barFill} style={{ inlineSize: `${state.progress * 100}%` }} />
          </span>
          <span className={styles.micro}>{KEEP_OPEN}</span>
        </>
      ) : null}

      {state.phase === 'delivered' ? <p className={styles.delivered}>DELIVERED</p> : null}

      {state.phase === 'failed' ? (
        <>
          {/* Three attempts, then stop and say so: retrying forever hides a dead
              connection behind a spinner (spec #40). */}
          <p className={styles.error} role="alert">
            {state.message}
          </p>
          <Button onClick={onRetry}>Upload again</Button>
        </>
      ) : null}
    </RailPanel>
  );
}
