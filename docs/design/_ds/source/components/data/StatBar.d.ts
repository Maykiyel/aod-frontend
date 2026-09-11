import * as React from 'react';

/**
 * Skewed stat bar — one rectangle, diagonal seam, recessed label, solid value.
 *
 * @startingPoint section="Data" subtitle="Skewed metric bars" viewport="700x190"
 */
export interface StatBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase mono metric name, e.g. 'COMM FREQUENCY'. */
  label: string;
  /** The reading. Display face, right-aligned. */
  value: React.ReactNode;
  /** Small mono unit after the value, e.g. '/min', 'gaps'. */
  unit?: string;
  /** Value-half fill. Only one bar in a group may be red. Default 'white'. */
  fill?: 'red' | 'white' | 'aligned';
  /** Bar height in px. Default 44. */
  height?: number;
  /** Width of the value half in px. Default 150. */
  valueWidth?: number;
  /** Diagonal seam width. Use var(--clip-statbar-skew-compact) in narrow rails. */
  skew?: string;
}

export declare function StatBar(props: StatBarProps): JSX.Element;
