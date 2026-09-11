import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/app/provider';
import { routes } from '@/app/route-table';

/**
 * Mount the real application at `initialPath`.
 *
 * This is the only seam #14 sanctions. It exercises the route table, the
 * providers, the HTTP client, token handling and the rendered result together,
 * with the network mocked at the HTTP boundary and nothing else stubbed. No
 * test reaches past it into a hook or a store.
 */
export function renderApp(initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });

  const utils = render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );

  return { ...utils, user: userEvent.setup(), router };
}
