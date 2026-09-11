import * as React from 'react';

/**
 * Action control. Four variants, radius 0, mono uppercase label.
 *
 * @startingPoint section="Controls" subtitle="Primary, secondary, ghost, live" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = the only solid red fill; secondary = clipped bottom-right corner; ghost = text only; live = cyan hairline for sync actions. Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'live';
  /** Leading icon node, 13-16px. */
  icon?: React.ReactNode;
}

export declare function Button(props: ButtonProps): JSX.Element;
