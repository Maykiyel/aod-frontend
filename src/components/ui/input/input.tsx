import { useId } from 'react';
import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import styles from './input.module.css';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  /** Uppercase field label. */
  label?: string;
  /** Trailing unit text rendered outside the field, e.g. 'seconds of dead air'. */
  unit?: string;
  /** Render the value in the mono face — use for anything measured. */
  mono?: boolean;
  /** Fixed field width, e.g. '88px'. Defaults to full width. */
  width?: string;
}

/** Recessed E0 field. Label wired with `useId` — upstream left it unassociated,
 *  breaking accessible-name queries. `unit` announced via aria-describedby;
 *  `width` is a custom property, since ADR 0002 rejects inline styles. */
export function Input({
  label,
  unit,
  mono = false,
  width,
  id,
  className,
  style,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const unitId = `${inputId}-unit`;
  const describedBy = [ariaDescribedBy, unit ? unitId : null].filter(Boolean).join(' ');

  const field = (
    <input
      {...rest}
      id={inputId}
      aria-describedby={describedBy || undefined}
      className={cx(styles.field, mono ? styles.mono : null, className)}
      style={width ? ({ ...style, '--field-width': width } as CSSProperties) : style}
    />
  );

  return (
    <div>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      {unit ? (
        <div className={styles.row}>
          {field}
          <span className={styles.unit} id={unitId}>
            {unit}
          </span>
        </div>
      ) : (
        field
      )}
    </div>
  );
}
