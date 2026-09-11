import * as React from 'react';

/**
 * Hexagonal player slot — the product's only avatar form.
 *
 * @startingPoint section="Data" subtitle="Hex role slots, three states" viewport="700x150"
 */
export interface HexSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Two-character player key, e.g. 'PA'. */
  initials: string;
  /** Short uppercase role, e.g. 'IGL', 'DUEL'. */
  role?: string;
  /** active = solid red; idle = steel; offline = void with dim label. Default 'idle'. */
  state?: 'active' | 'idle' | 'offline';
  /** Slot width in px. Default 62 (34 in headers). */
  width?: number;
  /** Slot height in px. Default 70 (38 in headers). */
  height?: number;
}

export declare function HexSlot(props: HexSlotProps): JSX.Element;
