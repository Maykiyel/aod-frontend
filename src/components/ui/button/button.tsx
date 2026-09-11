import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'live';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /**
   * primary = the only solid red fill in the system; secondary = clipped
   * bottom-right corner; ghost = text only; live = cyan hairline, reserved for
   * actions touching a live or syncing state and never used as a second accent.
   */
  variant?: ButtonVariant;
  /** Leading icon node, 13-16px. */
  icon?: ReactNode;
}

/**
 * Action control. Four variants, radius 0, mono uppercase label. One primary
 * per view.
 *
 * Departure from `patterns-explicit-variants`: the Vercel guidance would split
 * these into four components rather than take a variant prop. The design system
 * fixes the set at exactly four named variants and the design-system docs
 * address them by name (`<Button variant="live">`), so a union prop maps 1:1
 * onto the vocabulary seventeen screens are written against. Splitting it would
 * rename the system's own terms. Per CLAUDE.md, the design system wins.
 */
export function Button({
  variant = 'primary',
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(styles.button, styles[variant], className)}
    >
      {icon}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
