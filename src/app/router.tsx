// `RouterProvider` from `react-router`, not `react-router/dom`: the two differ
// only by the dom build passing ReactDOM.flushSync, and under vitest that build
// resolves to a second module instance whose updates never reach our root.
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from '@/app/route-table';
import { routerFuture } from '@/app/router-future';
import { setSessionEndedHandler } from '@/lib/auth-store';

const browserRouter = createBrowserRouter(routes, { future: routerFuture });

// A session that ends without a navigation still has to be acted on. Revalidating
// re-runs the middleware, which is what decides where an anonymous user belongs.
setSessionEndedHandler(() => void browserRouter.revalidate());

export function AppRouter() {
  return <RouterProvider router={browserRouter} />;
}
