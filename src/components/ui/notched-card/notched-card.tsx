import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './notched-card.module.css';

/** Elevation rung. Only 2 and 3 are legal for a notched card. */
export type NotchedCardLevel = 2 | 3;

export interface NotchedCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The disc that nests in the notch — a `Badge`. Sized by the badge itself,
   *  so the source's `badgeSize` prop is not ported. */
  badge?: ReactNode;
  /** Default 3. */
  level?: NotchedCardLevel;
  /** CSS padding. Must clear the notch at the top. */
  padding?: string;
  children?: ReactNode;
}

const LEVEL_CLASS: Record<NotchedCardLevel, string> = {
  2: styles.e2,
  3: styles.e3,
};

/** A rectangular step cut from the top-left corner, a disc nested in the
 *  clearance. One per screen, on the flagged item. The mask clips the whole
 *  render tree, so the badge is a sibling of the panel, never a child. */
export function NotchedCard({
  badge,
  level = 3,
  padding,
  className,
  style,
  children,
  ...rest
}: NotchedCardProps) {
  const wrapperStyle = {
    ...style,
    ...(padding === undefined ? {} : { '--notch-padding': padding }),
  } as CSSProperties;

  return (
    <div {...rest} className={cx(styles.wrapper, className)} style={wrapperStyle}>
      <div className={cx(styles.panel, LEVEL_CLASS[level])}>
        {children}
      </div>
      {badge ? <div className={styles.badge}>{badge}</div> : null}
    </div>
  );
}
