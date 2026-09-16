import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import { caller, envelope, resetSessions } from '@/testing/mocks/handlers';
import {
  assistantCoachToken,
  authToken,
  ownLineAndMedian,
  pastSessions,
  playerToken,
  pooledHeader,
  roster,
  shortPoolHeader,
  shortPoolPlayers,
  teamlessToken,
  thunderboltsRoster,
} from '@/testing/mocks/fixtures';
import { server } from '@/testing/mocks/server';
import { renderApp } from '@/testing/test-utils';

const TOKEN_KEY = 'aod.auth.token.v1';

/** Both endpoints answering with a pool shorter than it asked for — what a fresh
 *  database returns, and what a demo opens on. */
function shortPool(): void {
  server.use(
    // identity.user is the caller on the real endpoint, in this state too.
    http.get(`${env.apiUrl}/dashboard/header`, ({ request }) =>
      envelope('Dashboard header retrieved.', {
        ...shortPoolHeader,
        identity: { ...shortPoolHeader.identity, user: caller(request) },
      }),
    ),
    http.get(`${env.apiUrl}/dashboard/players`, () =>
      envelope('Dashboard players retrieved.', shortPoolPlayers),
    ),
  );
}

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
  });

  it('marks the destination the user is actually on', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/');

    await expectNavigation(['Dashboard', 'Sessions', 'Team', 'Settings']);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('link', { name: 'Sessions' }));

    // A navigation now runs the auth middleware, so it settles a tick later.
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Sessions' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });

  it('counts the communication mix rather than rounding it into percentages', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    const mix = await screen.findByRole('region', { name: 'Comm mix' });
    expect(mix).toHaveTextContent('1,842 CALLS CLASSIFIED');

    // The three types, in the order the data model fixes, then the redundant
    // tally over that same total. Absence is a count of intervals, not a type.
    expect(within(mix).getAllByRole('term').map((term) => term.textContent)).toEqual([
      'INFORMATIVE',
      'DECLARATIVE',
      'COMPOUND',
      'REDUNDANT',
      'ABSENCE',
    ]);
    expect(within(mix).getAllByRole('definition').map((value) => value.textContent)).toEqual([
      '774',
      '571',
      '497',
      '133',
      '12 INTERVALS',
    ]);
  });

  it('gives a coach one line per active non-coach member', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    const roster = await screen.findByRole('table', { name: 'Team members' });
    const rows = within(roster).getAllByRole('row');

    // A header row, then the two players. Coaches log no communication events
    // and are off the roster entirely.
    expect(rows).toHaveLength(3);
    expect(within(roster).queryByText('maincoach')).not.toBeInTheDocument();
    expect(within(roster).queryByText('assistantcoach')).not.toBeInTheDocument();

    // Frequency, alignment rate and state only: absence is team-wide by
    // definition, and the per-player call and session counts are not wanted.
    expect(within(roster).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'PLAYER',
      'COMMS/MIN',
      'ALIGN RATE',
      'STATE',
    ]);

    expect(rows[1]).toHaveTextContent('playerone');
    expect(rows[1]).toHaveTextContent('21.6');
    expect(rows[1]).toHaveTextContent('91.33');
    expect(rows[1]).toHaveTextContent('ONLINE');
    expect(rows[1]).not.toHaveTextContent('412');
    expect(rows[2]).toHaveTextContent('playertwo');
    expect(rows[2]).toHaveTextContent('12.84');
    expect(rows[2]).toHaveTextContent('OFFLINE');

    // A coach never sees the team median.
    expect(screen.queryByRole('region', { name: 'You vs team median' })).not.toBeInTheDocument();
  });

  it('gives a player their own line against the team median, and no roster', async () => {
    window.localStorage.setItem(TOKEN_KEY, playerToken);

    renderApp('/');

    const card = await screen.findByRole('region', { name: 'You vs team median' });

    const frequency = within(card).getByRole('figure', { name: 'COMM FREQUENCY' });
    expect(frequency).toHaveTextContent('21.6');
    expect(frequency).toHaveTextContent('17.22');
    expect(within(card).getByRole('figure', { name: 'ALIGNMENT RATE' })).toHaveTextContent('91.33');
    expect(within(card).getByRole('figure', { name: 'CALLS LOGGED' })).toHaveTextContent('412');

    // Each bar carries a scale rather than filling its track: a rate is drawn
    // against 100, the others against the larger reading plus a quarter again.
    const rate = within(card).getByRole('meter', { name: 'ALIGNMENT RATE' });
    expect(rate).toHaveAttribute('aria-valuenow', '91.33');
    expect(rate).toHaveAttribute('aria-valuemax', '100');
    expect(within(card).getByRole('meter', { name: 'CALLS LOGGED' })).toHaveAttribute(
      'aria-valuemax',
      '515',
    );

    // A player never sees the roster.
    expect(screen.queryByRole('table', { name: 'Team members' })).not.toBeInTheDocument();
    // Screen 07 names the player in the identity block, where 06 names the team.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('playerone');
  });

  it('shows a dash where the pool produced no reading at all', async () => {
    // Nothing in the pool was assessed, and a median needs a population of two.
    server.use(
      http.get(`${env.apiUrl}/dashboard/header`, () =>
        envelope('Dashboard header retrieved.', {
          ...pooledHeader,
          kpi: { ...pooledHeader.kpi, alignment_rate: null },
        }),
      ),
      // A member with no completed transcript anywhere in the pool, on a team
      // whose population is too small for a median (ADR 0011).
      http.get(`${env.apiUrl}/dashboard/players`, () =>
        envelope('Dashboard players retrieved.', {
          ...ownLineAndMedian,
          you: { user_id: 3, comm_frequency: 0, alignment_rate: null, calls_logged: 0 },
          team_median: { comm_frequency: null, alignment_rate: null, calls_logged: null },
        }),
      ),
    );
    window.localStorage.setItem(TOKEN_KEY, playerToken);

    renderApp('/');

    const kpi = await screen.findByRole('region', { name: 'Communication KPI' });
    // A dash, not a zero: no reading is not a reading of none.
    expect(within(kpi).getByRole('figure', { name: 'ALIGNMENT RATE' })).toHaveTextContent('—');
    expect(within(kpi).getByRole('figure', { name: 'ALIGNMENT RATE' })).not.toHaveTextContent('%');

    const card = screen.getByRole('region', { name: 'You vs team median' });
    expect(within(card).getAllByText('MEDIAN —')).toHaveLength(3);
    // A metric with no scale is not a meter, so it claims no range it cannot fill.
    expect(within(card).queryByRole('meter', { name: 'CALLS LOGGED' })).not.toBeInTheDocument();
  });

  it('renders an empty roster as an empty roster, not as a short pool', async () => {
    server.use(
      http.get(`${env.apiUrl}/dashboard/players`, () =>
        envelope('Dashboard players retrieved.', { ...roster, players: [] }),
      ),
    );
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    // A team of coaches has no lines to draw, which is not the short-pool state.
    expect(await screen.findByText('0 ON ROSTER · 0 ONLINE')).toBeInTheDocument();
    expect(screen.queryByText(/insufficient sessions queried for player/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders a short session pool as a deliberate message, not a failure', async () => {
    shortPool();
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    // The server's own wording for each collapsed card, shown rather than replaced.
    expect(
      await screen.findByText('Insufficient sessions queried for KPI of Communication'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Insufficient sessions queried for Communication Mix'),
    ).toBeInTheDocument();
    expect(screen.getByText('Insufficient sessions queried for Player Stats')).toBeInTheDocument();

    // The identity and pool blocks survive the collapse; the data cards do not.
    expect(screen.getByRole('heading', { name: 'Thunderbolts' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Session pool' })).toHaveTextContent(
      'ANALYSED 1 OF 3',
    );
    expect(screen.queryByRole('region', { name: 'Communication KPI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Comm mix' })).not.toBeInTheDocument();

    // A pool shorter than it asked for is a count, not an error.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('still names a player as a player when the pool is too short to shape a body', async () => {
    shortPool();
    window.localStorage.setItem(TOKEN_KEY, playerToken);

    renderApp('/');

    // The short-pool body carries no role signal, so the screen must not fall
    // back to the coach's framing — a fresh database is the demo's first screen.
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('playerone');
    expect(screen.getByText('My dashboard — player')).toBeInTheDocument();
    expect(screen.queryByText('Team dashboard — coach')).not.toBeInTheDocument();
  });

  it('offers a coach the one action that lengthens a short pool, and a player none', async () => {
    shortPool();
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const coach = renderApp('/');

    expect(await screen.findByText(/create a session to start recording/i)).toBeInTheDocument();
    coach.unmount();

    shortPool();
    window.localStorage.setItem(TOKEN_KEY, playerToken);

    renderApp('/');

    expect(await screen.findByRole('region', { name: 'Session pool' })).toBeInTheDocument();
    // A player is never told to do the one thing their role cannot do.
    expect(screen.queryByText(/create a session/i)).not.toBeInTheDocument();
  });

  it('pools the communication numbers over the analysed sessions', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    const kpi = await screen.findByRole('region', { name: 'Communication KPI' });
    // Every reading carries its unit, and none is rounded to look tidier.
    expect(within(kpi).getByRole('figure', { name: 'COMM FREQUENCY' })).toHaveTextContent(
      '18.43/min',
    );
    expect(within(kpi).getByRole('figure', { name: 'ALIGNMENT RATE' })).toHaveTextContent('87.25%');
    // 252481 ms exactly, in the unit the reading is actually in.
    expect(within(kpi).getByRole('figure', { name: 'ABSENCE TOTAL' })).toHaveTextContent(
      '252.481s',
    );
    expect(within(kpi).getByRole('figure', { name: 'CALLS CLASSIFIED' })).toHaveTextContent(
      '1,842calls',
    );
  });

  it('re-reads the numbers when the pool changes, rather than once at mount', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/');

    expect(await screen.findByRole('figure', { name: 'CALLS CLASSIFIED' })).toHaveTextContent(
      '1,842calls',
    );

    // A session reaches analysis-ready, so the pool it all pools over moves.
    server.use(
      http.get(`${env.apiUrl}/dashboard/header`, () =>
        envelope('Dashboard header retrieved.', {
          ...pooledHeader,
          kpi: { ...pooledHeader.kpi, calls_classified: 2014 },
        }),
      ),
    );

    await user.click(screen.getByRole('link', { name: 'Sessions' }));
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));

    await waitFor(() =>
      expect(screen.getByRole('figure', { name: 'CALLS CLASSIFIED' })).toHaveTextContent(
        '2,014calls',
      ),
    );
  });

  it('keeps the team-wide numbers standing when only the breakdown fails', async () => {
    server.use(
      http.get(`${env.apiUrl}/dashboard/players`, () =>
        envelope('The player breakdown could not be loaded.', [], 500),
      ),
    );
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The player breakdown could not be loaded.',
    );
    // One card failing does not cost the screen the numbers that did arrive.
    expect(screen.getByRole('region', { name: 'Communication KPI' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Session pool' })).toBeInTheDocument();
  });

  it('reports a failed dashboard header, and recovers', async () => {
    server.use(
      http.get(`${env.apiUrl}/dashboard/header`, () =>
        envelope('The dashboard could not be loaded.', [], 500),
      ),
    );
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The dashboard could not be loaded.',
    );

    server.use(
      http.get(`${env.apiUrl}/dashboard/header`, () =>
        envelope('Dashboard header retrieved.', pooledHeader),
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('region', { name: 'Communication KPI' })).toBeInTheDocument();
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

  /** The handoff's system rules fix one inward notch per screen, on the flagged
   *  item, so which item carries it is a decision rather than a default (#6). */
  it('flags the live session, and nothing else, when the team has one', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    const flagged = await screen.findAllByRole('img', { name: 'Flagged' });
    expect(flagged).toHaveLength(1);
    expect(flagged[0].closest('section')).toHaveAccessibleName('Live session');
    expect(screen.getByRole('region', { name: 'Live session' })).toHaveTextContent('SESSION_048');
  });

  it('returns the flag to the session pool when no session is live', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/');

    const flagged = await screen.findAllByRole('img', { name: 'Flagged' });
    expect(flagged).toHaveLength(1);
    expect(flagged[0].closest('section')).toHaveAccessibleName('Session pool');
    expect(screen.queryByRole('region', { name: 'Live session' })).not.toBeInTheDocument();
  });

  it('carries a short sessions list in the rail that links on to the full screen', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/');

    const list = await screen.findByRole('list', { name: 'Sessions' });
    // The rail is a summary: the reference draws three items, not the whole list.
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);

    await user.click(screen.getByRole('link', { name: 'All sessions' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Sessions', level: 1 })).toBeInTheDocument(),
    );
    expect(within(await screen.findByRole('list', { name: 'Sessions' })).getAllByRole('listitem'))
      .toHaveLength(5);
  });

  it('opens the live session straight from the dashboard', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/');

    await user.click(await screen.findByRole('link', { name: 'Open session' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Session lobby' })).toBeInTheDocument(),
    );
  });
});
