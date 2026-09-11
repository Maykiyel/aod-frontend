/** The Sanctum token, persisted so a refresh costs no login (ADR 0004). The only
 *  place naming the storage key. Every access is guarded: localStorage throws
 *  outright in private windows and blocked-storage contexts. */

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
