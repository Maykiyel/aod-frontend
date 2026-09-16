import { HexSlot } from '@/components/ui/hex-slot/hex-slot';
import type { HexSlotState } from '@/components/ui/hex-slot/hex-slot';
import { Surface } from '@/components/ui/surface/surface';
import { ConnectionReading } from '@/features/sessions/components/connection-reading';
import { initialsOf } from '@/features/sessions/lobby';
import { CAPTURE_LABELS, deliveryLabel } from '@/features/sessions/recording';
import type { CaptureReading, CaptureRow } from '@/features/sessions/recording';
import styles from './capture-table.module.css';

/** Slot state and accent per reading, in one table rather than two that have to
 *  be kept in step. */
const READING_STYLE: Record<CaptureReading, { slot: HexSlotState; tone: string }> = {
  capturing: { slot: 'active', tone: 'capturing' },
  'not-capturing': { slot: 'idle', tone: 'waiting' },
  'not-agreed': { slot: 'idle', tone: 'waiting' },
  'not-joined': { slot: 'offline', tone: 'absent' },
};

/** Who is actually capturing and who has actually delivered. Both columns read
 *  `participant_status` and Delivery State off the Session, which broadcast on
 *  every change; the design's per-player MIC and WINDOW columns are dropped
 *  because no endpoint or broadcast carries device state (spec #40). */
export function CaptureTable({
  rows,
  sessionStatus,
}: {
  rows: CaptureRow[];
  sessionStatus: string;
}) {
  return (
    <Surface level={2} behind="var(--void)" padding="0" className={styles.plate}>
      <div className={styles.head}>
        <span className={styles.title}>Capture status</span>
        <ConnectionReading />
      </div>

      <div className={styles.columns} aria-hidden="true">
        <span className={styles.column}>PLAYER</span>
        <span className={styles.column} data-align="right">
          CAPTURE
        </span>
        <span className={styles.column} data-align="right">
          DELIVERED
        </span>
      </div>

      <ul className={styles.rows} aria-label="Capture status">
        {rows.map((row) => (
          <li key={row.userId} className={styles.row} data-tone={READING_STYLE[row.capture].tone}>
            <div className={styles.identity}>
              <HexSlot
                initials={initialsOf(row.username)}
                state={READING_STYLE[row.capture].slot}
                width={34}
                height={38}
              />
              <span className={styles.names}>
                <span className={styles.name}>{row.username}</span>
                <span className={styles.role}>{row.isSelf ? 'PLAYER — YOU' : 'PLAYER'}</span>
              </span>
            </div>

            <span className={styles.capture}>{CAPTURE_LABELS[row.capture]}</span>
            <span className={styles.delivery}>{deliveryLabel(row, sessionStatus)}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
