import { env } from '@/config/env';
import { clearToken, readToken } from '@/lib/auth-token';

/**
 * The single configured HTTP client. Every call to the API goes through here.
 *
 * It exists to hold four facts in one place, so that no screen has to know them:
 *
 * 1. **The envelope.** Every endpoint answers `{ message, data, code, error }`.
 *    Callers receive `data`; nothing above this module knows the wrapper exists.
 * 2. **The bearer token** (ADR 0004). Attached when present, with credentials
 *    omitted and no CSRF handling — the API issues Sanctum tokens and keeps no
 *    session cookie. The design handoff says the opposite and is wrong.
 * 3. **What counts as logged out.** Only a 401 does. See `ApiError` below.
 * 4. **That failures arrive as one type**, whether they came from the server,
 *    the network, or a body that was not the envelope at all.
 *
 * Transport note: this uses `fetch`, while ADR 0004 says axios. The ADR's
 * substance is the bearer token, not the library, and the interface here is
 * deliberately small enough that swapping the transport touches only this file.
 * See the session notes on #1 — axios could not be installed when this landed.
 */

export interface ApiEnvelope<T> {
  message: string;
  data: T;
  code: number;
  error: boolean;
}

/**
 * Every failure this client produces, including network failures.
 *
 * `message` is server-authored wherever the server supplied one and is meant to
 * be shown to the user rather than replaced — the login failure text is the
 * clearest case.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Readonly<Record<string, string[]>>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /**
   * True when the server rejected the *input* rather than the caller's identity.
   *
   * Worth the named accessor because the obvious guess is wrong: bad login
   * credentials come back as **422**, not 401. Laravel raises them as a
   * validation failure on the `email` field. Treating them as 401 would log the
   * user out mid-login and hide the server's own message.
   */
  get isValidation(): boolean {
    return this.status === 422;
  }

  /** The first message the server gave for a field, if it rejected one. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

/**
 * Called when a request comes back 401 — the token is already cleared by then.
 *
 * Injected rather than imported so this module stays free of the router: the
 * app layer decides what "return to login" means. See ADR 0007.
 */
type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  signal?: AbortSignal;
}

/** Parse the envelope, tolerating bodies that are not one (502 HTML, 204, empty). */
async function readEnvelope(response: Response): Promise<ApiEnvelope<unknown> | null> {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as ApiEnvelope<unknown>;
  } catch {
    return null;
  }
}

/**
 * Laravel puts validation failures at `data.errors` as field -> messages.
 * Note `data` is `[]` rather than `{}` when empty, because PHP cannot tell an
 * empty map from an empty list — hence the Array check.
 */
function extractFieldErrors(envelope: ApiEnvelope<unknown> | null): Record<string, string[]> {
  const data = envelope?.data;
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};

  const errors = (data as { errors?: unknown }).errors;
  if (typeof errors !== 'object' || errors === null || Array.isArray(errors)) return {};

  return errors as Record<string, string[]>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const token = readToken();

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // ADR 0004: bearer only. Sending cookies would invite the session/CSRF
      // flow the handoff describes and this backend does not implement.
      credentials: 'omit',
      signal: options?.signal,
    });
  } catch (cause) {
    // An aborted request is the caller's own doing, not a network failure.
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  const envelope = await readEnvelope(response);

  if (response.status === 401) {
    clearToken();
    onUnauthorized?.();
    throw new ApiError(envelope?.message ?? 'Your session has ended. Sign in again.', 401);
  }

  if (!response.ok || envelope?.error === true) {
    throw new ApiError(
      envelope?.message ?? `The server returned an unexpected response (${response.status}).`,
      response.status,
      extractFieldErrors(envelope),
    );
  }

  return envelope?.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
