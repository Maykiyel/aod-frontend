import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { env } from '@/config/env';
import { SESSION_EVENTS, sessionChannel } from '@/features/sessions/live';
import {
  assistantCoachToken,
  authToken,
  cancelledSession,
  pastSessions,
  playerToken,
  recordingParticipants,
  recordingSession,
} from '@/testing/mocks/fixtures';
import { envelope, resetSessions } from '@/testing/mocks/handlers';
import { server } from '@/testing/mocks/server';
import { renderApp } from '@/testing/test-utils';
import type { SessionParticipant } from '@/types/api';

const TOKEN_KEY = 'aod.auth.token.v1';
const SESSION_ID = 49;
const CHANNEL = sessionChannel(SESSION_ID);
const PATH = `/sessions/${SESSION_ID}`;

const signIn = (token: string) => window.localStorage.setItem(TOKEN_KEY, token);

/** Put the mock database at a given point in the run, the way another client
 *  would, so the broadcast that follows announces a change that has happened. */
function runHolds(participants: SessionParticipant[], status = 'in_progress'): void {
  resetSessions([{ ...recordingSession, status, participants }, ...pastSessions]);
}

/** The table, once the Screen has settled. */
const openTable = () => screen.findByRole('list', { name: 'Capture status' });

function rowFor(table: HTMLElement, username: string): HTMLElement {
  const row = within(table).getByText(username).closest('li');
  if (!row) throw new Error(`No capture row for ${username}.`);
  return row;
}

/** Exact, because CAPTURING is a substring of NOT CAPTURING: a reading asserted
 *  loosely here would agree with the one state it is meant to separate. */
function reads(table: HTMLElement, username: string, reading: string): void {
  expect(within(rowFor(table, username)).getByText(reading)).toBeInTheDocument();
}

/** Every request that left, from the moment this was called. */
function recordRequests(): string[] {
  const calls: string[] = [];
  server.events.on('request:start', ({ request }) => {
    calls.push(`${request.method} ${new URL(request.url).pathname}`);
  });
  return calls;
}

/** The same, with bodies, for the one assertion that is about what was asked
 *  for rather than which endpoint was called. */
function recordBodies(): Array<{ path: string; body: string }> {
  const calls: Array<{ path: string; body: string }> = [];
  server.events.on('request:start', ({ request }) => {
    const path = new URL(request.url).pathname;
    void request
      .clone()
      .text()
      .then((body) => calls.push({ path, body }));
  });
  return calls;
}

/** A player with a live recorder, which is the state most of these start from.
 *  The click is the gesture `getDisplayMedia` requires, so there is no way to
 *  reach it without pressing the control a player presses. */
async function startCapturing(user: ReturnType<typeof renderApp>['user']) {
  await user.click(await screen.findByRole('button', { name: 'Start capturing' }));
  return screen.findByRole('figure', { name: 'Elapsed recording time' });
}

afterEach(() => server.events.removeAllListeners());

/** Recording, driven at the route with the network mocked at the HTTP boundary
 *  and both declared ports supplied as doubles (spec #40). The capture double is
 *  an input; the only assertions on it are the ones rendering cannot show. */
