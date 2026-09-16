import { useEffect, useState } from 'react';
import { HexSlot } from '@/components/ui/hex-slot/hex-slot';
import type { HexSlotState } from '@/components/ui/hex-slot/hex-slot';
import { Surface } from '@/components/ui/surface/surface';
import { initialsOf, READING_LABELS } from '@/features/sessions/lobby';
import type { LobbyRow, ParticipantReading } from '@/features/sessions/lobby';
import { cx } from '@/utils/cx';
import styles from './participant-grid.module.css';

/** Slot state and accent colour per reading, in one table rather than two that
 *  have to be kept in step. */
const READING_STYLE: Record<ParticipantReading, { slot: HexSlotState; className: string }> = {
  ready: { slot: 'active', className: styles.ready },
  'needs-consent': { slot: 'idle', className: styles.waiting },
  'not-joined': { slot: 'offline', className: styles.absent },
};

/** How long a departing row is held. Matches the enter animation. */
const EXIT_MS = 200;

/** Every Team Member, joined or not, plus anyone in the Session who is no longer
 *  on the roster. A Coach needs the absent rows to know who is still missing. */
export function ParticipantGrid({ rows }: { rows: LobbyRow[] }) {
  const drawn = useDeparting(rows);

  return (
    <ul className={styles.grid} aria-label="Participants">
      {drawn.map(({ row, departing }) => (
        <ParticipantCard key={row.userId} row={row} departing={departing} />
      ))}
    </ul>
  );
}

interface DrawnRow {
  row: LobbyRow;
  departing: boolean;
}

/** A row that genuinely disappears — someone in the Session who is not on the
 *  roster — is held for one animation rather than popping out. A rostered member
 *  who leaves keeps their row and changes its reading, which animates in place. */
function useDeparting(rows: LobbyRow[]): DrawnRow[] {
  const [held, setHeld] = useState<{ rows: LobbyRow[]; departing: LobbyRow[] }>({
    rows,
    departing: [],
  });

  // Adjusted during render rather than in an effect: an effect would commit one
  // frame with the row already gone, which flickers instead of animating.
  if (held.rows !== rows) {
    const present = new Set(rows.map((row) => row.userId));
    const kept = held.departing.filter((row) => !present.has(row.userId));
    const gone = held.rows.filter((row) => !present.has(row.userId));
    setHeld({ rows, departing: [...kept, ...gone] });
  }

  useEffect(() => {
    if (held.departing.length === 0) return;
    const timer = setTimeout(() => setHeld((current) => ({ ...current, departing: [] })), EXIT_MS);
    return () => clearTimeout(timer);
  }, [held.departing]);

  return [
    ...rows.map((row) => ({ row, departing: false })),
    ...held.departing.map((row) => ({ row, departing: true })),
  ];
}

function ParticipantCard({ row, departing }: { row: LobbyRow; departing: boolean }) {
  const role = row.isCoach ? 'COACH' : 'PLAYER';
  const style = READING_STYLE[row.reading];

  return (
    <li
      className={cx(styles.row, style.className, departing ? styles.departing : null)}
      aria-hidden={departing || undefined}
    >
      <Surface level={2} behind="var(--void)" padding="var(--space-5)" className={styles.card}>
        <div className={styles.accent}>
          <div className={styles.identity}>
            <HexSlot
              initials={initialsOf(row.username)}
              state={style.slot}
              width={40}
              height={45}
            />
            <span className={styles.names}>
              <span className={styles.name}>{row.username}</span>
              <span className={styles.role}>{row.isSelf ? `${role} — YOU` : role}</span>
            </span>
          </div>

          {/* Keyed on the reading so a row that changes state replays the
              animation rather than swapping text in place. */}
          <div key={row.reading} className={styles.status}>
            <span className={styles.mark} aria-hidden="true" />
            <span className={styles.reading}>{READING_LABELS[row.reading]}</span>
          </div>
        </div>
      </Surface>
    </li>
  );
}
