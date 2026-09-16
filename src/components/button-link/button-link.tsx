import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { LinkProps } from 'react-router';
import type { ButtonVariant } from '@/components/ui/button/button';
import { cx } from '@/utils/cx';
import styles from '@/components/ui/button/button.module.css';

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  /** Leading icon node, 13-16px. */
  icon?: ReactNode;
}

/** A destination drawn as a Button — the reference's `Open session`. A `button`
 *  inside an `a` is invalid, so this takes the Button's own styles rather than a
 *  second copy of them; the primitive stays router-free, as `NavItem` does. */
export function ButtonLink({
  variant = 'secondary',
  icon,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link {...rest} className={cx(styles.button, styles[variant], className)}>
      {icon}
      {children ? <span>{children}</span> : null}
    </Link>
  );
}
