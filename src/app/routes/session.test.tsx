import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { authToken, pastSessions, recordingSession } from '@/testing/mocks/fixtures';
import { resetSessions } from '@/testing/mocks/handlers';
import { renderApp } from '@/testing/test-utils';

const TOKEN_KEY = 'aod.auth.token.v1';

/** Opening a Session is one route that dispatches on its status (spec #33). The
 *  lobby (#5) and recording (#7) are Screens at that route and the Review Board
 *  is still a placeholder; each Screen's own behaviour has its own file. */
describe('opening a session', () => {
  it('sends a queuing session to the lobby', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions/48');

    expect(await screen.findByRole('heading', { name: 'Scrim vs Ronin Squad' })).toBeInTheDocument();
    expect(screen.getByText('Session lobby')).toBeInTheDocument();
    expect(screen.getByText('SESSION_048')).toBeInTheDocument();
  });

  it('sends a session already recording to the recording screen', async () => {
    resetSessions([recordingSession, ...pastSessions]);
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions/49');

    expect(await screen.findByRole('heading', { name: 'Scrim vs Kestrel' })).toBeInTheDocument();
    expect(await screen.findByRole('list', { name: 'Capture status' })).toBeInTheDocument();
  });

  it('sends a session under review to the review board', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions/47');

    expect(await screen.findByRole('heading', { name: 'Review board' })).toBeInTheDocument();
  });

  it('sends an analysed session to the same review board, leaving the gate to the server', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions/45');

    expect(await screen.findByRole('heading', { name: 'Review board' })).toBeInTheDocument();
  });

  it('states plainly that a cancelled session was cancelled', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions/46');

    expect(await screen.findByRole('heading', { name: 'Scrim vs Halcyon' })).toBeInTheDocument();
    expect(screen.getByText('SESSION:CANCELLED')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains a processing session rather than leaking the endpoint refusal', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    // Arrived at directly, not from the list, so the client has no prior
    // knowledge of the status — the path a shared link and a refresh take.
    renderApp('/sessions/44');

    expect(await screen.findByRole('heading', { name: 'Scrim vs Vertex GG' })).toBeInTheDocument();
    expect(screen.getByText('TRANSCRIBED 2 OF 5')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('refuses a session that does not exist without taking the screen down', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    renderApp('/sessions/999');

    expect(await screen.findByRole('alert')).toHaveTextContent('Not found.');
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
  });

  it('opens the session a person clicks in the list', async () => {
    window.localStorage.setItem(TOKEN_KEY, authToken);

    const { user } = renderApp('/sessions');

    const list = await screen.findByRole('list', { name: 'Sessions' });
    const cancelled = within(list).getByText('SESSION_046').closest('a');
    await user.click(cancelled as HTMLElement);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Scrim vs Halcyon' })).toBeInTheDocument(),
    );
  });
});
