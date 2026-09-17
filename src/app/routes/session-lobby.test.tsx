import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { env } from '@/config/env';
import { SESSION_EVENTS, sessionChannel } from '@/features/sessions/live';
import {
  assistantCoachToken,
  authToken,
  emptyLobbySession,
  lobbyParticipants,
  lobbySession,
  pastSessions,
  playerToken,
  teamlessToken,
} from '@/testing/mocks/fixtures';
import { envelope, resetSessions } from '@/testing/mocks/handlers';
import { server } from '@/testing/mocks/server';
import { renderApp } from '@/testing/test-utils';
import type { SessionParticipant } from '@/types/api';

const TOKEN_KEY = 'aod.auth.token.v1';
const CHANNEL = sessionChannel(48);

const signIn = (token: string) => window.localStorage.setItem(TOKEN_KEY, token);

/** The grid, once the lobby has settled. */
const openGrid = () => screen.findByRole('list', { name: 'Participants' });

/** `getByText` sees an element's own text nodes only, so a row is found by the
 *  name on it and asserted on the list item around it. */
function rowFor(grid: HTMLElement, username: string): HTMLElement {
  const row = within(grid).getByText(username).closest('li');
  if (!row) throw new Error(`No participant row for ${username}.`);
  return row;
}

/** Move the mock database the way another client would, so the broadcast that
 *  follows announces a change that has actually happened. */
function lobbyHolds(participants: SessionParticipant[], status = 'queuing'): void {
  resetSessions([{ ...lobbySession, status, participants }, ...pastSessions]);
}

const asReady = (rows: SessionParticipant[]) =>
  rows.map((row) => ({ ...row, participant_status: 'ready' }));

const joined = (
  user_id: number,
  username: string,
  participant_status: string,
): SessionParticipant => ({
  user_id,
  username,
  participant_role: 'player',
  participant_status,
  joined_at: '2026-09-16T18:20:00.000000Z',
  left_at: null,
  aod: null,
  vod: null,
});

/** Every request that left, from the moment this was called. */
function recordRequests(): string[] {
  const calls: string[] = [];
  server.events.on('request:start', ({ request }) => {
    calls.push(`${request.method} ${new URL(request.url).pathname}`);
  });
  return calls;
}

afterEach(() => server.events.removeAllListeners());

/** The lobby, driven at the route with the network mocked at the HTTP boundary
 *  and the live-updates port supplied as a double (spec #38). The double is an
 *  input; the only assertions on it are the two on subscribe and release. */
