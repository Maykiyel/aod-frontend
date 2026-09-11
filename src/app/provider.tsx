import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';

/** Everything the whole app needs in scope. The query client joins this in #2. */
export function AppProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
