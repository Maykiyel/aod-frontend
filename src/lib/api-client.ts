import { env } from '@/config/env';
import { clearToken, readToken } from '@/lib/auth-token';

/** The single configured HTTP client. Unwraps the `{ message, data, code, error }`
 *  envelope so no screen sees it, attaches the bearer token (ADR 0004 — no cookies,
 *  no CSRF), and turns every failure into ApiError. Uses fetch, not the axios
 *  ADR 0004 names; the interface is small enough that swapping touches this file. */

export interface ApiEnvelope<T> {
  message: string;
  data: T;
  code: number;
  error: boolean;
}

/** Every failure, network ones included. `message` is server-authored where the
 *  server supplied one, and is meant to be shown rather than replaced. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Readonly<Record<string, string[]>>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** Server rejected the input, not the identity. Named because the obvious guess
   *  is wrong: bad credentials return 422, not 401. Treating them as 401 would log
   *  the user out mid-login and hide the server's message. */
  get isValidation(): boolean {
    return this.status === 422;
  }

  /** The first message the server gave for a field, if it rejected one. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

/** Called on 401, after the token is cleared. Injected rather than imported so
 *  this module stays free of the router. */
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

/** Laravel puts validation failures at `data.errors`. `data` is `[]` not `{}` when
 *  empty — PHP cannot tell an empty map from a list — hence the Array check. */
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
