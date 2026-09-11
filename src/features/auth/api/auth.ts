import { api } from '@/lib/api-client';
import type { User } from '@/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface UserResponse {
  user: User;
}

/** `POST /api/login`. Returns the user and a Sanctum plain-text token. */
export function login(credentials: LoginCredentials, signal?: AbortSignal) {
  return api.post<LoginResponse>('/login', credentials, { signal });
}

/** `POST /api/logout`. Revokes the token used for this request, server-side. */
export function logout() {
  return api.post<unknown>('/logout');
}

/** `GET /api/me`. The backend wraps this as `data.user`. */
export function getCurrentUser(signal?: AbortSignal) {
  return api.get<UserResponse>('/me', { signal });
}
