import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { DashboardRoute } from '@/app/routes/dashboard';
import { LoginRoute } from '@/app/routes/login';
import styles from './router.module.css';

/**
 * Shown only while a stored token is being proved. Deliberately not the
 * designed skeleton — the three state treatments are #2's, and this is the
 * sub-second gap before the first route decision can be made honestly.
 */
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

function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <RouteFallback />;
  if (status === 'anonymous') {
    // Carry the attempted path so a deep link survives the detour.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

function RequireAnonymous() {
  const { status } = useAuth();
  const target = useRedirectTarget();

  if (status === 'checking') return <RouteFallback />;
  // Also the post-login redirect: signing in flips status, and this sends the
  // user onward without the form needing to navigate for itself.
  if (status === 'authenticated') return <Navigate to={target} replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RequireAnonymous />,
    children: [{ path: '/login', element: <LoginRoute /> }],
  },
  {
    element: <RequireAuth />,
    children: [{ path: '/', element: <DashboardRoute /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
