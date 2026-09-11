import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './hex-slot.module.css';

/** active = solid red; idle = steel; offline = void with a dim label. */
export type HexSlotState = 'active' | 'idle' | 'offline';

export interface HexSlotProps extends HTMLAttributes<HTMLDivElement> {
  /** Two-character player key, e.g. 'PA'. */
  initials: string;
  /** Short uppercase role, e.g. 'IGL', 'DUEL'. */
  role?: string;
  /** Default 'idle'. */
  state?: HexSlotState;
  /** Slot width in px. Default 62 (34 in headers). */
  width?: number;
  /** Slot height in px. Default 70 (38 in headers). */
  height?: number;
}

const STATE_CLASS: Record<HexSlotState, string> = {
  active: styles.active,
  idle: styles.idle,
  offline: styles.offline,
};

/** Hexagonal player slot — the product's only avatar form. */
export function HexSlot({
  initials,
  role,
  state = 'idle',
  width = 62,
  height = 70,
  className,
  style,
  ...rest
}: HexSlotProps) {
  const slotStyle = {
    ...style,
    '--hex-width': `${width}px`,
    '--hex-height': `${height}px`,
  } as CSSProperties;

  return (
    <div {...rest} className={cx(styles.slot, STATE_CLASS[state], className)} style={slotStyle}>
      <span className={styles.initials}>{initials}</span>
      {role ? <span className={styles.role}>{role}</span> : null}
    </div>
  );
}
