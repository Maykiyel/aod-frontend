import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import styles from './guards.module.css';

function RouteFallback() {
  return (
    <div className={styles.fallback} role="status">
      AUTHENTICATING
    </div>
  );
}

/** Reads the path a redirect-to-login came from, if there was one. */
function useRedirectTarget(): string {
  const location = useLocation();
  const state = location.state as { from?: { pathname?: string } } | null;
  return state?.from?.pathname ?? '/';
}

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <RouteFallback />;
  if (status === 'anonymous') {
    // Carry the attempted path so a deep link survives the detour.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireAnonymous() {
  const { status } = useAuth();
  const target = useRedirectTarget();

  if (status === 'checking') return <RouteFallback />;
  // Also the post-login redirect: signing in flips status, and this sends the
  // user onward without the form needing to navigate for itself.
  if (status === 'authenticated') return <Navigate to={target} replace />;
  return <Outlet />;
}

/**
 * The route table, exported so tests can mount it in a memory router at a
 * chosen path. That is the seam #14 commits to: a test drives the real routes,
 * the real providers and the real HTTP client, with only the network mocked.
 */
