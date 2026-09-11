import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { clearToken, readToken } from '@/lib/auth-token';

/** The single configured HTTP client. Unwraps the `{ message, data, code, error }`
 *  envelope so no screen sees it, attaches the bearer token (ADR 0004 — no cookies,
 *  no CSRF), and turns every failure into ApiError. */

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

const client = axios.create({
  baseURL: env.apiUrl,
  headers: { Accept: 'application/json' },
  // ADR 0004: bearer only. Cookies would invite the session/CSRF flow the design
  // handoff describes and this backend does not implement.
  withCredentials: false,
});

client.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Laravel puts validation failures at `data.errors`. `data` is `[]` not `{}` when
 *  empty — PHP cannot tell an empty map from a list — hence the Array check. */
function extractFieldErrors(payload: unknown): Record<string, string[]> {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return {};
  const errors = (payload as { errors?: unknown }).errors;
  if (typeof errors !== 'object' || errors === null || Array.isArray(errors)) return {};
  return errors as Record<string, string[]>;
}

function toApiError(cause: unknown): ApiError {
  if (!axios.isAxiosError(cause)) {
    return new ApiError('Something went wrong. Try again.', 0);
  }

  // No response at all means the request never landed.
  if (!cause.response) {
    return new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  const { status, data } = cause.response;
  const envelope = typeof data === 'object' && data !== null ? (data as ApiEnvelope<unknown>) : null;
  const message = envelope?.message;

  if (status === 401) {
    clearToken();
    onUnauthorized?.();
    return new ApiError(message ?? 'Your session has ended. Sign in again.', 401);
  }

  return new ApiError(
    message ?? `The server returned an unexpected response (${status}).`,
    status,
    extractFieldErrors(envelope?.data),
  );
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await client.request<ApiEnvelope<T>>(config);
    return response.data?.data as T;
  } catch (cause) {
    // An abort is the caller's own doing, so it passes through untranslated.
    if (axios.isCancel(cause)) throw cause;
    throw toApiError(cause);
  }
}

interface RequestOptions {
  signal?: AbortSignal;
  /** Upload progress, 0-1. Needs XHR, which is why this client is axios (#8). */
  onUploadProgress?: (fraction: number) => void;
}

function withOptions(options?: RequestOptions): AxiosRequestConfig {
  if (!options) return {};
  const { signal, onUploadProgress } = options;
  return {
    signal,
    onUploadProgress: onUploadProgress
      ? (event) => onUploadProgress(event.total ? event.loaded / event.total : 0)
      : undefined,
  };
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>({ method: 'GET', url, ...withOptions(options) }),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>({ method: 'POST', url, data, ...withOptions(options) }),
  put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>({ method: 'PUT', url, data, ...withOptions(options) }),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>({ method: 'DELETE', url, ...withOptions(options) }),
};
