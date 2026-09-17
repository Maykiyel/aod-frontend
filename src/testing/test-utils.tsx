import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/app/provider';
import { routes } from '@/app/route-table';
import { routerFuture } from '@/app/router-future';
import type { CaptureDouble } from '@/testing/capture-double';
import type { ConnectionStatus } from '@/lib/live-updates/live-updates';
import { resetAuthStore, setSessionEndedHandler } from '@/lib/auth-store';
import { createCaptureDouble } from '@/testing/capture-double';
import { createLiveUpdatesDouble } from '@/testing/live-updates-double';

/** Mount the real app at `initialPath` — the seam #14 sanctions. Routes,
 *  providers, HTTP client and token handling together, with the network mocked
 *  at the HTTP boundary and both declared ports supplied as doubles. */
export function renderApp(
  initialPath = '/',
  options: {
    connection?: ConnectionStatus;
    /** Arrange the capture double before the first render: a Screen reads what
     *  a previous run left behind on mount, so seeding it afterwards is a race. */
    capture?: (double: CaptureDouble) => void;
  } = {},
) {
  // The session store and its one-shot restoration both outlive a render, so
  // mounting a fresh app means starting them fresh too — and the store reads the
  // token the test has just planted.
  resetAuthStore();

  const live = createLiveUpdatesDouble(options.connection);
  const capture = createCaptureDouble();
  options.capture?.(capture);

  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
    future: routerFuture,
  });

  // Same wiring the browser router does: a logout or a 401 re-asks the
  // middleware rather than redirecting from inside a component.
  setSessionEndedHandler(() => void router.revalidate());

  const utils = render(
    <AppProvider liveUpdates={live} capture={capture}>
      <RouterProvider router={router} />
    </AppProvider>,
  );

  return { ...utils, user: userEvent.setup(), router, live, capture };
}
