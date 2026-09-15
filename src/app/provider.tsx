import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/react-query';

/** Everything the whole app needs in scope. The session is a store rather than
 *  a provider (ADR 0010), so only the query client is wrapped here — proving a
 *  stored token is the router's business now, not an effect's. */
export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
