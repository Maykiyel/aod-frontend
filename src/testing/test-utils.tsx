import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/app/provider';
import { routes } from '@/app/route-table';
import { initialAuthState, useAuthStore } from '@/lib/auth-store';

/** Mount the real app at `initialPath` — the only seam #14 sanctions. Exercises
 *  routes, providers, HTTP client and token handling together, with the network
 *  mocked at the HTTP boundary and nothing else stubbed. */
export function renderApp(initialPath = '/') {
  // The session store outlives a render, so mounting a fresh app means starting
  // it fresh too — and it reads the token the test has just planted.
  useAuthStore.setState(initialAuthState());

  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });

  const utils = render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );

  return { ...utils, user: userEvent.setup(), router };
}
