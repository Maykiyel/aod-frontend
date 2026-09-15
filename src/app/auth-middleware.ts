import { redirect } from 'react-router';
import type { MiddlewareFunction } from 'react-router';
import { sessionRestored, useAuthStore } from '@/lib/auth-store';

/** Route-level authentication, as a navigation decision rather than a render
 *  one. Each waits on `sessionRestored()` first, so a stored token is proved
 *  before any redirect is decided and no route renders against `checking`.
 *  The store stays the source of session state (ADR 0010); only the decision
 *  moves here. */

/** Where to send someone once they are signed in. Same-origin paths only — a
 *  `next` naming another site would be an open redirect. */
export function nextPathFrom(request: Request): string {
  const next = new URL(request.url).searchParams.get('next');
  return next?.startsWith('/') && !next.startsWith('//') ? next : '/';
}

/** The authenticated branch. Carries the attempted path so a deep link survives
 *  the detour to login. */
export const requireAuth: MiddlewareFunction = async ({ request }, next) => {
  await sessionRestored();
  if (useAuthStore.getState().status === 'authenticated') return next();

  const { pathname, search } = new URL(request.url);
  const attempted = `${pathname}${search}`;
  throw redirect(
    attempted === '/' ? '/login' : `/login?next=${encodeURIComponent(attempted)}`,
  );
};

/** Login is for people who are not signed in yet. */
export const anonymousOnly: MiddlewareFunction = async ({ request }, next) => {
  await sessionRestored();
  if (useAuthStore.getState().status === 'authenticated') throw redirect(nextPathFrom(request));
  return next();
};

/** A loader, not middleware: registering authenticates midway, and middleware
 *  re-runs on the revalidation after an action — which would redirect away from
 *  the pending outcome. With `shouldRevalidate: false` this runs on arrival only. */
export async function redirectIfAuthenticated(): Promise<null> {
  await sessionRestored();
  if (useAuthStore.getState().status === 'authenticated') throw redirect('/');
  return null;
}
