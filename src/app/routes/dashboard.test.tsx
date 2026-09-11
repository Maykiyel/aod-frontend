import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import { envelope } from '@/testing/mocks/handlers';
import {
  assistantCoachToken,
  authToken,
  playerToken,
  teamlessToken,
  thunderboltsRoster,
} from '@/testing/mocks/fixtures';
import { server } from '@/testing/mocks/server';
import { renderApp } from '@/testing/test-utils';

const TOKEN_KEY = 'aod.auth.token.v1';

/** The destinations on offer, read the way a person reads a sidebar. The wait is
 *  for the membership: the shell renders before it resolves, and until it does
 *  nobody has any capabilities. */
async function expectNavigation(labels: string[]): Promise<void> {
  await waitFor(() => {
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    const offered = within(nav)
      .getAllByRole('link')
      .map((link) => link.textContent ?? '');
    expect(offered).toEqual(labels);
  });
}

/** Same seam as the auth tests (#14): render a route with the network mocked at
 *  the HTTP boundary and read what a person would see. Capability derivation is
 *  verified through the navigation it produces, never by importing the hook. */
describe('the dashboard', () => {
  it('names the team once the active membership resolves', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Thunderbolts' })).toBeInTheDocument();
  });

  it('offers a main coach every destination', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    await expectNavigation(['Dashboard', 'Sessions', 'Team', 'Settings']);
    expect(await screen.findByText('MAIN COACH')).toBeInTheDocument();
    // Configuring sessions is coaching work, so the instruction names it.
    expect(screen.getByText(/create a session to start recording/i)).toBeInTheDocument();
  });

  it('offers an assistant coach the same destinations as the main coach', async () => {
    window.localStorage.setItem(TOKEN_KEY, assistantCoachToken);

    renderApp('/');

    // The two coach roles differ by exactly one capability — managing members —
    // and it gates no destination, so their sidebars are identical here.
    await expectNavigation(['Dashboard', 'Sessions', 'Team', 'Settings']);
    expect(await screen.findByText('ASSISTANT COACH')).toBeInTheDocument();
  });

  it('withholds settings from a player, whose role cannot configure the team', async () => {
    window.localStorage.setItem(TOKEN_KEY, playerToken);

    renderApp('/');

    await expectNavigation(['Dashboard', 'Sessions', 'Team']);
    expect(await screen.findByText('PLAYER')).toBeInTheDocument();
    // Nor is a player told to do the one thing their role cannot do.
    expect(screen.queryByText(/create a session/i)).not.toBeInTheDocument();
    expect(screen.getByText(/figures appear here once your team/i)).toBeInTheDocument();
  });

  it('marks the destination the user is actually on', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/');

    await expectNavigation(['Dashboard', 'Sessions', 'Team', 'Settings']);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('link', { name: 'Sessions' }));

    expect(screen.getByRole('link', { name: 'Sessions' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });

  it('says plainly that a team with no sessions has nothing to show', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    expect(await screen.findByText('0 SESSIONS LOGGED')).toBeInTheDocument();
    // An empty dashboard is not a failure, and must not read as one.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tells a user with no team to create or join one', async () => {
    window.localStorage.setItem(TOKEN_KEY, teamlessToken);

    renderApp('/');

    expect(await screen.findByRole('heading', { name: 'No team yet' })).toBeInTheDocument();
    expect(screen.getByText(/join one with its team code/i)).toBeInTheDocument();
    // A 404 from /teams is the teamless signal, not an error to report.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // Nothing else in the sidebar is reachable without a membership.
    await expectNavigation(['Dashboard']);
  });

  it('renders the error treatment, and recovers, when the team request fails', async () => {
    server.use(
      http.get(`${env.apiUrl}/teams`, () => envelope('The team could not be loaded.', [], 500)),
    );
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/');

    // The server's own message, shown rather than replaced.
    expect(await screen.findByRole('alert')).toHaveTextContent('The team could not be loaded.');

    server.use(
      http.get(`${env.apiUrl}/teams`, () =>
        envelope('Team retrieved.', { team: thunderboltsRoster }),
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Thunderbolts' })).toBeInTheDocument();
  });

  it('does not tell a user they have no team when the request merely failed', async () => {
    server.use(
      http.get(`${env.apiUrl}/teams`, () => envelope('The team could not be loaded.', [], 500)),
    );
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    await screen.findByRole('alert');
    // A failure says nothing about membership, so the sidebar says nothing.
    expect(screen.queryByText('NO TEAM')).not.toBeInTheDocument();
  });

  it('renders the error treatment when the request never lands at all', async () => {
    // A dropped request, not a failed one: HttpResponse.error() is a transport
    // failure, which the client turns into an ApiError with no status.
    server.use(http.get(`${env.apiUrl}/teams`, () => HttpResponse.error()));
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  });

  it('returns the user to login when the team request comes back 401', async () => {
    server.use(http.get(`${env.apiUrl}/teams`, () => envelope('Unauthenticated.', [], 401)));
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    // A 401 from ANY request, not just the auth module's own, ends the session.
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull());
  });

  it('renders the loading treatment while the membership is in flight', async () => {
    server.use(http.get(`${env.apiUrl}/teams`, async () => await delay('infinite')));
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    expect(await screen.findByRole('status', { name: 'Loading the team' })).toBeInTheDocument();
  });
});
