import { QueryClient } from '@tanstack/react-query';

/** One client per app instance: a module singleton would carry one test's cache
 *  into the next. No automatic retry — a 4xx is the server's settled answer, and
 *  the error treatment carries its own Retry control for everything else. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 30_000 },
    },
  });
}