describe('the session lobby', () => {
  it('joins the caller on arrival, with no join control to press', async () => {
    const calls = recordRequests();
    signIn(assistantCoachToken);

    renderApp('/sessions/48');

    const grid = await openGrid();
    await waitFor(() => expect(rowFor(grid, 'assistantcoach')).toHaveTextContent('READY'));

    expect(calls).toContain('POST /api/sessions/48/join');
    expect(screen.queryByRole('button', { name: 'Join session' })).not.toBeInTheDocument();
  });

  it('draws a rostered member who has not joined, distinctly from one who has', async () => {
    signIn(authToken);

    renderApp('/sessions/48');

    const grid = await openGrid();
    await waitFor(() => expect(within(grid).getAllByRole('listitem')).toHaveLength(5));

    expect(rowFor(grid, 'playertwo')).toHaveTextContent('NOT JOINED YET');
    expect(rowFor(grid, 'playerone')).toHaveTextContent('NEEDS: CONSENT');
    // Someone in the session who is no longer on the roster still holds the
    // gate, so they are drawn rather than dropped.
    expect(rowFor(grid, 'formermember')).toHaveTextContent('READY');
  });

  it('counts joined players rather than the roster', async () => {
    signIn(authToken);

    renderApp('/sessions/48');

    await openGrid();

    // Five rows, of which two are joined players and one of those has agreed.
    // Counting the roster would read 1 / 3 and counting rows 1 / 5.
    expect(screen.getByRole('figure', { name: 'Players ready' })).toHaveTextContent('1 / 2');
  });

  it('shows a participant who joins without a refresh', async () => {
    signIn(authToken);
    const { live } = renderApp('/sessions/48');

    const grid = await openGrid();
    expect(rowFor(grid, 'playertwo')).toHaveTextContent('NOT JOINED YET');

    lobbyHolds([...lobbyParticipants, joined(4, 'playertwo', 'needs_consent')]);
    live.emit(CHANNEL, SESSION_EVENTS.participantJoined);

    await waitFor(() => expect(rowFor(grid, 'playertwo')).toHaveTextContent('NEEDS: CONSENT'));
  });

  it('propagates a participant agreeing the same way', async () => {
    signIn(authToken);
    const { live } = renderApp('/sessions/48');

    const grid = await openGrid();
    expect(rowFor(grid, 'playerone')).toHaveTextContent('NEEDS: CONSENT');

    lobbyHolds(asReady(lobbyParticipants));
    live.emit(CHANNEL, SESSION_EVENTS.participantStatusChanged);

    await waitFor(() => expect(rowFor(grid, 'playerone')).toHaveTextContent('READY'));
    expect(screen.getByRole('figure', { name: 'Players ready' })).toHaveTextContent('2 / 2');
  });

  it('drops a participant who leaves back to not joined', async () => {
    signIn(authToken);
    const { live } = renderApp('/sessions/48');

    const grid = await openGrid();
    expect(rowFor(grid, 'playerone')).toHaveTextContent('NEEDS: CONSENT');

    lobbyHolds(lobbyParticipants.filter((row) => row.user_id !== 3));
    live.emit(CHANNEL, SESSION_EVENTS.participantLeft);

    await waitFor(() => expect(rowFor(grid, 'playerone')).toHaveTextContent('NOT JOINED YET'));
    expect(screen.getByRole('figure', { name: 'Players ready' })).toHaveTextContent('1 / 1');
  });

  it('releases the channel on the way out, and returns with one row per participant', async () => {
    signIn(authToken);
    const { user, live } = renderApp('/sessions/48');

    await openGrid();
    expect(live.openChannels()).toEqual([CHANNEL]);

    await user.click(screen.getByRole('link', { name: 'Sessions' }));
    await screen.findByRole('heading', { name: 'Sessions' });

    expect(live.openChannels()).toEqual([]);
    expect(live.released).toEqual([CHANNEL]);

    const list = await screen.findByRole('list', { name: 'Sessions' });
    await user.click(within(list).getByText('SESSION_048').closest('a') as HTMLElement);

    const grid = await openGrid();
    await waitFor(() => expect(within(grid).getAllByRole('listitem')).toHaveLength(5));
    expect(within(grid).getAllByText('playerone')).toHaveLength(1);
    expect(live.openChannels()).toEqual([CHANNEL]);
  });

  it('ignores an event that arrives after the screen has gone', async () => {
    signIn(authToken);
    const { user, live } = renderApp('/sessions/48');

    await openGrid();
    await user.click(screen.getByRole('link', { name: 'Sessions' }));
    await screen.findByRole('heading', { name: 'Sessions' });

    const calls = recordRequests();
    live.emit(CHANNEL, SESSION_EVENTS.participantJoined);

    expect(live.openChannels()).toEqual([]);
    expect(calls.filter((call) => call === 'GET /api/sessions/48')).toHaveLength(0);
    expect(screen.queryByRole('list', { name: 'Participants' })).not.toBeInTheDocument();
  });

  it('asks a player to agree, and turns the panel into a reading once they have', async () => {
    signIn(playerToken);
    const { user } = renderApp('/sessions/48');

    const grid = await openGrid();
    expect(rowFor(grid, 'playerone')).toHaveTextContent('NEEDS: CONSENT');

    const panel = screen.getByRole('region', { name: 'Consent' });
    expect(panel).toHaveTextContent('Your mic and screen are recorded for this session');
    expect(panel).toHaveTextContent('CONSENT REQUIRED BEFORE YOUR TRACK OPENS');

    await user.click(within(panel).getByRole('checkbox'));
    await user.click(within(panel).getByRole('button', { name: 'Accept & continue' }));

    await waitFor(() => expect(rowFor(grid, 'playerone')).toHaveTextContent('READY'));

    const settled = screen.getByRole('region', { name: 'Consent' });
    expect(settled).toHaveTextContent('CONSENT GRANTED');
    expect(within(settled).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(within(settled).queryByRole('button')).not.toBeInTheDocument();
    // The design promises a withdrawal the status machine cannot deliver.
    expect(settled).not.toHaveTextContent('WITHDRAW');
  });

  it('asks a player who leaves and comes back to agree again', async () => {
    signIn(playerToken);
    const { user } = renderApp('/sessions/48');

    const panel = await screen.findByRole('region', { name: 'Consent' });
    await user.click(within(panel).getByRole('checkbox'));
    await user.click(within(panel).getByRole('button', { name: 'Accept & continue' }));
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Consent' })).toHaveTextContent('CONSENT GRANTED'),
    );

    await user.click(screen.getByRole('button', { name: 'Leave session' }));
    await screen.findByRole('heading', { name: 'Sessions' });

    const list = await screen.findByRole('list', { name: 'Sessions' });
    await user.click(within(list).getByText('SESSION_048').closest('a') as HTMLElement);

    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Consent' })).toHaveTextContent(
        'CONSENT REQUIRED BEFORE YOUR TRACK OPENS',
      ),
    );
  });

  it('offers a coach no consent panel, since there is nothing for one to agree to', async () => {
    signIn(authToken);

    renderApp('/sessions/48');

    await openGrid();
    expect(screen.queryByRole('region', { name: 'Consent' })).not.toBeInTheDocument();
  });

  it('withholds the start with no players, and names the reason', async () => {
    resetSessions([emptyLobbySession, ...pastSessions]);
    signIn(authToken);

    renderApp('/sessions/48');

    const start = await screen.findByRole('button', { name: 'Start recording' });
    expect(start).toBeDisabled();
    expect(screen.getByText('No players have joined yet.')).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: 'Players ready' })).toHaveTextContent('0 / 0');
  });

  it('withholds the start while a joined player has not agreed, and counts them', async () => {
    signIn(authToken);

    renderApp('/sessions/48');

    const start = await screen.findByRole('button', { name: 'Start recording' });
    expect(start).toBeDisabled();
    expect(screen.getByText('1 player has not agreed to be recorded yet.')).toBeInTheDocument();
    // The control names the count; the grid names the person it refers to.
    expect(rowFor(await openGrid(), 'playerone')).toHaveTextContent('NEEDS: CONSENT');
  });

  it('offers the start to an assistant coach as well as the main one', async () => {
    lobbyHolds(asReady(lobbyParticipants));
    signIn(assistantCoachToken);

    renderApp('/sessions/48');

    const start = await screen.findByRole('button', { name: 'Start recording' });
    await waitFor(() => expect(start).toBeEnabled());
  });

  it('offers a player neither start, cancel, nor the team settings', async () => {
    signIn(playerToken);

    renderApp('/sessions/48');

    await openGrid();
    expect(screen.queryByRole('button', { name: 'Start recording' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel session' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Team settings' })).not.toBeInTheDocument();
  });

  it('draws the server refusing a start rather than coming down on it', async () => {
    lobbyHolds(asReady(lobbyParticipants));
    server.use(
      http.post(`${env.apiUrl}/sessions/:sessionId/start`, () =>
        envelope('Only a queuing session can be started.', [], 422),
      ),
    );
    signIn(authToken);
    const { user } = renderApp('/sessions/48');

    const start = await screen.findByRole('button', { name: 'Start recording' });
    await waitFor(() => expect(start).toBeEnabled());
    await user.click(start);

    expect(await screen.findByText('Only a queuing session can be started.')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Participants' })).toBeInTheDocument();
  });

  it('takes a client whose session starts elsewhere to recording', async () => {
    signIn(playerToken);
    const { live } = renderApp('/sessions/48');

    await openGrid();

    lobbyHolds(asReady(lobbyParticipants), 'in_progress');
    live.emit(CHANNEL, SESSION_EVENTS.sessionStatusChanged);

    // The Screen is replaced, not the route, for the third time (spec #40).
    expect(await screen.findByRole('list', { name: 'Capture status' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Participants' })).not.toBeInTheDocument();
  });

  it('takes the coach who cancels to the terminal statement', async () => {
    signIn(authToken);
    const { user } = renderApp('/sessions/48');

    await openGrid();
    await user.click(screen.getByRole('button', { name: 'Cancel session' }));

    expect(await screen.findByText('SESSION:CANCELLED')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Participants' })).not.toBeInTheDocument();
  });

  it('takes a second client to that same statement from the broadcast alone', async () => {
    signIn(playerToken);
    const { live } = renderApp('/sessions/48');

    await openGrid();

    lobbyHolds(lobbyParticipants, 'cancelled');
    live.emit(CHANNEL, SESSION_EVENTS.sessionStatusChanged);

    expect(await screen.findByText('SESSION:CANCELLED')).toBeInTheDocument();
  });

  it('says a dropped connection in the lobby and in the shell at once', async () => {
    signIn(authToken);
    const { live } = renderApp('/sessions/48');

    await openGrid();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('LIVE:OK')).toBeInTheDocument();

    live.setStatus('disconnected');

    expect(await screen.findByText('CONNECTION LOST')).toBeInTheDocument();
    expect(screen.getByText('LIVE:DOWN')).toBeInTheDocument();
  });

  it('holds a row that genuinely disappears, then lets it go', async () => {
    signIn(authToken);
    const { live } = renderApp('/sessions/48');

    const grid = await openGrid();
    // The one row that is a participant and not a roster member, so leaving
    // removes it rather than moving it to NOT JOINED YET.
    expect(rowFor(grid, 'formermember')).toBeInTheDocument();

    lobbyHolds(lobbyParticipants.filter((row) => row.user_id !== 7));
    live.emit(CHANNEL, SESSION_EVENTS.participantLeft);

    // The hold is one animation long and then over: a row that outlived its
    // data would be this screen's own named failure mode.
    await waitFor(() => expect(within(grid).queryByText('formermember')).not.toBeInTheDocument());
    expect(within(grid).getAllByRole('listitem')).toHaveLength(4);
  });

  it('refuses a session the caller is not an active member of, legibly', async () => {
    signIn(teamlessToken);

    renderApp('/sessions/48');

    // SessionPolicy::view denies an outsider as not found, so the server's own
    // message is the legible one and the shell stays up around it.
    expect(await screen.findByRole('alert')).toHaveTextContent('Not found.');
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Participants' })).not.toBeInTheDocument();
  });

  it('renders with no broadcast credentials, reading disconnected rather than OK', async () => {
    signIn(authToken);

    renderApp('/sessions/48', { connection: 'disconnected' });

    await openGrid();
    expect(screen.getByText('CONNECTION LOST')).toBeInTheDocument();
    expect(screen.getByText('LIVE:DOWN')).toBeInTheDocument();
  });
});

/** Team-wide settings, composed into the lobby rail. The same module `/settings`
 *  will compose when that Screen is written. */
describe('the team settings the lobby composes', () => {
  /** Open the editor. Editing is a drawer, so the forms are in the dialog and
   *  the readings stay on the rail panel behind it. */
  async function openSettings(user: ReturnType<typeof renderApp>['user']) {
    const panel = await screen.findByRole('region', { name: 'Team settings' });
    await waitFor(() => expect(panel).toHaveTextContent('5000 ms'));
    await user.click(within(panel).getByRole('button', { name: 'Edit settings' }));
    return { panel, drawer: await screen.findByRole('dialog', { name: 'Team settings' }) };
  }

  it('reads the threshold and both keyword categories', async () => {
    signIn(authToken);

    renderApp('/sessions/48');

    const panel = await screen.findByRole('region', { name: 'Team settings' });
    await waitFor(() => expect(panel).toHaveTextContent('5000 ms'));

    // Two categories, not the design's four, and the copy says whose they are.
    expect(panel).toHaveTextContent('Informative keywords');
    expect(panel).toHaveTextContent('4 WORDS');
    expect(panel).toHaveTextContent('Declarative keywords');
    expect(panel).toHaveTextContent('3 WORDS');
    expect(panel).toHaveTextContent('every session this team runs');
  });

  it('persists an edited threshold', async () => {
    signIn(authToken);
    const { user } = renderApp('/sessions/48');

    const { panel, drawer } = await openSettings(user);

    const field = within(drawer).getByLabelText('Dead air threshold');
    await user.clear(field);
    await user.type(field, '4000');
    await user.click(within(drawer).getByRole('button', { name: 'Save threshold' }));

    // The reading behind the drawer is what has to move.
    await waitFor(() => expect(panel).toHaveTextContent('4000 ms'));
  });

  it('closes the drawer, leaving the readings on the rail', async () => {
    signIn(authToken);
    const { user } = renderApp('/sessions/48');

    const { panel, drawer } = await openSettings(user);
    expect(within(drawer).getByLabelText('Dead air threshold')).toBeInTheDocument();

    await user.click(within(drawer).getByRole('button', { name: 'Close' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Team settings' })).not.toBeInTheDocument(),
    );
    expect(panel).toHaveTextContent('5000 ms');
  });

  it('persists an added keyword', async () => {
    signIn(authToken);
    const { user } = renderApp('/sessions/48');

    const { panel, drawer } = await openSettings(user);
    const group = within(drawer).getByRole('group', { name: 'Informative keywords' });

    await user.type(within(group).getByLabelText('Add to informative keywords'), 'lurking');
    await user.click(within(group).getByRole('button', { name: 'Add' }));
    await user.click(within(drawer).getByRole('button', { name: 'Save keywords' }));

    await waitFor(() => expect(panel).toHaveTextContent('5 WORDS'));
  });

  it('refuses a keyword the server would refuse, before any request leaves', async () => {
    signIn(authToken);
    const { user } = renderApp('/sessions/48');

    const { drawer } = await openSettings(user);
    const group = within(drawer).getByRole('group', { name: 'Informative keywords' });
    const field = within(group).getByLabelText('Add to informative keywords');
    const add = within(group).getByRole('button', { name: 'Add' });

    const calls = recordRequests();

    await user.type(field, 'a b');
    await user.click(add);
    expect(within(group).getByRole('alert')).toHaveTextContent('cannot contain a space');

    await user.clear(field);
    await user.type(field, 'smoked');
    await user.click(add);
    expect(within(group).getByRole('alert')).toHaveTextContent('already lists that keyword');

    await user.clear(field);
    await user.type(field, 'holding');
    await user.click(add);
    expect(within(group).getByRole('alert')).toHaveTextContent('already in the other category');

    expect(calls.filter((call) => call.startsWith('PUT'))).toHaveLength(0);
  });

  it('lands the server objection to a settings field on that field', async () => {
    server.use(
      http.put(`${env.apiUrl}/teams/settings`, () =>
        envelope(
          'The given data was invalid.',
          {
            errors: {
              dead_air_threshold_ms: ['The dead air threshold ms field must be at least 1.'],
            },
          },
          422,
        ),
      ),
    );
    signIn(authToken);
    const { user } = renderApp('/sessions/48');

    const { drawer } = await openSettings(user);
    await user.click(within(drawer).getByRole('button', { name: 'Save threshold' }));

    expect(await within(drawer).findByRole('alert')).toHaveTextContent('must be at least 1');
    expect(within(drawer).getByLabelText('Dead air threshold')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