describe('capturing a session', () => {
  it('opens the recording screen rather than the placeholder', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);

    renderApp(PATH);

    expect(await screen.findByRole('heading', { name: 'Scrim vs Kestrel' })).toBeInTheDocument();
    expect(await openTable()).toBeInTheDocument();
    expect(screen.queryByText(/No view has been built/)).not.toBeInTheDocument();
  });

  it('asks the port for both permissions, then tells the server it is recording', async () => {
    runHolds(recordingParticipants);
    const calls = recordRequests();
    signIn(playerToken);
    const { user, capture } = renderApp(PATH);

    await startCapturing(user);

    expect(capture.started).toEqual([SESSION_ID]);
    await waitFor(() => expect(calls).toContain('POST /api/sessions/49/start-recording'));
  });

  it('reads a refused microphone as not capturing, and offers the retry', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user } = renderApp(PATH, { capture: (double) => double.refuse('microphone') });

    await user.click(await screen.findByRole('button', { name: 'Start capturing' }));

    const panel = screen.getByRole('region', { name: 'Your capture' });
    await waitFor(() => expect(panel).toHaveTextContent('NOT CAPTURING'));
    // A fact about what is being recorded, not a failure of the player's.
    expect(panel).toHaveTextContent('Your microphone was not granted');
    expect(within(panel).queryByRole('alert')).not.toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('names the browser control when the refusal is one the browser remembered', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user } = renderApp(PATH, {
      capture: (double) => double.refuse('microphone', 'blocked'),
    });

    await user.click(await screen.findByRole('button', { name: 'Start capturing' }));

    const panel = screen.getByRole('region', { name: 'Your capture' });
    await waitFor(() => expect(panel).toHaveTextContent('Your browser has remembered'));

    // The retry is still offered, and still says where the real control is
    // rather than failing silently a second time.
    await user.click(within(panel).getByRole('button', { name: 'Try again' }));

    expect(panel).toHaveTextContent('permission control beside the address bar');
    expect(
      screen.queryByRole('figure', { name: 'Elapsed recording time' }),
    ).not.toBeInTheDocument();
  });

  it('recovers when a refusal is granted on the retry', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user, capture } = renderApp(PATH, {
      capture: (double) => double.refuse('display'),
    });

    await user.click(await screen.findByRole('button', { name: 'Start capturing' }));
    const retry = await screen.findByRole('button', { name: 'Try again' });

    capture.allow('display');
    await user.click(retry);

    expect(await screen.findByRole('figure', { name: 'Elapsed recording time' })).toBeInTheDocument();
  });

  it('moves the level meter with the level the port reports, and not otherwise', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user, capture } = renderApp(PATH);

    await startCapturing(user);

    const panel = screen.getByRole('region', { name: 'Your capture' });
    expect(panel).toHaveTextContent('NO SIGNAL — DEVICE LEVEL ONLY');
    const quiet = panel.querySelectorAll('[data-lit]').length;

    capture.setLevel(0.8);

    await waitFor(() => expect(panel).toHaveTextContent('SIGNAL PRESENT — DEVICE LEVEL ONLY'));
    expect(panel.querySelectorAll('[data-lit]').length).toBeGreaterThan(quiet);

    capture.setLevel(0);

    await waitFor(() => expect(panel).toHaveTextContent('NO SIGNAL — DEVICE LEVEL ONLY'));
    expect(panel.querySelectorAll('[data-lit]')).toHaveLength(quiet);
  });

  it('reads the devices the port reports rather than anything on the screen', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user } = renderApp(PATH);

    await startCapturing(user);

    const panel = screen.getByRole('region', { name: 'Your capture' });
    expect(panel).toHaveTextContent('SHURE MV7 — 48 kHz');
    expect(panel).toHaveTextContent('VALORANT — 1080p30');
  });

  it('says a microphone that stopped mid-run, rather than drawing a live meter', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user, capture } = renderApp(PATH);

    await startCapturing(user);
    capture.setLevel(0.9);
    const panel = screen.getByRole('region', { name: 'Your capture' });
    await waitFor(() => expect(panel).toHaveTextContent('SIGNAL PRESENT'));

    capture.endTrack('microphone');

    expect(await within(panel).findByRole('alert')).toHaveTextContent('Your microphone stopped');
    expect(panel).toHaveTextContent('NO SIGNAL — DEVICE LEVEL ONLY');
  });

  it("counts the clock from the recorder's zero, not from when the screen mounted", async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    // Two minutes and five seconds of recording already behind this browser,
    // which is what a reload mid-run leaves. Counting from mount reads 00:00:00.
    const { user, capture } = renderApp(PATH);

    await screen.findByRole('button', { name: 'Start capturing' });
    capture.setStartedAt(new Date(Date.now() - 125_500).toISOString());
    const elapsed = await startCapturing(user);

    // Seconds of slack for the click and the render between them; mounting is
    // what this separates from, and mounting would read 00:00:00.
    expect(elapsed).toHaveTextContent(/^00:02:0[5-9]/);
    expect(elapsed).toHaveTextContent('ELAPSED ON YOUR RECORDING');
    // The design labels it ELAPSED ON SESSION CLOCK. It is not a session clock.
    expect(elapsed).not.toHaveTextContent('SESSION CLOCK');
  });
});

