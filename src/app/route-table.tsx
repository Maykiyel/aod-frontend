import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { RequireAnonymous, RequireAuth } from '@/app/routes/guards';
import { AppShell } from '@/app/layouts/app-shell';
import { DashboardRoute } from '@/app/routes/dashboard';
import { LoginRoute } from '@/app/routes/login';
import { NotBuiltRoute } from '@/app/routes/not-built';

/** The route table, exported so tests can mount it in a memory router at a chosen
 *  path. That is the seam #14 commits to. */
export const routes: RouteObject[] = [
  {
    element: <RequireAnonymous />,
    children: [{ path: '/login', element: <LoginRoute /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardRoute /> },
          // One route per concept (ADR 0007). These three are the sidebar's other
          // destinations, holding their URLs until their screens are written —
          // #6 builds Sessions; Team and Settings have no ticket yet.
          { path: '/sessions', element: <NotBuiltRoute title="Sessions" /> },
          { path: '/team', element: <NotBuiltRoute title="Team" /> },
          { path: '/settings', element: <NotBuiltRoute title="Settings" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
