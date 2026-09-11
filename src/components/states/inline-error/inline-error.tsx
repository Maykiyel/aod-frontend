import { Button } from '@/components/ui/button/button';
import { Surface } from '@/components/ui/surface/surface';
import styles from './inline-error.module.css';

export interface InlineErrorProps {
  /** Server-authored wherever the server supplied one, and shown rather than
   *  replaced — `message` in the envelope is written for the user (#14). */
  message: string;
  /** Omitted when there is nothing useful to retry. */
  onRetry?: () => void;
  /** Mono kicker. Default 'Error'. */
  label?: string;
}

/**
 * The error treatment: an instrument reading in the signal red, never a browser
 * alert (#14). E2 on the void, the same rung as the content it replaces.
 */
export function InlineError({ message, onRetry, label = 'Error' }: InlineErrorProps) {
  return (
    <Surface level={2} behind="var(--void)" className={styles.error} role="alert">
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <p className={styles.message}>{message}</p>
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    </Surface>
  );
}