describe('the coach watching a run', () => {
  it('draws all four capture states, from one fixture that carries all four', async () => {
    runHolds(recordingParticipants);
    signIn(authToken);

    renderApp(PATH);

    const table = await openTable();
    reads(table, 'playerone', 'CAPTURING');
    reads(table, 'sidelined', 'NOT CAPTURING');
    reads(table, 'unagreed', 'NOT AGREED');
    reads(table, 'playertwo', 'NOT JOINED');
    // A coach never records, so a row that could never read CAPTURING is noise.
    expect(within(table).queryByText('maincoach')).not.toBeInTheDocument();
    expect(screen.getByRole('figure', { name: 'Players capturing' })).toHaveTextContent('3 / 5');
  });

  it('separates the three things a delivery column can say', async () => {
    runHolds(recordingParticipants, 'delivering');
    signIn(authToken);

    renderApp(PATH);

    const table = await openTable();
    reads(table, 'playerone', 'AUDIO + VIDEO — 473 MB');
    reads(table, 'formermember', 'AUDIO ONLY — 19 MB');
    // A finding a coach acts on before completing, not an error treatment.
    reads(table, 'latecomer', 'NOTHING DELIVERED');
    expect(within(rowFor(table, 'latecomer')).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('holds the delivery column back from a finding before the run has ended', async () => {
    runHolds(recordingParticipants);
    signIn(authToken);

    renderApp(PATH);

    // Nothing has been asked of that player yet, so nothing is missing.
    reads(await openTable(), 'latecomer', 'NOTHING YET');
  });

  it('carries no elapsed clock and no capture panel, and reads the wall clock instead', async () => {
    runHolds(recordingParticipants);
    signIn(authToken);

    renderApp(PATH);

    await openTable();
    expect(screen.queryByRole('figure', { name: 'Elapsed recording time' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Your capture' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Session' })).toHaveTextContent('19:41:00');
  });

  it('shows a player who starts capturing elsewhere, without a refresh', async () => {
    runHolds(recordingParticipants);
    signIn(authToken);
    const { live } = renderApp(PATH);

    const table = await openTable();
    reads(table, 'sidelined', 'NOT CAPTURING');

    runHolds(
      recordingParticipants.map((row) =>
        row.user_id === 10 ? { ...row, participant_status: 'recording' } : row,
      ),
    );
    live.emit(CHANNEL, SESSION_EVENTS.participantStatusChanged);

    await waitFor(() => reads(table, 'sidelined', 'CAPTURING'));
    expect(screen.getByRole('figure', { name: 'Players capturing' })).toHaveTextContent('4 / 5');
  });

  it('moves the delivery column as a take lands, driven by the broadcast', async () => {
    runHolds(recordingParticipants, 'delivering');
    signIn(authToken);
    const { live } = renderApp(PATH);

    const table = await openTable();
    reads(table, 'latecomer', 'NOTHING DELIVERED');

    runHolds(
      recordingParticipants.map((row) =>
        row.user_id === 8
          ? {
              ...row,
              aod: { ...recordingParticipants[1].aod!, size_bytes: 18_000_000 },
              vod: { ...recordingParticipants[1].vod!, size_bytes: 400_000_000 },
            }
          : row,
      ),
      'delivering',
    );
    live.emit(CHANNEL, SESSION_EVENTS.participantRecordingUploaded);

    await waitFor(() => expect(rowFor(table, 'latecomer')).toHaveTextContent('AUDIO + VIDEO'));
    expect(rowFor(table, 'latecomer')).not.toHaveTextContent('NOTHING DELIVERED');
  });

  it('ends the run by asking for the end-of-run status, and then waits', async () => {
    runHolds(recordingParticipants);
    const calls = recordBodies();
    signIn(assistantCoachToken);
    const { user } = renderApp(PATH);

    await openTable();
    await user.click(screen.getByRole('button', { name: 'End run' }));

    // The Session sits at the end-of-run status: completing it needs the game
    // events a coach types, which is #8.
    expect(await screen.findByRole('region', { name: 'Run ended' })).toHaveTextContent(
      'finishing its recorder and uploading',
    );
    await waitFor(() =>
      expect(calls).toContainEqual({
        path: '/api/sessions/49/transitions',
        body: JSON.stringify({ to: 'delivering' }),
      }),
    );
    expect(screen.queryByRole('button', { name: 'End run' })).not.toBeInTheDocument();
  });

  it('offers a player neither the end-of-run control nor a way back to the lobby', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);

    renderApp(PATH);

    await openTable();
    expect(screen.queryByRole('button', { name: 'End run' })).not.toBeInTheDocument();
    // `to=queuing` discards every take on the session, so it is not built.
    expect(screen.queryByRole('button', { name: /lobby/i })).not.toBeInTheDocument();
  });

  it('says a dropped connection beside the table and in the shell at once', async () => {
    runHolds(recordingParticipants);
    signIn(authToken);
    const { live } = renderApp(PATH);

    await openTable();
    expect(screen.getByText('LIVE')).toBeInTheDocument();

    live.setStatus('disconnected');

    expect(await screen.findByText('CONNECTION LOST')).toBeInTheDocument();
    expect(screen.getByText('LIVE:DOWN')).toBeInTheDocument();
  });
});

describe('delivering a take', () => {
  it('uploads on the end-of-run broadcast rather than on a control of its own', async () => {
    runHolds(recordingParticipants);
    const calls = recordRequests();
    signIn(playerToken);
    const { user, live, capture } = renderApp(PATH);

    await startCapturing(user);
    expect(screen.queryByRole('button', { name: /upload/i })).not.toBeInTheDocument();

    runHolds(recordingParticipants, 'delivering');
    live.emit(CHANNEL, SESSION_EVENTS.sessionStatusChanged);

    const readout = await screen.findByRole('region', { name: 'Your delivery' });
    await waitFor(() => expect(within(readout).getByText('DELIVERED')).toBeInTheDocument());

    expect(calls).toContain('POST /api/sessions/49/recording');
    // Only once the take has landed is the browser's own copy redundant.
    expect(capture.finished).toEqual([SESSION_ID]);
    expect(capture.delivered).toEqual([SESSION_ID]);
  });

  it('sends both files and the zero its own recorder started at', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const started = new Date(Date.now() - 60_000).toISOString();
    const { user, live } = renderApp(PATH, {
      capture: (double) => double.setStartedAt(started),
    });

    await startCapturing(user);

    let sent: FormData | null = null;
    server.use(
      http.post(`${env.apiUrl}/sessions/:sessionId/recording`, async ({ request }) => {
        sent = await request.formData();
        return envelope('Recording uploaded.', { aod: null, vod: null });
      }),
    );

    runHolds(recordingParticipants, 'delivering');
    live.emit(CHANNEL, SESSION_EVENTS.sessionStatusChanged);

    await waitFor(() => expect(sent).not.toBeNull());
    const body = sent as unknown as FormData;
    // Two recorders, two files: the AOD is what transcription runs on and the
    // VOD is what the Review Board shows, so mixing them would corrupt the one
    // input the whole analysis derives from.
    const audio = body.get('audio') as File;
    const video = body.get('video') as File;
    expect(audio.type).toBe('audio/webm');
    expect(audio.size).toBeGreaterThan(0);
    expect(video.type).toBe('video/webm');
    expect(video.size).toBeGreaterThan(0);
    expect(body.get('audio_client_started_at')).toBe(started);
    expect(body.get('video_client_started_at')).toBe(started);
  });

  it('renders the upload as it goes, and warns against closing the tab', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user, live } = renderApp(PATH);

    await startCapturing(user);

    // Held open so the uploading state is observable; a bar that actually moves
    // needs a browser, since jsdom emits no upload progress.
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.post(`${env.apiUrl}/sessions/:sessionId/recording`, async () => {
        await held;
        return envelope('Recording uploaded.', { aod: null, vod: null });
      }),
    );

    runHolds(recordingParticipants, 'delivering');
    live.emit(CHANNEL, SESSION_EVENTS.sessionStatusChanged);

    const readout = await screen.findByRole('region', { name: 'Your delivery' });
    await waitFor(() => expect(readout).toHaveTextContent('UPLOADING'));
    expect(within(readout).getByRole('progressbar', { name: 'Upload progress' })).toBeInTheDocument();
    expect(readout).toHaveTextContent('KEEP THIS TAB OPEN UNTIL YOUR TAKE HAS LANDED');

    release();
    await waitFor(() => expect(within(readout).getByText('DELIVERED')).toBeInTheDocument());
  });

  it('retries a failed upload, then stops and offers the control', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user, live } = renderApp(PATH);

    await startCapturing(user);

    let attempts = 0;
    server.use(
      http.post(`${env.apiUrl}/sessions/:sessionId/recording`, () => {
        attempts += 1;
        return envelope('The upload could not be stored.', [], 500);
      }),
    );

    runHolds(recordingParticipants, 'delivering');
    live.emit(CHANNEL, SESSION_EVENTS.sessionStatusChanged);

    const readout = await screen.findByRole('region', { name: 'Your delivery' });
    // Three attempts, then a control that names what failed: retrying forever
    // hides a dead connection behind a spinner.
    await waitFor(() => expect(within(readout).getByRole('alert')).toBeInTheDocument());
    expect(attempts).toBe(3);
    expect(within(readout).getByRole('alert')).toHaveTextContent('could not be stored');

    server.use(
      http.post(`${env.apiUrl}/sessions/:sessionId/recording`, () =>
        envelope('Recording uploaded.', { aod: null, vod: null }),
      ),
    );

    await user.click(within(readout).getByRole('button', { name: 'Upload again' }));

    await waitFor(() => expect(within(readout).getByText('DELIVERED')).toBeInTheDocument());
  });
});

