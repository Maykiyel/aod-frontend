import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './nav-item.module.css';

export interface NavItemProps extends HTMLAttributes<HTMLDivElement> {
  /** 16px icon node. */
  icon?: ReactNode;
  /** Row label. */
  label: string;
  /** Current view. Exactly one row in a sidebar is active. Default false. */
  active?: boolean;
}

/** Sidebar row. Keeps `active` as a boolean against `architecture-avoid-boolean-props`:
 *  it names one state of one row rather than a mode, and the design system's own
 *  prop API is already designed. Per CLAUDE.md, the design system wins. */
export function NavItem({ icon, label, active = false, className, ...rest }: NavItemProps) {
  return (
    <div {...rest} className={cx(styles.item, active ? styles.active : undefined, className)}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
