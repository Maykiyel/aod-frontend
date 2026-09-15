import { create } from 'zustand';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/features/auth/api/auth';
import type { LoginCredentials, RegisterResponse } from '@/features/auth/api/auth';
import { setUnauthorizedHandler } from '@/lib/api-client';
import { clearToken, readToken, writeToken } from '@/lib/auth-token';
import type { RegistrationRequest, User } from '@/types/api';

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

let onSessionEnded: (() => void) | null = null;

/** Told whenever a session ends with no navigation to notice it — a logout, or a
 *  401 from anywhere. The router registers here and re-asks its middleware, so
 *  the redirect stays a routing decision rather than a render-time one. */
export function setSessionEndedHandler(handler: (() => void) | null): void {
  onSessionEnded = handler;
}

function endSession(): void {
  clearToken();
  setState({ user: null, status: 'anonymous' });
  onSessionEnded?.();
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const data = await loginRequest(credentials);
  writeToken(data.token);
  setState({ user: data.user, status: 'authenticated' });
}

/** Registration authenticates: the response carries the token, so the session is
 *  established from it with no second sign-in (#31). Returned whole because the
 *  membership status is knowable only here (Joe-Zupo/aod-backend#21). */
export async function register(payload: RegistrationRequest): Promise<RegisterResponse> {
  const data = await registerRequest(payload);
  writeToken(data.token);
  setState({ user: data.user, status: 'authenticated' });
  return data;
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

/** Prove a stored token once on load. Memoised rather than signal-guarded: one
 *  promise per app load means StrictMode's second pass joins the first attempt
 *  instead of racing it. */
async function restoreSession(): Promise<void> {
  if (!readToken()) return;

  try {
    const data = await getCurrentUser();
    setState({ user: data.user, status: 'authenticated' });
  } catch {
    // A 401 already cleared the token in the client. Anything else (server
    // down) is equally unusable, so the honest state is anonymous either way.
    endSession();
  }
}

let restoration: Promise<void> | null = null;

/** Resolves once the session is knowable — `status` is no longer `checking`.
 *  The router awaits this before deciding a redirect, so no route is ever
 *  rendered, or redirected away from, against a session still being proved. */
export function sessionRestored(): Promise<void> {
  restoration ??= restoreSession();
  return restoration;
}

/** Start a fresh app. Tests mount many in one module, and both the store and
 *  the memoised restoration outlive any single one of them. */
export function resetAuthStore(): void {
  restoration = null;
  onSessionEnded = null;
  setState(initialAuthState());
}

// A 401 from anywhere in the app, not just this module's own calls. Set at
// module scope because the store outlives every component that reads it. The
// token is already cleared by the client, so this only ends the local session.
setUnauthorizedHandler(() => {
  setState({ user: null, status: 'anonymous' });
  onSessionEnded?.();
});
