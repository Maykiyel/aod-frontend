import * as React from 'react';

export interface TimelineMarker {
  /** CSS left offset within the lane, e.g. '42%'. */
  at: string;
  /** Comm type. Colour is fixed by the data model. */
  type: 'informative' | 'declarative' | 'compound' | 'event';
}

/**
 * One lane of the canonical timeline.
 *
 * @startingPoint section="Data" subtitle="Timeline lanes with markers and absence" viewport="700x220"
 */
export interface TimelineTrackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mono lane label, e.g. 'PA_WALKER'. */
  label: string;
  /** Diamond markers along the lane. */
  markers?: TimelineMarker[];
  /** A measured dead-air interval. Always hatched, never a solid fill. */
  absence?: { from: string; width: string };
  /** The one selected marker, drawn larger with a halo. */
  selectedAt?: TimelineMarker;
  /** Label column width. The playhead must be clipped to start after this. */
  labelWidth?: string;
  /** Row height. Default var(--size-track-row). */
  height?: string;
}

export declare function TimelineTrack(props: TimelineTrackProps): JSX.Element;
