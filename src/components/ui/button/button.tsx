import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'live';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** primary = the only solid red fill; secondary = clipped bottom-right corner;
   *  ghost = text only; live = cyan hairline, for live or syncing actions only —
   *  never a second accent. */
  variant?: ButtonVariant;
  /** Leading icon node, 13-16px. */
  icon?: ReactNode;
}

/** Action control. Four variants, radius 0, mono uppercase label, one primary per
 *  view. Keeps a variant prop against `patterns-explicit-variants`: the design
 *  system fixes the set at four named variants and addresses them by name, so the
 *  union maps 1:1 onto the vocabulary. Per CLAUDE.md, the design system wins. */
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
