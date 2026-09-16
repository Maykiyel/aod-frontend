import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Diameter in px. Default 28. */
  size?: number;
  /** Glyph colour when hollow, fill colour when not. Default var(--red). */
  tone?: string;
  /** Void fill with a hairline (true) or a solid tone fill (false). Default true. */
  hollow?: boolean;
}

/** The disc that nests in a notch, or marks a comm type inline — the only round
 *  shape in the system besides status dots. Hollow by default so it reads as a
 *  machined boss sitting in the notch, not a sticker. */
export function Badge({
  size = 28,
  tone = 'var(--red)',
  hollow = true,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const badgeStyle = {
    ...style,
    '--badge-size': `${size}px`,
    '--badge-tone': tone,
  } as CSSProperties;

  return (
    <span
      {...rest}
      className={cx(styles.badge, hollow ? styles.hollow : styles.solid, className)}
      style={badgeStyle}
    >
      {children}
    </span>
  );
}
