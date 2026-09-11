import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from '@/lib/auth-context';
import type { AuthStatus } from '@/lib/auth-context';
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '@/features/auth/api/auth';
import type { LoginCredentials } from '@/features/auth/api/auth';
import { clearToken, readToken, writeToken } from '@/lib/auth-token';
import { setUnauthorizedHandler } from '@/lib/api-client';
import type { User } from '@/types/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    readToken() ? 'checking' : 'anonymous',
  );
  const [user, setUser] = useState<User | null>(null);

  // Prove a stored token once on load. No token means nothing to prove.
  useEffect(() => {
    if (!readToken()) return;

    const controller = new AbortController();

    getCurrentUser(controller.signal)
      .then((data) => {
        setUser(data.user);
        setStatus('authenticated');
      })
      .catch(() => {
        // A 401 already cleared the token in the client and will arrive at the
        // handler below. Anything else (server down) is equally unusable, so
        // the honest state is anonymous either way.
        if (!controller.signal.aborted) {
          clearToken();
          setUser(null);
          setStatus('anonymous');
        }
      });

    return () => controller.abort();
  }, []);

  // A 401 from anywhere in the app, not just from this module's own calls.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('anonymous');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await loginRequest(credentials);
    writeToken(data.token);
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // The server may already have revoked the token, or be unreachable.
      // Either way the local session ends — failing to log out is not a state
      // the user can act on.
    }
    clearToken();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
