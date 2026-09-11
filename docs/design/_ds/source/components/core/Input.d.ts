import * as React from 'react';

/**
 * Recessed text or number field with an uppercase label.
 *
 * @startingPoint section="Controls" subtitle="Recessed E0 form fields" viewport="700x170"
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Uppercase field label. */
  label?: string;
  /** Trailing unit text rendered outside the field, e.g. 'seconds of dead air'. */
  unit?: string;
  /** Set the value in the mono face — use for anything measured. Default false. */
  mono?: boolean;
  /** Fixed field width, e.g. '88px'. Defaults to full width. */
  width?: string;
}

export declare function Input(props: InputProps): JSX.Element;
