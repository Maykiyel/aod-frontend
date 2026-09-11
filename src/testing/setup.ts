import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '@/testing/mocks/server';

// `error` rather than `warn`: an unhandled request means a test is reaching a
// real network, which is the one thing this seam must never do silently.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  cleanup();
  // The token outlives a component, so it has to be cleared between tests or
  // one test's login silently authenticates the next.
  window.localStorage.clear();
});

afterAll(() => server.close());
