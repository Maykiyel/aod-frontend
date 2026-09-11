import * as React from 'react';

/** A standalone run of groove slots — page dividers and hand-placed edges. */
export interface GrooveStripProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of slots. Keep equal to the elevation level it annotates. Default 2. */
  count?: number;
  /** Colour showing through the slots. Default var(--void). */
  behind?: string;
  /** Slot border colour. Default var(--border-soft). */
  borderColor?: string;
  /** Slot width. Default var(--groove-divider-width). */
  width?: string;
  /** Slot depth. Default var(--groove-divider-depth). */
  depth?: string;
  /** Distance from the left edge to the first slot. Default '0'. */
  inset?: string;
  /** Draw the 1px rule the slots are cut into. Default false. */
  divider?: boolean;
}

export declare function GrooveStrip(props: GrooveStripProps): JSX.Element;
