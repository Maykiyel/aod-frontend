import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { restoreSession } from '@/lib/auth-store';
import { createQueryClient } from '@/lib/react-query';

/** Everything the whole app needs in scope. The session is a store rather than
 *  a provider (ADR 0010), so only the query client is wrapped here. */
export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  // Prove a stored token once. The signal abandons the attempt on unmount, so
  // StrictMode's second pass does not race the first.
  useEffect(() => {
    const controller = new AbortController();
    void restoreSession(controller.signal);
    return () => controller.abort();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
