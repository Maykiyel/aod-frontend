import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './surface.module.css';

/** Elevation rung. A union so an illegal level fails to compile (#14). */
export type ElevationLevel = 0 | 1 | 2 | 3 | 4;

/** Surface tints from colors.css. A union so a mistyped token fails to compile —
 *  the other half of what #14 asks for alongside `level`. */
export type SubstrateToken =
  | 'var(--void)'
  | 'var(--well)'
  | 'var(--ash)'
  | 'var(--steel)'
  | 'var(--steel-2)'
  | 'var(--steel-3)';

/** Elements a plate is ever rendered as. Deliberately narrow. */
type SurfaceElement = 'div' | 'section' | 'aside' | 'main' | 'article' | 'header' | 'footer' | 'nav';

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  /** 0 recessed, 1 structure, 2 module, 3 raised, 4 overlay. Default 2. */
  level?: ElevationLevel;
  /** Override the groove count. Leave unset — it equals the level by design.
   *  Pass 0 only for a plate too narrow to carry slots (under ~120px). */
  grooves?: number;
  /** Colour showing through the groove slots: the surface this one sits on. */
  behind?: SubstrateToken;
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

/** The base plate: one elevation rung plus its matching grooves. Groove count
 *  derives from `level`, never chosen. Grooves are DOM nodes since the count runs
 *  0–4 and pseudo-elements give two; `behind`/`padding` are custom properties. */
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
