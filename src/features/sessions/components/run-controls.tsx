import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { RailPanel, RailReading, RailReadings } from '@/components/rail-panel/rail-panel';
import { Button } from '@/components/ui/button/button';
import { sessionKeys } from '@/features/sessions/api/get-sessions';
import { endRun, leaveRun } from '@/features/sessions/api/session-actions';
import type { Discarded } from '@/features/sessions/api/session-actions';
import { useSessionAction } from '@/features/sessions/hooks/use-session-action';
import type { DeliveryState } from '@/features/sessions/hooks/use-delivery';
import { formatClock } from '@/features/sessions/recording';
import type { Session, SessionParticipant } from '@/types/api';
import styles from './run-controls.module.css';

/** Ending the run is a broadcast, not a message: every client finishes and
 *  uploads on the status move. Completing the Session is a second control and
 *  belongs to #8, so a run ended here waits for the Coach (spec #40). */
export function CoachRunControls({ session }: { session: Session }) {
  const end = useSessionAction(endRun);
  const ended = session.status === 'delivering';

  return (
    <RailPanel title={ended ? 'Run ended' : 'End the run'}>
      <p className={styles.lede}>
        {ended
          ? 'Every client is finishing its recorder and uploading. The capture table says who is still coming.'
          : 'Ending the run stops every recorder and starts every upload. Nobody presses stop on their own machine.'}
      </p>

      {ended ? null : (
        <Button disabled={end.isPending} onClick={() => end.mutate(session.id)}>
          End run
        </Button>
      )}

      {/* The design draws a return-to-lobby control beside this one. It discards
          every take on the Session, so it is not built (spec #40). */}
      {end.error ? (
        <p className={styles.error} role="alert">
          {end.error.message}
        </p>
      ) : null}
    </RailPanel>
  );
}

/** A Coach's sense of time, and not an elapsed clock: only a player has a
 *  recorder to count. The design's DEAD AIR THRESHOLD and KEYWORD SETS readings
 *  are dropped: #40's rail is the wall clock, and both are wrong in the mock. */
export function RunReadings({ session }: { session: Session }) {
  return (
    <RailPanel title="Session">
      <RailReadings>
        <RailReading term="Session" value={session.session_code ?? '—'} />
        <RailReading term="Started" value={formatClock(session.started_at)} />
      </RailReadings>
    </RailPanel>
  );
}

/** What leaving will destroy, named from what this client already knows: the
 *  Session body carries their own Delivery State, and their status says whether
 *  a recorder is running. */
function willDestroy(self: SessionParticipant | null): string {
  const delivered = [self?.aod ? 'audio' : null, self?.vod ? 'video' : null].filter(Boolean);

  if (delivered.length > 0) {
    return `Leaving discards the ${delivered.join(' and ')} you have already delivered, and ends your recording. Neither reaches this session.`;
  }

  return self?.participant_status === 'recording'
    ? 'Leaving ends your recording. Nothing you have captured reaches this session.'
    : 'Leaving takes you out of this session. You have delivered nothing, so nothing is lost.';
}

function wasDestroyed(discarded: Discarded): string {
  if (discarded.audio && discarded.video) return 'AUDIO AND VIDEO DISCARDED';
  if (discarded.audio) return 'AUDIO DISCARDED';
  return discarded.video ? 'VIDEO DISCARDED' : 'NOTHING WAS LOST';
}

/** The only way out mid-run. Stopping has the same destructive effect under the
 *  backend's ADR 0013, so shipping both would be two controls for one outcome. */
export function LeaveRunControl({
  sessionId,
  self,
}: {
  sessionId: number;
  self: SessionParticipant | null;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [asking, setAsking] = useState(false);

  // Deliberately not `useSessionAction`: invalidating here would refetch a
  // Session this caller has just left, which can re-route the Screen out from
  // under the one sentence saying what leaving destroyed.
  const leave = useMutation({ mutationFn: leaveRun });

  async function toSessions() {
    await queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    await navigate('/sessions');
  }

  if (leave.data) {
    return (
      <RailPanel title="You left">
        <p className={styles.reading}>{wasDestroyed(leave.data.discarded)}</p>
        <Button variant="secondary" onClick={() => void toSessions()}>
          Back to sessions
        </Button>
      </RailPanel>
    );
  }

  if (!asking) {
    return (
      <div className={styles.leave}>
        <Button variant="ghost" onClick={() => setAsking(true)}>
          Leave session
        </Button>
      </div>
    );
  }

  return (
    <RailPanel title="Leave this session">
      <p className={styles.lede}>{willDestroy(self)}</p>

      <Button disabled={leave.isPending} onClick={() => leave.mutate(sessionId)}>
        Leave and discard
      </Button>

      <div className={styles.secondary}>
        <Button variant="ghost" disabled={leave.isPending} onClick={() => setAsking(false)}>
          Stay in the session
        </Button>
      </div>

      {leave.error ? (
        <p className={styles.error} role="alert">
          {leave.error.message}
        </p>
      ) : null}
    </RailPanel>
  );
}

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
