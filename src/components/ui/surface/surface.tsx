import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './surface.module.css';

/**
 * Elevation rung. A union rather than `number`, so an illegal level fails to
 * compile and autocomplete lists what is legal — the spec in #14 asks for this
 * explicitly.
 */
export type ElevationLevel = 0 | 1 | 2 | 3 | 4;

/** Elements a plate is ever rendered as. Deliberately narrow. */
type SurfaceElement = 'div' | 'section' | 'aside' | 'main' | 'article' | 'header' | 'footer' | 'nav';

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  /** 0 recessed, 1 structure, 2 module, 3 raised, 4 overlay. Default 2. */
  level?: ElevationLevel;
  /**
   * Override the groove count. Leave unset — the count equals the level by
   * design. Pass 0 only for a plate too small to carry slots (under ~120px).
   */
  grooves?: number;
  /** Colour showing through the groove slots: the surface this one sits on. */
  behind?: string;
  /** CSS padding. Default var(--space-6). */
  padding?: string;
  as?: SurfaceElement;
  children?: ReactNode;
}

const LEVEL_CLASS: Record<ElevationLevel, string> = {
  0: styles.e0,
  1: styles.e1,
  2: styles.e2,
  3: styles.e3,
  4: styles.e4,
};

/**
 * The base plate: one rung of the elevation ladder plus the matching run of
 * edge grooves on its top edge. The only correct way to place something on the
 * ladder.
 *
 * Groove count is derived from `level` and is not a styling choice — the design
 * system fixes the relationship, so `grooves` exists only for plates too narrow
 * to carry slots.
 *
 * The grooves are real DOM nodes rather than pseudo-elements because the count
 * runs 0–4 and `::before`/`::after` give only two. `behind` and `padding` arrive
 * as custom properties so the stylesheet keeps every declaration (ADR 0002).
 */
export function Surface({
  level = 2,
  grooves,
  behind = 'var(--void)',
  padding,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const count = grooves ?? level;

  const surfaceStyle = {
    ...style,
    '--surface-behind': behind,
    ...(padding === undefined ? {} : { '--surface-padding': padding }),
  } as CSSProperties;

  return (
    <Tag {...rest} className={cx(styles.surface, LEVEL_CLASS[level], className)} style={surfaceStyle}>
      {count > 0 ? (
        <div className={styles.grooves} aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <span key={index} className={styles.groove} />
          ))}
        </div>
      ) : null}
      {children}
    </Tag>
  );
}
