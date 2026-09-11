import { useId } from 'react';
import type { ComponentPropsWithRef } from 'react';
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

/**
 * Recessed text or number field with an uppercase label. Always E0 — an input
 * that floats above the plate contradicts the elevation system.
 *
 * Two departures from the vendored source, both deliberate:
 *
 * 1. The label is associated with the field via `useId`. Upstream rendered a
 *    bare <label> with no `htmlFor` and no `id` on the input, so the two were
 *    never connected. The spec's test seam finds controls by accessible name,
 *    which that shape cannot satisfy — and a screen reader announced the field
 *    as unlabelled.
 * 2. `unit` is wired as `aria-describedby`, so the trailing text is announced
 *    with the field rather than stranded beside it.
 *
 * `mono` is kept as the boolean the design system documents, against
 * `architecture-avoid-boolean-props`. It selects a type face, not a structure,
 * and seventeen screens are written against this name. Per CLAUDE.md the design
 * system wins; the rule is aimed at booleans that change what renders.
 */
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
      className={[styles.field, mono ? styles.mono : null, className]
        .filter(Boolean)
        .join(' ')}
      style={width ? { ...style, width } : style}
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
