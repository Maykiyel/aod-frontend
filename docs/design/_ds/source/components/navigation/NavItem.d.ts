import * as React from 'react';

/** Sidebar navigation row. */
export interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 16px icon node. */
  icon?: React.ReactNode;
  /** Row label. */
  label: string;
  /** Current view. Default false. */
  active?: boolean;
}

export declare function NavItem(props: NavItemProps): JSX.Element;
