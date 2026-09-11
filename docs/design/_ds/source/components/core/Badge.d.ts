import * as React from 'react';

/** Circular disc — the only round shape in the system besides status dots. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Diameter in px. Default 28. */
  size?: number;
  /** Accent colour for the glyph, or the fill when hollow is false. Default var(--red). */
  tone?: string;
  /** Void fill with a hairline border (true) or solid tone fill (false). Default true. */
  hollow?: boolean;
}

export declare function Badge(props: BadgeProps): JSX.Element;