describe('leaving a run', () => {
  it('names what leaving destroys before it happens, and what it destroyed after', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user } = renderApp(PATH);

    await openTable();
    await user.click(screen.getByRole('button', { name: 'Leave session' }));

    // playerone has delivered both, so leaving discards both.
    const asking = screen.getByRole('region', { name: 'Leave this session' });
    expect(asking).toHaveTextContent('discards the audio and video you have already delivered');

    await user.click(within(asking).getByRole('button', { name: 'Leave and discard' }));

    expect(await screen.findByRole('region', { name: 'You left' })).toHaveTextContent(
      'AUDIO AND VIDEO DISCARDED',
    );
  });

  it('lets a player who has delivered nothing stay, and says nothing is at stake', async () => {
    // A player who joined late and never started: leaving costs them nothing,
    // and the copy must not claim otherwise.
    runHolds(recordingParticipants.map((row) => (row.user_id === 3 ? { ...row, participant_status: 'ready', aod: null, vod: null } : row)));
    signIn(playerToken);
    const { user } = renderApp(PATH);

    await openTable();
    await user.click(screen.getByRole('button', { name: 'Leave session' }));

    const asking = screen.getByRole('region', { name: 'Leave this session' });
    expect(asking).toHaveTextContent('nothing is lost');

    await user.click(within(asking).getByRole('button', { name: 'Stay in the session' }));

    expect(screen.queryByRole('region', { name: 'Leave this session' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave session' })).toBeInTheDocument();
  });

  it('offers no control that stops a recording without leaving', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user } = renderApp(PATH);

    await startCapturing(user);

    // Stopping and leaving destroy the same thing, so only one is shipped.
    expect(screen.queryByRole('button', { name: /stop recording/i })).not.toBeInTheDocument();
  });

  it('releases the channel and the streams on the way out', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user, live, capture } = renderApp(PATH);

    await startCapturing(user);
    expect(live.openChannels()).toEqual([CHANNEL]);
    expect(capture.released).toEqual([]);

    await user.click(screen.getByRole('link', { name: 'Sessions' }));
    await screen.findByRole('heading', { name: 'Sessions' });

    // A recorder that outlives its screen renders exactly what a correct one
    // does, and holds the microphone while doing it.
    expect(live.openChannels()).toEqual([]);
    expect(capture.released).toEqual([SESSION_ID]);
  });
});

