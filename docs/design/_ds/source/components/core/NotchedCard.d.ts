import * as React from 'react';

/**
 * The flagged-item card: a stepped notch cut from its top-left corner, badge
 * nested in the clearance.
 *
 * @startingPoint section="Foundations" subtitle="Signature notched card with badge" viewport="700x240"
 */
export interface NotchedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content of the circular badge sitting in the notch — an icon or a diamond. */
  badge?: React.ReactNode;
  /** Elevation rung. Only 2 or 3 are legal here. Default 3. */
  level?: 2 | 3;
  /** CSS padding. Must clear the notch at the top. */
  padding?: string;
  /** Badge diameter. Default var(--notch-badge-size). */
  badgeSize?: string;
  /** Fixed height is often needed since the mask stretches with the box. */
  style?: React.CSSProperties;
}

export declare function NotchedCard(props: NotchedCardProps): JSX.Element;
