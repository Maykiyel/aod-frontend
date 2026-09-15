import { useId } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import type { InputProps } from '@/components/ui/input/input';
import styles from './enrolment-form.module.css';

/** The pieces screens 03–05 compose. Each is a slot or a field, never a mode —
 *  the three screens differ by what they put in, not by a prop. */

export interface FieldProps extends InputProps {
  /** A server's objection to this field, shown under it and announced as the
   *  input's description rather than as a banner about the whole form. */
  error?: string;
}

export function Field({ error, id, ...rest }: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={styles.field}>
      <Input
        {...rest}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p className={styles.fieldError} id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Fields({ children }: { children: ReactNode }) {
  return <div className={styles.fields}>{children}</div>;
}

/** A failure that belongs to no single field — a dropped request, or a rejection
 *  naming nothing the user can point at. */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className={styles.formError} role="alert">
      {children}
    </p>
  );
}

/** The privacy document names this as the enforcement point for the product's
 *  no-under-18 commitment, so it gates submission rather than merely appearing. */
export function AgeAttestation({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={styles.attestation}>
      <input
        type="checkbox"
        className={styles.attestationBox}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        required
      />
      I confirm I am 18 years of age or older. Accounts are limited to users 18 and over.
    </label>
  );
}

export function FormActions({
  submitLabel,
  pending,
  onBack,
}: {
  submitLabel: string;
  pending: boolean;
  onBack?: () => void;
}) {
  return (
    <div className={styles.actions}>
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
      {onBack ? (
        <button type="button" className={styles.back} onClick={onBack} disabled={pending}>
          Back
        </button>
      ) : null}
    </div>
  );
}

/** The Terms and Privacy documents are out of scope for #4 and have no routes
 *  yet, so they are named rather than linked — a link would bounce off the
 *  catch-all. #31: link to them only where they resolve. */
export function LegalNotice() {
  return (
    <div className={styles.legal}>
      <span>By continuing, you agree to our Terms of Service and Privacy Policy.</span>
      <span>
        Already have an account?{' '}
        <Link className={styles.legalLink} to="/login">
          Login
        </Link>
      </span>
    </div>
  );
}

export function Notice({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.notice}>
      <span className={styles.noticeLabel}>{label}</span>
      {children}
    </div>
  );
}

export function NoticeRow({ children }: { children: ReactNode }) {
  return <div className={styles.noticeRow}>{children}</div>;
}

export function NoticeReading({ children }: { children: ReactNode }) {
  return <span className={styles.noticeReading}>{children}</span>;
}
