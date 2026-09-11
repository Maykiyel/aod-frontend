/**
 * The Sanctum plain-text token, persisted so a refresh does not cost a login
 * (ADR 0004). This module is the only place that names the storage key.
 *
 * Reads and writes are guarded: `localStorage` throws outright in some contexts
 * (private windows, embedded webviews, blocked site data) rather than returning
 * null, and an auth check is not worth crashing the app over.
 */

// Versioned per the `client-localstorage-schema` guidance, so a future change to
// what is stored can be recognised and discarded rather than misread.
const STORAGE_KEY = 'aod.auth.token.v1';

export function readToken(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeToken(token: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Not fatal: the session simply will not survive a refresh.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do; the token is already unusable to us.
  }
}
