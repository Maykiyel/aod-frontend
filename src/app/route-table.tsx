import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { RequireAnonymous, RequireAuth } from '@/app/routes/guards';
import { DashboardRoute } from '@/app/routes/dashboard';
import { LoginRoute } from '@/app/routes/login';

/**
 * The route table, exported so tests can mount it in a memory router at a
 * chosen path. That is the seam #14 commits to: a test drives the real routes,
 * the real providers and the real HTTP client, with only the network mocked.
 */
export const routes: RouteObject[] = [
  {
    element: <RequireAnonymous />,
    children: [{ path: '/login', element: <LoginRoute /> }],
  },
  {
    element: <RequireAuth />,
    children: [{ path: '/', element: <DashboardRoute /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
