import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LiveUpdatesContext } from '@/lib/live-updates/context';
import { createEchoLiveUpdates } from '@/lib/live-updates/echo-adapter';
import type { LiveUpdates } from '@/lib/live-updates/live-updates';
import { createQueryClient } from '@/lib/react-query';

/** Everything the whole app needs in scope. The session is a store rather than
 *  a provider (ADR 0010), so only the query client and the live-updates port are
 *  wrapped here — proving a stored token is the router's business now. */
export function AppProvider({
  children,
  liveUpdates,
}: {
  children: ReactNode;
  /** The port's one injection point: the Echo adapter in production, a double
   *  under test (spec #38). */
  liveUpdates?: LiveUpdates;
}) {
  const [queryClient] = useState(createQueryClient);
  const [live] = useState(() => liveUpdates ?? createEchoLiveUpdates());

  return (
    <QueryClientProvider client={queryClient}>
      <LiveUpdatesContext value={live}>{children}</LiveUpdatesContext>
    </QueryClientProvider>
  );
}
