import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { delay, http } from 'msw';
import { env } from '@/config/env';
import { envelope, resetSessions } from '@/testing/mocks/handlers';
import {
  assistantCoachToken,
  authToken,
  pastSessions,
  playerToken,
  recordingSession,
} from '@/testing/mocks/fixtures';
import { server } from '@/testing/mocks/server';
import { renderApp } from '@/testing/test-utils';

const TOKEN_KEY = 'aod.auth.token.v1';

/** The session codes on the screen, top to bottom. Reading the codes rather than
 *  the names keeps the ordering assertion on the one field that is unique. */
async function listedCodes(): Promise<string[]> {
  const list = await screen.findByRole('list', { name: 'Sessions' });
  return within(list)
    .getAllByRole('listitem')
    .map((item) => within(item).getByText(/^SESSION_/).textContent ?? '');
}

/** The row a Session code sits on, so an assertion can be made about that one
 *  Session rather than about the whole list. */
function itemFor(list: HTMLElement, code: string): HTMLElement {
  const item = within(list).getByText(code).closest('li');
  if (!item) throw new Error(`${code} is not on a list item`);
  return item;
}

/** Same seam as #3 and #4 (#14): render a route with the network mocked at the
 *  HTTP boundary and read what a person would see. */
describe('the sessions screen', () => {
  it('puts the live session first and the rest most recent first', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions');

    // The fixture's past sessions are date-descending but NOT id-ordered, so a
    // screen that sorted by anything of its own would disagree with this.
    await waitFor(async () =>
      expect(await listedCodes()).toEqual([
        'SESSION_048',
        'SESSION_044',
        'SESSION_047',
        'SESSION_045',
        'SESSION_046',
      ]),
    );
  });

  it('names every state a session can be in, including the two nothing else produces', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions');

    const list = await screen.findByRole('list', { name: 'Sessions' });
    expect(itemFor(list, 'SESSION_048')).toHaveTextContent('LOBBY');
    expect(itemFor(list, 'SESSION_044')).toHaveTextContent('PROCESSING');
    expect(itemFor(list, 'SESSION_047')).toHaveTextContent('IN REVIEW');
    expect(itemFor(list, 'SESSION_045')).toHaveTextContent('ANALYSED');
    expect(itemFor(list, 'SESSION_046')).toHaveTextContent('CANCELLED');
  });

  it('marks the live session as recording once it has started', async () => {
    // in_progress is non-terminal, so it can only ever arrive in the live slot —
    // the list never carries it beside a queuing session.
    resetSessions([recordingSession, ...pastSessions]);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions');

    const list = await screen.findByRole('list', { name: 'Sessions' });
    expect(itemFor(list, 'SESSION_049')).toHaveTextContent('RECORDING');
  });

  it('reads a processing session as working rather than broken', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions');

    const list = await screen.findByRole('list', { name: 'Sessions' });
    expect(itemFor(list, 'SESSION_044')).toHaveTextContent('TRANSCRIBED 2 OF 5');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('dates each session so two similar names can be told apart', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions');

    const list = await screen.findByRole('list', { name: 'Sessions' });
    expect(itemFor(list, 'SESSION_045')).toHaveTextContent('SEP 13, 2026');
  });

  it('points a coach on an empty team at creating the first session', async () => {
    resetSessions([]);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions');

    expect(await screen.findByRole('heading', { name: 'No sessions yet' })).toBeInTheDocument();
    expect(screen.getByText(/start recording against it/i)).toBeInTheDocument();
  });

  it('tells a player on an empty team that a coach starts sessions', async () => {
    resetSessions([]);
    window.localStorage.setItem(TOKEN_KEY, playerToken);

    renderApp('/sessions');

    expect(await screen.findByRole('heading', { name: 'No sessions yet' })).toBeInTheDocument();
    expect(screen.getByText(/a coach starts sessions/i)).toBeInTheDocument();
  });

  it('reports a failed index with a retry, and recovers on it', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);
    server.use(
      http.get(`${env.apiUrl}/teams/:teamId/sessions`, () =>
        envelope('The sessions could not be retrieved.', [], 500),
      ),
    );

    const { user } = renderApp('/sessions');

    const failure = await screen.findByRole('alert');
    expect(failure).toHaveTextContent('The sessions could not be retrieved.');

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('list', { name: 'Sessions' })).toBeInTheDocument();
  });

  it('lets a coach name a session and shows it in the list', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/sessions');

    await user.type(await screen.findByLabelText('SESSION NAME'), 'Scrim A');
    await user.click(screen.getByRole('button', { name: 'Create session' }));

    expect(await screen.findByText('Scrim A')).toBeInTheDocument();
  });

  it('lets an assistant coach create one too, since running a scrim is not the main coach alone', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, assistantCoachToken);

    const { user } = renderApp('/sessions');

    await user.type(await screen.findByLabelText('SESSION NAME'), 'Scrim B');
    await user.click(screen.getByRole('button', { name: 'Create session' }));

    expect(await screen.findByText('Scrim B')).toBeInTheDocument();
  });

  it('does not offer a player the control at all', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, playerToken);

    renderApp('/sessions');

    await screen.findByRole('list', { name: 'Sessions' });
    expect(screen.queryByLabelText('SESSION NAME')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create session' })).not.toBeInTheDocument();
  });

  it('sends the name as the one field the endpoint takes', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    let sent: unknown = null;
    server.use(
      http.post(`${env.apiUrl}/teams/:teamId/sessions`, async ({ request }) => {
        sent = await request.json();
        return envelope('Session created.', { session: recordingSession }, 201);
      }),
    );

    const { user } = renderApp('/sessions');

    await user.type(await screen.findByLabelText('SESSION NAME'), 'Scrim C');
    await user.click(screen.getByRole('button', { name: 'Create session' }));

    await waitFor(() => expect(sent).toEqual({ session_name: 'Scrim C' }));
  });

  it('withholds the control while the team already has a session open, and says why', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions');

    await screen.findByRole('list', { name: 'Sessions' });
    expect(screen.queryByRole('button', { name: 'Create session' })).not.toBeInTheDocument();
    // The notice names the session holding the slot, so the reason is legible
    // rather than the control merely being absent.
    expect(screen.getByText(/one session at a time/i)).toHaveTextContent('SESSION_048');
  });

  it('handles the refusal of a second session when the server gets there first', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    // A capability hides a control and never grants one (ADR 0007): two coaches
    // racing must both get a legible answer rather than one getting a crash.
    server.use(
      http.post(`${env.apiUrl}/teams/:teamId/sessions`, () =>
        envelope('This team already has an active session.', [], 422),
      ),
    );

    const { user } = renderApp('/sessions');

    await user.type(await screen.findByLabelText('SESSION NAME'), 'Scrim D');
    await user.click(screen.getByRole('button', { name: 'Create session' }));

    expect(await screen.findByText('This team already has an active session.')).toBeInTheDocument();
  });

  it('lands the server objection to a name on the name field', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    server.use(
      http.post(`${env.apiUrl}/teams/:teamId/sessions`, () =>
        envelope(
          'The given data was invalid.',
          { errors: { session_name: ['The session name field is required.'] } },
          422,
        ),
      ),
    );

    const { user } = renderApp('/sessions');

    const field = await screen.findByLabelText('SESSION NAME');
    await user.type(field, 'Scrim E');
    await user.click(screen.getByRole('button', { name: 'Create session' }));

    expect(await screen.findByText('The session name field is required.')).toBeInTheDocument();
    await waitFor(() => expect(field).toHaveAccessibleDescription(/session name field is required/i));
  });

  it('will not create the same session twice on a double click', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    let attempts = 0;
    server.use(
      http.post(`${env.apiUrl}/teams/:teamId/sessions`, async () => {
        attempts += 1;
        await delay(200);
        return envelope('Session created.', { session: recordingSession }, 201);
      }),
    );

    const { user } = renderApp('/sessions');

    await user.type(await screen.findByLabelText('SESSION NAME'), 'Scrim F');
    const create = screen.getByRole('button', { name: 'Create session' });
    await user.click(create);
    await user.click(create);

    await waitFor(() => expect(create).toBeEnabled());
    expect(attempts).toBe(1);
  });

  it('stops a name longer than the field allows before a request is made', async () => {
    resetSessions(pastSessions);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    let sent: { session_name?: string } | null = null;
    server.use(
      http.post(`${env.apiUrl}/teams/:teamId/sessions`, async ({ request }) => {
        sent = (await request.json()) as { session_name: string };
        return envelope('Session created.', { session: recordingSession }, 201);
      }),
    );

    const { user } = renderApp('/sessions');

    const field = await screen.findByLabelText('SESSION NAME');
    await user.click(field);
    await user.paste('S'.repeat(300));

    // 255 is StoreSessionRequest's limit; the field never holds more, so the
    // over-long name cannot reach the server at all.
    expect(field).toHaveValue('S'.repeat(255));

    await user.click(screen.getByRole('button', { name: 'Create session' }));
    await waitFor(() => expect(sent?.session_name).toHaveLength(255));
  });
});
