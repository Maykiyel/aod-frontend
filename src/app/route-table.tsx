import type { RouteObject } from 'react-router';
import { anonymousOnly, redirectIfAuthenticated, requireAuth } from '@/app/auth-middleware';
import { AppShell } from '@/app/layouts/app-shell';
import { DashboardRoute } from '@/app/routes/dashboard';
import { LoginRoute } from '@/app/routes/login';
import { loginAction } from '@/app/routes/login-action';
import { NotBuiltRoute } from '@/app/routes/not-built';
import { RegisterRoute } from '@/app/routes/register';
import { registerAction } from '@/app/routes/register-action';
import {
  AppErrorBoundary,
  NotFoundRoute,
  RootErrorBoundary,
  RootLayout,
  SessionFallback,
} from '@/app/routes/root-layout';

/** The route table, exported so tests can mount it in a memory router at a
 *  chosen path. That is the seam #14 commits to. Authentication is middleware
 *  rather than a guard component, so the decision is made before anything
 *  renders. */
export const routes: RouteObject[] = [
  {
    Component: RootLayout,
    // The first navigation is where a stored token gets proved, so the router is
    // uninitialised until it settles — this is what stands in its place.
    HydrateFallback: SessionFallback,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        path: '/login',
        Component: LoginRoute,
        action: loginAction,
        middleware: [anonymousOnly],
      },
      {
        // No `anonymousOnly` here: registering authenticates midway, and
        // middleware re-runs on the revalidation after the action. See the
        // loader's own note in auth-middleware.ts.
        path: '/register',
        Component: RegisterRoute,
        action: registerAction,
        loader: redirectIfAuthenticated,
        shouldRevalidate: () => false,
      },
      {
        middleware: [requireAuth],
        Component: AppShell,
        // Scoped here so a screen that throws keeps the sidebar around it.
        ErrorBoundary: AppErrorBoundary,
        children: [
          { index: true, Component: DashboardRoute },
          // One route per concept (ADR 0007). These three are the sidebar's other
          // destinations, holding their URLs until their screens are written —
          // #6 builds Sessions; Team and Settings have no ticket yet.
          { path: '/sessions', element: <NotBuiltRoute title="Sessions" /> },
          { path: '/team', element: <NotBuiltRoute title="Team" /> },
          { path: '/settings', element: <NotBuiltRoute title="Settings" /> },
        ],
      },
      // Outside the authenticated branch on purpose: a typed address that names
      // nothing should say so, not bounce an anonymous visitor to login.
      { path: '*', Component: NotFoundRoute },
    ],
  },
];
