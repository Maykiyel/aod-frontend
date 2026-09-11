import * as React from 'react';

/** Square icon-only control for toolbars and transports. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required, since there is no visible text. */
  label: string;
  /** Filled red when true. Default false. */
  active?: boolean;
  /** Edge length in px. Default 34. Use 44 for touch targets. */
  size?: number;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
