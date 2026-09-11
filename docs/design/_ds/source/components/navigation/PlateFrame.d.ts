import * as React from 'react';

/**
 * Structural panel with machined-plate texture and corner bolt dots.
 *
 * @startingPoint section="Layout" subtitle="Machined plate panel with bolts" viewport="700x230"
 */
export interface PlateFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Elevation rung. Structural chrome is usually 1. Default 1. */
  level?: 0 | 1 | 2;
  /** Which corner the plate silhouette tucks into. Default 'bottom-left'. */
  corner?: 'bottom-left' | 'bottom-right' | 'top-right';
  /** Draw the faint 1px ring over the plate. Default true. */
  ring?: boolean;
  /** CSS padding. Default var(--space-6). */
  padding?: string;
}

export declare function PlateFrame(props: PlateFrameProps): JSX.Element;
