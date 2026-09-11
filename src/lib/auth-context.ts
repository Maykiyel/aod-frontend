import { createContext, use } from 'react';
import type { LoginCredentials } from '@/features/auth/api/auth';
import type { User } from '@/types/api';

/** Who is using the app. `checking` is a real state: a stored token must be
 *  proved before any route decision is honest — redirecting mid-flight would
 *  sign out every returning user on reload. */
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