describe('a recording a reload left behind', () => {
  const orphan = { sessionId: SESSION_ID, startedAt: '2026-09-16T19:41:00.000000Z', bytes: 41_000_000 };

  it('offers the earlier take as a file, and says what the session keeps', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user, capture } = renderApp(PATH, {
      capture: (double) => double.seedOrphan(orphan),
    });

    const notice = await screen.findByRole('region', { name: 'Unfinished recording' });
    expect(notice).toHaveTextContent('keeps only what your current recorder captures');
    expect(notice).toHaveTextContent('41 MB');

    await user.click(within(notice).getByRole('button', { name: 'Save recording' }));

    await waitFor(() => expect(notice).toHaveTextContent('SAVED'));
    expect(capture.saved).toEqual([SESSION_ID]);
  });

  it('starts a fresh recorder beside it rather than resuming the old one', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    const { user } = renderApp(PATH, { capture: (double) => double.seedOrphan(orphan) });

    await screen.findByRole('region', { name: 'Unfinished recording' });
    const elapsed = await startCapturing(user);

    // `MediaRecorder` cannot resume across a page load, so the new clock starts
    // at its own zero and the recovered take is the player's to keep.
    expect(elapsed).toHaveTextContent('00:00:00');
    expect(screen.getByRole('region', { name: 'Unfinished recording' })).toBeInTheDocument();
  });

  it('offers one from a session that has ended, with the reason it cannot be delivered', async () => {
    signIn(playerToken);
    renderApp(`/sessions/${cancelledSession.id}`, {
      capture: (double) => double.seedOrphan({ ...orphan, sessionId: cancelledSession.id }),
    });

    const notice = await screen.findByRole('region', { name: 'Unfinished recording' });
    expect(notice).toHaveTextContent('can no longer be delivered');
    expect(within(notice).getByRole('button', { name: 'Save recording' })).toBeInTheDocument();
  });

  it('offers only the recording that belongs to this session', async () => {
    runHolds(recordingParticipants);
    signIn(playerToken);
    // Asserted by discrimination rather than by absence: a notice that has not
    // rendered yet and one that never will look identical to a query that runs
    // the moment the screen mounts.
    renderApp(PATH, {
      capture: (double) => {
        double.seedOrphan({ ...orphan, sessionId: 48, bytes: 7_000_000 });
        double.seedOrphan(orphan);
      },
    });

    const notice = await screen.findByRole('region', { name: 'Unfinished recording' });
    expect(notice).toHaveTextContent('41 MB');
    expect(notice).not.toHaveTextContent('7 MB');
  });
});
