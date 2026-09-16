import { useState } from 'react';
import { useNavigate } from 'react-router';
import { RailPanel } from '@/components/rail-panel/rail-panel';
import { Button } from '@/components/ui/button/button';
import { Icon } from '@/components/ui/icon/icon';
import {
  cancelSession,
  leaveSession,
  recordConsent,
  startSession,
} from '@/features/sessions/api/session-actions';
import { useSessionAction } from '@/features/sessions/hooks/use-session-action';
import type { StartGate } from '@/features/sessions/lobby';
import styles from './lobby-controls.module.css';

const CONSENT_COPY =
  'Your mic and screen are recorded for this session. Your coach and teammates can review the recording afterwards.';

/** Asked once per Session, and not withdrawable: `participant_status` only moves
 *  forward and there is no withdraw endpoint, so the design's "withdraw any time
 *  before start" is dropped. Leaving the Session is the way out. */
export function ConsentPanel({ sessionId, granted }: { sessionId: number; granted: boolean }) {
  const [agreed, setAgreed] = useState(false);
  const consent = useSessionAction(recordConsent);

  return (
    <RailPanel title="Consent">
      <p className={styles.lede}>{CONSENT_COPY}</p>

      {granted ? (
        <p className={styles.granted}>CONSENT GRANTED</p>
      ) : (
        <>
          <label className={styles.agree}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>I consent to my mic and screen being recorded for this session</span>
          </label>

          <Button
            disabled={!agreed || consent.isPending}
            onClick={() => consent.mutate(sessionId)}
          >
            Accept &amp; continue
          </Button>

          <span className={styles.micro}>CONSENT REQUIRED BEFORE YOUR TRACK OPENS</span>
        </>
      )}

      {consent.error ? (
        <p className={styles.error} role="alert">
          {consent.error.message}
        </p>
      ) : null}
    </RailPanel>
  );
}

/** Start and cancel. The gate is decided from the participant list, so the
 *  reason is named before the server is asked — and the server's own 422 is
 *  still drawn as a message, because two coaches racing both need an answer. */
export function CoachControls({ sessionId, gate }: { sessionId: number; gate: StartGate }) {
  const start = useSessionAction(startSession);
  const cancel = useSessionAction(cancelSession);
  const busy = start.isPending || cancel.isPending;

  return (
    <RailPanel title="Start recording">
      <p className={styles.lede}>All ready tracks open on one clock.</p>

      <Button
        icon={<Icon name="play" size={13} />}
        disabled={!gate.canStart || busy}
        onClick={() => start.mutate(sessionId)}
      >
        Start recording
      </Button>

      {gate.reason ? <p className={styles.withheld}>{gate.reason}</p> : null}

      {start.error ? (
        <p className={styles.error} role="alert">
          {start.error.message}
        </p>
      ) : null}

      <div className={styles.secondary}>
        <Button variant="secondary" disabled={busy} onClick={() => cancel.mutate(sessionId)}>
          Cancel session
        </Button>
      </div>

      {cancel.error ? (
        <p className={styles.error} role="alert">
          {cancel.error.message}
        </p>
      ) : null}
    </RailPanel>
  );
}

/** The way out of a lobby, and the domain's only way out of consent. It ends the
 *  Screen too: arriving is what joins, so staying would be a dead end. Coming
 *  back asks a player to agree again, because the server resets them. */
export function LeaveControl({ sessionId }: { sessionId: number }) {
  const navigate = useNavigate();
  const leave = useSessionAction(leaveSession, () => navigate('/sessions'));

  return (
    <div className={styles.leave}>
      <Button variant="ghost" disabled={leave.isPending} onClick={() => leave.mutate(sessionId)}>
        Leave session
      </Button>
      {leave.error ? (
        <p className={styles.error} role="alert">
          {leave.error.message}
        </p>
      ) : null}
    </div>
  );
}
