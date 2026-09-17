import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { SectionHeader } from '@/components/ui/section-header/section-header';
import { joinSession } from '@/features/sessions/api/session-actions';
import { ConnectionReading } from '@/features/sessions/components/connection-reading';
import {
  CoachControls,
  ConsentPanel,
  LeaveControl,
} from '@/features/sessions/components/lobby-controls';
import { ParticipantGrid } from '@/features/sessions/components/participant-grid';
import { useSessionAction } from '@/features/sessions/hooks/use-session-action';
import { useSessionLive } from '@/features/sessions/hooks/use-session-live';
import { lobbyRows, selfParticipant, startGate } from '@/features/sessions/lobby';
import type { Session, TeamMember } from '@/types/api';
import styles from './session-lobby.module.css';

export interface SessionLobbyProps {
  session: Session;
  /** The team roster, so a Member who has not joined still gets a row. */
  members: TeamMember[];
  selfId: number | null;
  /** Start and cancel. A Capability hides a control and never grants one. */
  canRunSession: boolean;
  /** The Team Settings module, composed in at the app layer — a feature may not
   *  import another feature (conventions.md). */
  settings?: ReactNode;
}

/** The lobby: who is here, who has agreed, and the one control that starts the
 *  Session. One Screen for both drawn Screens — the design's own note says 09 is
 *  08 with the Consent panel replaced by Start recording. */
export function SessionLobby({
  session,
  members,
  selfId,
  canRunSession,
  settings,
}: SessionLobbyProps) {
  const sessionId = session.id;

  useSessionLive(sessionId);
  const join = useArrivalJoin(sessionId);

  const rows = lobbyRows(session, members, selfId);
  const gate = startGate(rows);
  const self = selfParticipant(session, selfId);

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        <SectionHeader
          as="h1"
          eyebrow="Session lobby"
          index={session.session_code ?? undefined}
          title={session.session_name}
        />
        {/* The gate, not the roster: a rostered player who never joined does
            not block `Session::start()`, so counting them would tell a Coach
            they cannot start when they can. */}
        <figure className={styles.counter} aria-label="Players ready">
          <figcaption className={styles.counterLabel}>PLAYERS READY</figcaption>
          <span className={styles.counterValue}>
            {gate.ready} <span className={styles.counterTotal}>/ {gate.joined}</span>
          </span>
        </figure>
      </header>

      <div className={styles.columns}>
        <section className={styles.main}>
          <div className={styles.mainHead}>
            <span className={styles.mainTitle}>Participants</span>
            <ConnectionReading />
          </div>

          {join.error ? (
            <p className={styles.error} role="alert">
              {join.error.message}
            </p>
          ) : null}

          <ParticipantGrid rows={rows} />

          <div className={styles.notice}>
            <span className={styles.noticeHead}>
              <span className={styles.noticeMark} aria-hidden="true" />
              {canRunSession ? 'Lobby open' : 'Waiting for the coach to start recording'}
            </span>
            <span className={styles.noticeBody}>
              {canRunSession
                ? 'Players join and agree until you start. Nothing is captured before then.'
                : 'Your track opens the moment the coach starts. Nothing is captured before then.'}
            </span>
          </div>
        </section>

        <aside className={styles.rail}>
          {canRunSession ? <CoachControls sessionId={sessionId} gate={gate} /> : null}

          {/* A Coach has nothing to agree to, so the panel is absent rather than
              inert. Nor is it drawn before the join lands. */}
          {!canRunSession && self ? (
            <ConsentPanel sessionId={sessionId} granted={self.participant_status !== 'needs_consent'} />
          ) : null}

          {settings}

          {self ? <LeaveControl sessionId={sessionId} /> : null}
        </aside>
      </div>
    </div>
  );
}

/** Arriving joins you: the endpoint is idempotent and the design draws no join
 *  control. Guarded by a ref rather than by the refetch it triggers, so the
 *  invalidation it causes cannot ask again. */
function useArrivalJoin(sessionId: number) {
  const asked = useRef<number | null>(null);
  const join = useSessionAction(joinSession);
  const { mutate } = join;

  useEffect(() => {
    if (asked.current === sessionId) return;
    asked.current = sessionId;
    mutate(sessionId);
  }, [mutate, sessionId]);

  return join;
}
