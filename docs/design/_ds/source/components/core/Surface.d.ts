import * as React from 'react';

/**
 * The base plate of the system: one rung of the elevation ladder plus the
 * matching run of edge grooves on its top edge.
 *
 * @startingPoint section="Foundations" subtitle="Elevation ladder E0-E4 with grooves" viewport="700x260"
 */
export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  /** Elevation rung. 0 recessed, 1 structure, 2 module, 3 raised, 4 overlay. Default 2. */
  level?: 0 | 1 | 2 | 3 | 4;
  /** Override the groove count. Leave unset — the count should equal the level. */
  grooves?: number;
  /** Colour showing through the groove slots: the surface this one sits on. Default var(--void). */
  behind?: string;
  /** CSS padding. Default var(--space-6). */
  padding?: string;
  /** Element to render. Default 'div'. */
  as?: keyof JSX.IntrinsicElements;
}

export declare function Surface(props: SurfaceProps): JSX.Element;
