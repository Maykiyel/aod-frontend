import { useId } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './stat-bar.module.css';

/** Value-half fill. Only one bar in a group may be red; `aligned` is for a
 *  genuinely positive reading. */
export type StatBarFill = 'red' | 'white' | 'aligned';

export interface StatBarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Uppercase mono metric name, e.g. 'COMM FREQUENCY'. */
  label: string;
  /** The reading. Display face, right-aligned. */
  value: ReactNode;
  /** Small mono unit after the value, e.g. '/min', 'calls'. */
  unit?: string;
  /** Default 'white'. */
  fill?: StatBarFill;
  /** Bar height in px. Default 44. */
  height?: number;
  /** Width of the value half in px. Default 150. */
  valueWidth?: number;
  /** Diagonal seam width. Use var(--clip-statbar-skew-compact) in narrow rails. */
  skew?: string;
}

const FILL_CLASS: Record<StatBarFill, string> = {
  red: styles.red,
  white: styles.white,
  aligned: styles.aligned,
};

/**
 * One rectangle split by a diagonal seam: recessed label on the left, solid
 * value on the right. A figure rather than the source's bare div — a readout is
 * a figure, and its caption is what names it.
 */
export function StatBar({
  label,
  value,
  unit,
  fill = 'white',
  height = 44,
  valueWidth = 150,
  skew = 'var(--clip-statbar-skew)',
  className,
  style,
  ...rest
}: StatBarProps) {
  // A figcaption names its figure by spec, but not in every accessibility-name
  // implementation, so the figure points at it rather than relying on that.
  const captionId = useId();

  const barStyle = {
    ...style,
    '--stat-bar-height': `${height}px`,
    '--stat-bar-value-width': `${valueWidth}px`,
    '--stat-bar-skew': skew,
  } as CSSProperties;

  return (
    <figure
      {...rest}
      aria-labelledby={captionId}
      className={cx(styles.bar, FILL_CLASS[fill], className)}
      style={barStyle}
    >
      <figcaption id={captionId} className={styles.label}>
        {label}
      </figcaption>
      <span className={styles.value}>
        {value}
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </span>
    </figure>
  );
}
