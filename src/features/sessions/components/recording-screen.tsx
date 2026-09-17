import { SectionHeader } from '@/components/ui/section-header/section-header';
import { CapturePanel } from '@/features/sessions/components/capture-panel';
import { CaptureTable } from '@/features/sessions/components/capture-table';
import {
  CoachRunControls,
  DeliveryReadout,
  LeaveRunControl,
  RunReadings,
} from '@/features/sessions/components/run-controls';
import { useCaptureRun } from '@/features/sessions/hooks/use-capture-run';
import { useDelivery } from '@/features/sessions/hooks/use-delivery';
import { useSessionLive } from '@/features/sessions/hooks/use-session-live';
import { captureCount, captureRows, selfRow } from '@/features/sessions/recording';
import type { Session, TeamMember } from '@/types/api';
import styles from './recording-screen.module.css';

export interface RecordingScreenProps {
  session: Session;
  /** The team roster, so a Member who never joined still gets a row. */
  members: TeamMember[];
  selfId: number | null;
  /** Ending the run. A Capability hides a control and never grants one. */
  canRunSession: boolean;
}

/** The recording Screen, at the route #6 built. One Screen for both drawn ones:
 *  the design's own footer note on each says 11 is 10 with the player's capture
 *  panel swapped for the Coach's controls, and the table is the bulk of both. */
export function RecordingScreen({
  session,
  members,
  selfId,
  canRunSession,
}: RecordingScreenProps) {
  const sessionId = session.id;

  useSessionLive(sessionId);

  const rows = captureRows(session, members, selfId);
  const count = captureCount(rows);
  const self = selfRow(session, selfId);

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        <SectionHeader
          as="h1"
          eyebrow={canRunSession ? 'Recording — coach' : 'Recording — player'}
          index={session.session_code ?? undefined}
          title={session.session_name}
        />
        <figure className={styles.counter} aria-label="Players capturing">
          <figcaption className={styles.counterLabel}>PLAYERS CAPTURING</figcaption>
          <span className={styles.counterValue}>
            {count.capturing} <span className={styles.counterTotal}>/ {count.joined}</span>
          </span>
        </figure>
      </header>

      <div className={styles.columns}>
        <section className={styles.main}>
          {/* A Coach never records, so they get no capture panel and no elapsed
              clock. Their reading is the wall-clock start in the rail. */}
          {canRunSession ? null : <PlayerCapture session={session} />}
          <CaptureTable rows={rows} sessionStatus={session.status} />
          <Notice canRunSession={canRunSession} status={session.status} />
        </section>

        <aside className={styles.rail}>
          {canRunSession ? <CoachRunControls session={session} /> : null}
          <RunReadings session={session} />
          {self ? <LeaveRunControl sessionId={sessionId} self={self} /> : null}
        </aside>
      </div>
    </div>
  );
}

/** A player's own half of the Screen: the capture they start, and the delivery
 *  the Coach's end-of-run broadcast starts for them. Held together here because
 *  the second reads the run the first produced. */
function PlayerCapture({ session }: { session: Session }) {
  const capture = useCaptureRun(session.id);
  const run = capture.state.phase === 'capturing' ? capture.state.run : null;
  const delivery = useDelivery(session.id, run, session.status === 'delivering');

  return (
    <>
      <CapturePanel state={capture.state} onBegin={() => void capture.begin()} />

      {capture.error ? (
        <p className={styles.error} role="alert">
          {capture.error.message}
        </p>
      ) : null}

      {run ? <DeliveryReadout state={delivery.state} onRetry={() => void delivery.retry()} /> : null}
    </>
  );
}

/** The one thing this Screen has to keep saying: nothing here is live except
 *  recording status and elapsed time, and there is no in-session analysis. */
function Notice({ canRunSession, status }: { canRunSession: boolean; status: string }) {
  const ended = status === 'delivering';

  return (
    <div className={styles.notice}>
      <span className={styles.noticeHead}>
        <span className={styles.noticeMark} aria-hidden="true" />
        {ended ? 'Run ended — takes are arriving' : 'Run under way'}
      </span>
      <span className={styles.noticeBody}>
        {canRunSession
          ? 'Nothing is analysed while the session runs. Every reading arrives after it ends.'
          : 'Nothing is analysed while you play. The meter is your own device level, not a measurement.'}
      </span>
    </div>
  );
}
