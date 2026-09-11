import * as React from 'react';

/**
 * A note pinned to a moment in the timeline.
 *
 * @startingPoint section="Data" subtitle="Review annotation, rest and selected" viewport="700x200"
 */
export interface AnnotationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Who wrote it, e.g. 'Coach Vela'. */
  author: string;
  /** Mono timestamp, e.g. '14:22'. */
  timestamp: string;
  /** The note text. */
  body: string;
  /** Promote to E3 when this note is the active one. Default false. */
  selected?: boolean;
}

export declare function AnnotationCard(props: AnnotationCardProps): JSX.Element;
