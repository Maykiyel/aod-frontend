import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetRegistrations, resetSessions } from '@/testing/mocks/handlers';
import { server } from '@/testing/mocks/server';

// Every render now waits on the router's first navigation, which is where a
// stored token gets proved. The 1s default for findBy/waitFor is tight for that
// on a loaded machine.
configure({ asyncUtilTimeout: 5_000 });

// `error` rather than `warn`: an unhandled request means a test is reaching a
// real network, which is the one thing this seam must never do silently.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  // Registration is the first thing that writes, so its accounts and teams
  // outlive a test the way a real database would without a reseed.
  resetRegistrations();
  // Sessions are written by creation and read back by the index, so one test's
  // new session would otherwise be in the next test's list.
  resetSessions();
  cleanup();
  // The token outlives a component, so it has to be cleared between tests or
  // one test's login silently authenticates the next.
  window.localStorage.clear();
});

afterAll(() => server.close());
