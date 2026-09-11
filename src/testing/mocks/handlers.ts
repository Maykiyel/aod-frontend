import { http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import { authToken, mainCoach } from '@/testing/mocks/fixtures';

/** Wrap a payload the way every endpoint does: `{ message, data, code, error }`. */
export function envelope(message: string, data: unknown, code = 200) {
  return HttpResponse.json({ message, data, code, error: code >= 400 }, { status: code });
}

const url = (path: string) => `${env.apiUrl}${path}`;

/**
 * The happy path. Individual tests override a handler with `server.use(...)`
 * rather than editing these, so the default stays the behaviour most tests want.
 */
export const handlers = [
  http.post(url('/login'), async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    // The real backend answers bad credentials with a 422 validation failure on
    // `email`, NOT a 401. Reproduced exactly, because treating it as a 401 is
    // the bug this seam is here to catch.
    if (body.password !== 'maincoach') {
      return envelope(
        'The provided credentials are incorrect.',
        { errors: { email: ['The provided credentials are incorrect.'] } },
        422,
      );
    }

    return envelope('Login successful.', { user: mainCoach, token: authToken });
  }),

  http.get(url('/me'), ({ request }) => {
    if (request.headers.get('Authorization') !== `Bearer ${authToken}`) {
      return envelope('Unauthenticated.', [], 401);
    }
    return envelope('Profile retrieved.', { user: mainCoach });
  }),

  http.post(url('/logout'), () => envelope('Logout successful.', [])),
];
