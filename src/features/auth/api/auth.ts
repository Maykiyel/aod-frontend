import { api } from '@/lib/api-client';
import type { MembershipStatus, RegistrationRequest, Team, User } from '@/types/api';

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

export interface RegisterResponse {
  user: User;
  /** Null when the registration asked for no team at all. */
  team: Team | null;
  /** `active` for a team just created, `pending` for one joined by code, null
   *  for no team. Narrowed here: the generator emits the single example value. */
  team_membership_status: MembershipStatus | null;
  token: string;
}

/** `POST /api/login`. Returns the user and a Sanctum plain-text token. */
export function login(credentials: LoginCredentials, signal?: AbortSignal) {
  return api.post<LoginResponse>('/login', credentials, { signal });
}

/** `POST /api/register`. One atomic call carrying credentials, the role-specific
 *  profile and the team action; the backend wraps user, team and membership in
 *  one transaction (#31). Returns a token, so it authenticates too. */
export function register(payload: RegistrationRequest, signal?: AbortSignal) {
  return api.post<RegisterResponse>('/register', payload, { signal });
}

/** `POST /api/logout`. Revokes the token used for this request, server-side. */
export function logout() {
  return api.post<unknown>('/logout');
}

/** `GET /api/me`. The backend wraps this as `data.user`. */
export function getCurrentUser(signal?: AbortSignal) {
  return api.get<UserResponse>('/me', { signal });
}
