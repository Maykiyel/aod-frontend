import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { caller, envelope } from '@/testing/mocks/handlers';
import { authToken, mainCoach } from '@/testing/mocks/fixtures';
import { server } from '@/testing/mocks/server';
import { renderApp } from '@/testing/test-utils';
import type { UserEvent } from '@testing-library/user-event';
import { env } from '@/config/env';

const TOKEN_KEY = 'aod.auth.token.v1';

/** Logging out lives behind the sidebar's profile block, not beside it. */
async function logOut(user: UserEvent) {
  await user.click(await screen.findByRole('button', { name: /maincoach/ }));
  await user.click(await screen.findByRole('menuitem', { name: 'Log out' }));
}

/** The single seam from #14: render a route with the network mocked at the HTTP
 *  boundary and drive it as a person would. Controls found by accessible name;
 *  nothing here imports a hook or reaches into state. */
describe('authentication', () => {
  it('lands the user on the authenticated view when credentials are valid', async () => {
    const { user } = renderApp('/login');

    await user.type(await screen.findByLabelText('Email'), 'maincoach@example.com');
    await user.type(screen.getByLabelText('Password'), 'maincoach');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    // Landing inside the App Shell is what "reached the app" means (#14).
    expect(await screen.findByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByText('maincoach')).toBeInTheDocument();
  });

  it("surfaces the server's own message and stays put when credentials are wrong", async () => {
    const { user } = renderApp('/login');

    await user.type(await screen.findByLabelText('Email'), 'maincoach@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    // Server-authored text, shown rather than replaced.
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The provided credentials are incorrect.',
    );
    // Bad credentials come back 422, not 401. The user must NOT be treated as
    // logged out — the form stays, and no token is written.
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('picks up a stored token on load, sending it as a bearer header', async () => {
    // The /me handler answers 401 unless the bearer header matches, so reaching
    // the authenticated view is itself the proof that the header was attached.
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    expect(await screen.findByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('returns the user to login when a request comes back 401', async () => {
    window.localStorage.setItem(TOKEN_KEY, 'a-revoked-token');

    renderApp('/');

    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    // The client clears a token the server has rejected.
    await waitFor(() => expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull());
  });

  it('clears the token and returns to login on logout', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);
    const { user } = renderApp('/');

    await logOut(user);

    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('ends the local session even when the logout request fails', async () => {
    server.use(http.post(`${env.apiUrl}/logout`, () => envelope('Server error.', [], 500)));
    window.localStorage.setItem(TOKEN_KEY, authToken);
    const { user } = renderApp('/');

    await logOut(user);

    // Failing to log out is not a state the user can act on.
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('sends an unauthenticated visitor from a protected route to login', async () => {
    renderApp('/');
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
  });

  it('holds the door shut while a stored token is still being proved', async () => {
    // The one state a routing decision must not be taken in: a token exists but
    // has not been proved, so neither answer is honest yet.
    server.use(
      http.get(`${env.apiUrl}/me`, async ({ request }) => {
        await delay(120);
        const user = caller(request);
        return user
          ? envelope('Profile retrieved.', { user })
          : envelope('Unauthenticated.', [], 401);
      }),
    );
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    // No flash of the anonymous UI, and no redirect taken on a guess.
    expect(screen.getByRole('status')).toHaveTextContent('AUTHENTICATING');
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();

    expect(await screen.findByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
  });

  it('returns the user to the page they first asked for', async () => {
    const { user } = renderApp('/sessions');

    // The deep link survives the detour, carried as `?next=`.
    await user.type(await screen.findByLabelText('Email'), 'maincoach@example.com');
    await user.type(screen.getByLabelText('Password'), 'maincoach');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('heading', { name: 'Sessions' })).toBeInTheDocument();
  });

  it('says so when an address names nothing, rather than bouncing to the dashboard', async () => {
    renderApp('/no-such-screen');

    expect(await screen.findByRole('heading', { name: /no such page/i })).toBeInTheDocument();
    // Not a login redirect either: an unknown address is not a protected one.
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('sends an authenticated visitor away from login', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);
    renderApp('/login');
    expect(await screen.findByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
  });

  it('renders an error the user can act on when the network fails', async () => {
    // HttpResponse.error() is a transport failure. Throwing inside a handler
    // would be a handler exception, which MSW turns into a 500 — a different
    // path entirely, and not the one this test is about.
    server.use(http.post(`${env.apiUrl}/login`, () => HttpResponse.error()));
    const { user } = renderApp('/login');

    await user.type(await screen.findByLabelText('Email'), 'maincoach@example.com');
    await user.type(screen.getByLabelText('Password'), 'maincoach');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  });

  it('does not send a request until the browser is satisfied with the input', async () => {
    let loginAttempts = 0;
    server.use(
      http.post(`${env.apiUrl}/login`, () => {
        loginAttempts += 1;
        return envelope('Login successful.', { user: mainCoach, token: authToken });
      }),
    );

    const { user } = renderApp('/login');
    const submit = await screen.findByRole('button', { name: 'Log in' });

    // Both fields empty: `required` should stop this before the network.
    await user.click(submit);
    expect(loginAttempts).toBe(0);

    // A malformed address is something the browser already knows is wrong, so
    // the user should not wait on a round trip to be told.
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'maincoach');
    await user.click(submit);
    expect(loginAttempts).toBe(0);

    // Valid input does reach the network.
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'maincoach@example.com');
    await user.click(submit);
    await waitFor(() => expect(loginAttempts).toBe(1));
  });
});
