import * as React from 'react';

/**
 * Mono uppercase tag: a state or a measurement, never a decorative label.
 *
 * @startingPoint section="Controls" subtitle="State and measurement tags" viewport="700x150"
 */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Hue. Comm-type tones are fixed by the data model. Default 'neutral'. */
  tone?: 'neutral' | 'live' | 'alert' | 'aligned' | 'informative' | 'declarative' | 'compound';
  /** Show a pulsing status dot. Only for genuinely live state. Default false. */
  dot?: boolean;
}

export declare function Tag(props: TagProps): JSX.Element;
