import { create } from 'zustand';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '@/features/auth/api/auth';
import type { LoginCredentials } from '@/features/auth/api/auth';
import { setUnauthorizedHandler } from '@/lib/api-client';
import { clearToken, readToken, writeToken } from '@/lib/auth-token';
import type { User } from '@/types/api';

/** Who is using the app. `checking` is a real state: a stored token must be
 *  proved before any route decision is honest — redirecting mid-flight would
 *  sign out every returning user on reload. */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

/** Computed at store creation rather than fixed, so a page load that already
 *  has a token starts at `checking` instead of flashing the login screen. */
export function initialAuthState(): AuthState {
  return { status: readToken() ? 'checking' : 'anonymous', user: null };
}

export const useAuthStore = create<AuthState>(() => initialAuthState());

const { setState } = useAuthStore;

/** The session, for components. Actions are plain functions below rather than
 *  store fields, so a component that only calls one does not subscribe to it
 *  (`rerender-defer-reads`). */
export function useAuth(): AuthState {
  return useAuthStore();
}

function endSession(): void {
  clearToken();
  setState({ user: null, status: 'anonymous' });
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const data = await loginRequest(credentials);
  writeToken(data.token);
  setState({ user: data.user, status: 'authenticated' });
}

export async function logout(): Promise<void> {
  try {
    await logoutRequest();
  } catch {
    // The server may already have revoked the token, or be unreachable. Either
    // way the local session ends — a failed logout is not actionable.
  }
  endSession();
}

/** Prove a stored token once on load. The caller owns the signal, so a remount
 *  or StrictMode's second pass abandons the first attempt rather than racing. */
export async function restoreSession(signal?: AbortSignal): Promise<void> {
  if (!readToken()) return;

  try {
    const data = await getCurrentUser(signal);
    setState({ user: data.user, status: 'authenticated' });
  } catch {
    // A 401 already cleared the token in the client. Anything else (server
    // down) is equally unusable, so the honest state is anonymous either way.
    if (!signal?.aborted) endSession();
  }
}

// A 401 from anywhere in the app, not just this module's own calls. Set at
// module scope because the store outlives every component that reads it.
setUnauthorizedHandler(() => setState({ user: null, status: 'anonymous' }));
