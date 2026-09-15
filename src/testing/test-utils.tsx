import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/app/provider';
import { routes } from '@/app/route-table';
import { routerFuture } from '@/app/router-future';
import { resetAuthStore, setSessionEndedHandler } from '@/lib/auth-store';

/** Mount the real app at `initialPath` — the only seam #14 sanctions. Exercises
 *  routes, providers, HTTP client and token handling together, with the network
 *  mocked at the HTTP boundary and nothing else stubbed. */
export function renderApp(initialPath = '/') {
  // The session store and its one-shot restoration both outlive a render, so
  // mounting a fresh app means starting them fresh too — and the store reads the
  // token the test has just planted.
  resetAuthStore();

  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
    future: routerFuture,
  });

  // Same wiring the browser router does: a logout or a 401 re-asks the
  // middleware rather than redirecting from inside a component.
  setSessionEndedHandler(() => void router.revalidate());

  const utils = render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );

  return { ...utils, user: userEvent.setup(), router };
}
