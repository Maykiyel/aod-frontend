import { http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import { thunderboltsRoster, usersByToken } from '@/testing/mocks/fixtures';
import type { User } from '@/types/api';

/** Wrap a payload the way every endpoint does: `{ message, data, code, error }`. */
export function envelope(message: string, data: unknown, code = 200) {
  return HttpResponse.json({ message, data, code, error: code >= 400 }, { status: code });
}

const url = (path: string) => `${env.apiUrl}${path}`;

/** Resolve the bearer the way Sanctum does, or null if it names nobody. */
function caller(request: Request): User | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return usersByToken.get(header.slice('Bearer '.length)) ?? null;
}

/** Derived from the token map so an account is declared in one place only. The
 *  seeder sets every password equal to its username. */
const credentials = new Map(
  [...usersByToken].map(([token, user]) => [user.email, { user, token }] as const),
);

/**
 * The happy path. Individual tests override a handler with `server.use(...)`
 * rather than editing these, so the default stays the behaviour most tests want.
 */
export const handlers = [
  http.post(url('/login'), async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const account = body.email ? credentials.get(body.email) : undefined;

    // The real backend answers bad credentials with a 422 validation failure on
    // `email`, NOT a 401. Reproduced exactly, because treating it as a 401 is
    // the bug this seam is here to catch.
    if (!account || body.password !== account.user.username) {
      return envelope(
        'The provided credentials are incorrect.',
        { errors: { email: ['The provided credentials are incorrect.'] } },
        422,
      );
    }

    return envelope('Login successful.', { user: account.user, token: account.token });
  }),

  http.get(url('/me'), ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    return envelope('Profile retrieved.', { user });
  }),

  // resolveTeam() aborts 404 when the caller has no active team, so teamless and
  // "team does not exist" are the same response. That 404 is the teamless signal.
  http.get(url('/teams'), ({ request }) => {
    const user = caller(request);
    if (!user) return envelope('Unauthenticated.', [], 401);
    if (user.teams?.length === 0) return envelope('Team not found.', [], 404);
    return envelope('Team retrieved.', { team: thunderboltsRoster });
  }),

  http.post(url('/logout'), () => envelope('Logout successful.', [])),
];
