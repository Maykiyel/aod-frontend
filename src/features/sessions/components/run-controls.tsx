import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { RailPanel, RailReading, RailReadings } from '@/components/rail-panel/rail-panel';
import { Button } from '@/components/ui/button/button';
import { sessionKeys } from '@/features/sessions/api/get-sessions';
import { endRun, leaveRun } from '@/features/sessions/api/session-actions';
import type { Discarded } from '@/features/sessions/api/session-actions';
import { useSessionAction } from '@/features/sessions/hooks/use-session-action';
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

/** A Coach's sense of time. Not an elapsed clock: two people on one run would
 *  read different numbers in the same treatment, and only a player has a
 *  recorder to count (spec #40).
 *
 *  The design also draws DEAD AIR THRESHOLD and KEYWORD SETS here. Both come
 *  from `GET /teams/settings`, which answers a player 403, so neither is drawn. */
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
