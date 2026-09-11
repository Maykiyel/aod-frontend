import { createContext, use } from 'react';
import type { LoginCredentials } from '@/features/auth/api/auth';
import type { User } from '@/types/api';

/**
 * Who is using the app.
 *
 * `checking` is a real state, not a detail: a stored token has to be proved
 * against the server before any route decision is safe. Redirecting to login
 * while it is in flight would sign out every returning user on reload, and
 * rendering the app would flash a screen the server may refuse.
 */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
  return value;
}
