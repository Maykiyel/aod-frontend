import * as React from 'react';

/**
 * The closed icon set. 24px grid, 2px stroke, square caps.
 *
 * @startingPoint section="Foundations" subtitle="The closed machined icon set" viewport="700x150"
 */
export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /** Glyph name. The set is closed — do not introduce new names without adding them here. */
  name?:
    | 'sync' | 'target' | 'add' | 'aperture' | 'split' | 'close' | 'tracks'
    | 'burst' | 'frame' | 'lens' | 'role' | 'feed' | 'filter' | 'play' | 'flagAdd';
  /** Rendered size in px. Default 24. */
  size?: number;
  /** Stroke/fill colour. Default currentColor. */
  color?: string;
}

export declare function Icon(props: IconProps): JSX.Element;
