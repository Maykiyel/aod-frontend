import { isRouteErrorResponse, Outlet, useRouteError } from 'react-router';
import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import { InlineError } from '@/components/states/inline-error/inline-error';
import styles from './root-layout.module.css';

/** The router's own root. Nothing renders here — it exists to hang the hydrate
 *  fallback and the outermost error boundary on. */
export function RootLayout() {
  return <Outlet />;
}

/** Shown while the router's first navigation resolves, which is where the stored
 *  token is proved. Replaces the in-tree `checking` branch the guards needed. */
export function SessionFallback() {
  return (
    <div className={styles.fallback} role="status">
      AUTHENTICATING
    </div>
  );
}

/** Read whatever a boundary caught into one line a person can act on. */
function messageFor(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  return error instanceof Error ? error.message : 'Something went wrong.';
}

/** Last resort: a failure that escaped every boundary below, including one
 *  thrown before the App Shell could render. */
export function RootErrorBoundary() {
  const error = useRouteError();

  return (
    <div className={styles.boundary}>
      <InlineError
        message={messageFor(error)}
        onRetry={() => window.location.reload()}
        label="Application error"
      />
    </div>
  );
}

/** The same treatment inside the shell, so the sidebar survives a screen that
 *  fails — route-level isolation is the point of having two boundaries. */
export function AppErrorBoundary() {
  const error = useRouteError();

  return <InlineError message={messageFor(error)} onRetry={() => window.location.reload()} />;
}

/** An address that names nothing. Deliberate, rather than the old catch-all
 *  redirect that sent every typo to the dashboard. */
export function NotFoundRoute() {
  return (
    <div className={styles.boundary}>
      <EmptyState eyebrow="Not found" title="No such page" reading="HTTP:404">
        <EmptyStateInstruction>
          This address does not name a screen. Check the link, or go back to the dashboard.
        </EmptyStateInstruction>
      </EmptyState>
    </div>
  );
}
