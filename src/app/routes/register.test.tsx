import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import type { UserEvent } from '@testing-library/user-event';
import { env } from '@/config/env';
import { thunderbolts } from '@/testing/mocks/fixtures';
import { server } from '@/testing/mocks/server';
import { renderApp } from '@/testing/test-utils';
import type { RegistrationRequest } from '@/types/api';

/** The seam from #14 and #31: render a route with the network mocked at the HTTP
 *  boundary and drive it as a person would. Nothing here imports the wizard's
 *  accumulated answers — they are observable only through the request that
 *  leaves the browser and the screen that follows it. */

interface Credentials {
  username: string;
  email: string;
  password: string;
}

// Ten characters, over the backend's minimum of eight. Kept short because every
// keystroke is a real event at this seam, and this file drives four screens.
const PASSWORD = 'sc0ut-pass';

/** Read the one request enrolment sends. The resolver returns nothing, so the
 *  default handler still answers it — this observes, it does not replace. */
function captureRegistration(): () => RegistrationRequest {
  let sent: RegistrationRequest | null = null;

  server.use(
    http.post(`${env.apiUrl}/register`, async ({ request }) => {
      sent = (await request.clone().json()) as RegistrationRequest;
    }),
  );

  return () => {
    if (!sent) throw new Error('no registration was sent');
    return sent;
  };
}

/** Count the registrations that actually leave the browser, without answering
 *  them: the default handler still does. */
function countRegistrations(): () => number {
  let attempts = 0;

  server.use(
    http.post(`${env.apiUrl}/register`, async () => {
      attempts += 1;
      await delay(40);
    }),
  );

  return () => attempts;
}

async function chooseRole(user: UserEvent, role: 'Coach' | 'Player'): Promise<void> {
  await user.click(await screen.findByRole('radio', { name: role }));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

async function fillProfile(user: UserEvent, credentials: Credentials): Promise<void> {
  await user.type(await screen.findByLabelText('Username'), credentials.username);
  await user.type(screen.getByLabelText('Email'), credentials.email);
  await user.type(screen.getByLabelText('Password'), credentials.password);
  await user.type(screen.getByLabelText('Confirm password'), credentials.password);
  await user.click(screen.getByRole('checkbox', { name: /18 years of age or older/ }));
}

describe('enrolment', () => {
  it('opens on the account-type choice', async () => {
    renderApp('/register');

    expect(await screen.findByRole('heading', { name: /who is signing up/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Coach' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Player' })).toBeInTheDocument();
  });

  it('sends a coach to the coach profile and a player to player details', async () => {
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    expect(await screen.findByRole('heading', { name: /make your profile/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /account type/i }));
    await chooseRole(user, 'Player');

    expect(await screen.findByRole('heading', { name: /your player details/i })).toBeInTheDocument();
    expect(screen.getByLabelText('In-game name')).toBeInTheDocument();
  });

  it('takes a new coach from nothing to the dashboard of the team they just made', async () => {
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    await fillProfile(user, {
      username: 'coachjuan',
      email: 'juan@teamnova.gg',
      password: 'a-long-enough-password',
    });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.type(await screen.findByLabelText('Team name'), 'Team Nova');
    await user.click(screen.getByRole('button', { name: 'Create team' }));

    // Landing inside the App Shell is what "reached the app" means (#14), and
    // Settings is offered to a main coach alone.
    expect(await screen.findByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Team Nova' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('asks for a coach exactly as the backend demands, with no in-game name', async () => {
    const sent = captureRegistration();
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    await fillProfile(user, {
      username: 'coachjuan',
      email: 'juan@teamnova.gg',
      password: PASSWORD,
    });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.type(await screen.findByLabelText('Team name'), 'Team Nova');
    await user.type(screen.getByLabelText('Description'), 'Valorant scrim squad');
    await user.click(screen.getByRole('button', { name: 'Create team' }));

    await screen.findByRole('navigation', { name: 'Sections' });

    // riot_id is PROHIBITED for a Coach and team_action's only legal value is
    // 'create' — either wrong and the whole registration is rejected (#31).
    expect(sent()).toEqual({
      username: 'coachjuan',
      email: 'juan@teamnova.gg',
      password: PASSWORD,
      password_confirmation: PASSWORD,
      role: 'Coach',
      team_action: 'create',
      team_name: 'Team Nova',
      description: 'Valorant scrim squad',
    });
  });

  it('takes a new player to a plain statement that a coach must accept them', async () => {
    const sent = captureRegistration();
    const { user } = renderApp('/register');

    await chooseRole(user, 'Player');
    await fillProfile(user, {
      username: 'playerA',
      email: 'a@teamnova.gg',
      password: PASSWORD,
    });
    await user.type(screen.getByLabelText('In-game name'), 'Player A#EUW');
    await user.type(screen.getByLabelText('Team code'), thunderbolts.team_code);
    await user.click(screen.getByRole('button', { name: 'Join team' }));

    // Joining is a request, not an arrival — the screen has to say so.
    expect(await screen.findByRole('heading', { name: /waiting on a coach/i })).toBeInTheDocument();
    expect(screen.getByText(/main coach/i)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Sections' })).not.toBeInTheDocument();

    // A team code with no team_action is the only way joining is expressed, and
    // team_action is prohibited on a Player outright (#31).
    expect(sent()).toEqual({
      username: 'playerA',
      email: 'a@teamnova.gg',
      password: PASSWORD,
      password_confirmation: PASSWORD,
      role: 'Player',
      riot_id: 'Player A#EUW',
      team_code: thunderbolts.team_code,
    });
  });
  it('files a coach who joins by code as a request, not a membership', async () => {
    const sent = captureRegistration();
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    await fillProfile(user, {
      username: 'assistant',
      email: 'assistant@teamnova.gg',
      password: PASSWORD,
    });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.click(await screen.findByRole('tab', { name: 'JOIN TEAM' }));
    await user.type(screen.getByLabelText('Team code'), thunderbolts.team_code);
    await user.click(screen.getByRole('button', { name: 'Join team' }));

    expect(await screen.findByRole('heading', { name: /waiting on a coach/i })).toBeInTheDocument();

    // There is no join ACTION: a team code with team_action omitted is the only
    // way joining is expressed, and sending 'join' would be rejected (#31).
    expect(sent()).toEqual({
      username: 'assistant',
      email: 'assistant@teamnova.gg',
      password: PASSWORD,
      password_confirmation: PASSWORD,
      role: 'Coach',
      team_code: thunderbolts.team_code,
    });
  });

  it('registers a player who names no team at all, landing them in the teamless state', async () => {
    const sent = captureRegistration();
    const { user } = renderApp('/register');

    await chooseRole(user, 'Player');
    await fillProfile(user, { username: 'loner', email: 'loner@aod.gg', password: PASSWORD });
    await user.type(screen.getByLabelText('In-game name'), 'Loner#EUW');

    // With no code the action is not a join, and says so.
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('heading', { name: /no team yet/i })).toBeInTheDocument();
    expect(sent()).toEqual({
      username: 'loner',
      email: 'loner@aod.gg',
      password: PASSWORD,
      password_confirmation: PASSWORD,
      role: 'Player',
      riot_id: 'Loner#EUW',
    });
  });

  it('registers a coach who names no team either, from the join tab left blank', async () => {
    const sent = captureRegistration();
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    await fillProfile(user, { username: 'solo', email: 'solo@aod.gg', password: PASSWORD });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.click(await screen.findByRole('tab', { name: 'JOIN TEAM' }));
    // No code entered, so the action is not a join and does not claim to be.
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('heading', { name: /no team yet/i })).toBeInTheDocument();
    expect(sent()).toEqual({
      username: 'solo',
      email: 'solo@aod.gg',
      password: PASSWORD,
      password_confirmation: PASSWORD,
      role: 'Coach',
    });
  });

  it('swaps the fields and the action together when the team tab changes', async () => {
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    await fillProfile(user, { username: 'tabs', email: 'tabs@aod.gg', password: PASSWORD });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByLabelText('Team name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create team' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'JOIN TEAM' }));

    expect(await screen.findByLabelText('Team code')).toBeInTheDocument();
    expect(screen.queryByLabelText('Team name')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create team' })).not.toBeInTheDocument();

    // The join tab's action names a join once there is a code to join with.
    await user.type(screen.getByLabelText('Team code'), thunderbolts.team_code);
    expect(screen.getByRole('button', { name: 'Join team' })).toBeInTheDocument();
  });

  it('keeps the answers already given when a completed step is reopened', async () => {
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    await fillProfile(user, { username: 'goback', email: 'goback@aod.gg', password: PASSWORD });
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(await screen.findByLabelText('Team name'), 'Team Nova');

    await user.click(screen.getByRole('button', { name: /profile/i }));

    expect(await screen.findByLabelText('Username')).toHaveValue('goback');
    expect(screen.getByLabelText('Email')).toHaveValue('goback@aod.gg');
    expect(screen.getByRole('checkbox', { name: /18 years of age or older/ })).toBeChecked();

    // And the answer three screens on survives the round trip too.
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByLabelText('Team name')).toHaveValue('Team Nova');
  });
  it('lands a taken username under the username, on the screen that asked for it', async () => {
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    // maincoach is seeded, so the backend's unique rule rejects it.
    await fillProfile(user, { username: 'maincoach', email: 'fresh@aod.gg', password: PASSWORD });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.type(await screen.findByLabelText('Team name'), 'Team Nova');
    await user.click(screen.getByRole('button', { name: 'Create team' }));

    // The rejection names a credential, so the coach is put back on the screen
    // that owns it rather than shown a banner on team setup.
    await waitFor(() =>
      expect(screen.getByLabelText('Username')).toHaveAccessibleDescription(
        'The username has already been taken.',
      ),
    );
    expect(screen.getByRole('heading', { name: /make your profile/i })).toBeInTheDocument();
  });

  it('lands an unknown team code under the code rather than failing the page', async () => {
    const { user } = renderApp('/register');

    await chooseRole(user, 'Player');
    await fillProfile(user, { username: 'lost', email: 'lost@aod.gg', password: PASSWORD });
    await user.type(screen.getByLabelText('In-game name'), 'Lost#EUW');
    await user.type(screen.getByLabelText('Team code'), 'TM-NOTREAL');
    await user.click(screen.getByRole('button', { name: 'Join team' }));

    await waitFor(() =>
      expect(screen.getByLabelText('Team code')).toHaveAccessibleDescription(
        'The provided team code does not exist.',
      ),
    );
    // Not a page-level failure, and nothing the user typed is lost.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('In-game name')).toHaveValue('Lost#EUW');
  });

  it('lands a taken email under the email', async () => {
    const { user } = renderApp('/register');

    await chooseRole(user, 'Player');
    await fillProfile(user, {
      username: 'fresh',
      email: 'playerone@example.com',
      password: PASSWORD,
    });
    await user.type(screen.getByLabelText('In-game name'), 'Fresh#EUW');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() =>
      expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
        'The email has already been taken.',
      ),
    );
  });

  it('does not send a registration the browser already knows is wrong', async () => {
    const attempts = countRegistrations();
    const { user } = renderApp('/register');

    await chooseRole(user, 'Player');
    await user.click(await screen.findByRole('checkbox', { name: /18 years of age or older/ }));
    const submit = screen.getByRole('button', { name: 'Register' });

    // Everything empty: `required` stops this before the network.
    await user.click(submit);
    expect(attempts()).toBe(0);

    // An address with no @ in it is something the browser already knows is
    // wrong, so the user should not wait on a round trip to be told.
    await user.type(screen.getByLabelText('Username'), 'typo');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), PASSWORD);
    await user.type(screen.getByLabelText('Confirm password'), PASSWORD);
    await user.type(screen.getByLabelText('In-game name'), 'Typo#EUW');
    await user.click(submit);
    expect(attempts()).toBe(0);

    // A confirmation that does not match is the one rule an attribute cannot
    // express, so it is checked here rather than by the server.
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'typo@aod.gg');
    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Confirm password'), 'something-else');
    await user.click(submit);
    expect(attempts()).toBe(0);
    expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription(
      'The passwords do not match.',
    );

    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Confirm password'), PASSWORD);
    await user.click(submit);
    expect(attempts()).toBe(1);
    // Waited out rather than left in flight: a registration that lands after
    // the test has ended establishes a session the next test would inherit.
    expect(await screen.findByRole('heading', { name: /no team yet/i })).toBeInTheDocument();
  });

  it('cannot be submitted twice while a registration is in flight', async () => {
    const attempts = countRegistrations();
    const { user } = renderApp('/register');

    await chooseRole(user, 'Player');
    await fillProfile(user, { username: 'double', email: 'double@aod.gg', password: PASSWORD });
    await user.type(screen.getByLabelText('In-game name'), 'Double#EUW');

    const submit = screen.getByRole('button', { name: 'Register' });
    await user.click(submit);
    await user.click(submit);

    expect(await screen.findByRole('heading', { name: /no team yet/i })).toBeInTheDocument();
    expect(attempts()).toBe(1);
  });

  it('reports a registration that never lands, with the work preserved', async () => {
    server.use(http.post(`${env.apiUrl}/register`, () => HttpResponse.error()));
    const { user } = renderApp('/register');

    await chooseRole(user, 'Coach');
    await fillProfile(user, { username: 'dropped', email: 'dropped@aod.gg', password: PASSWORD });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.type(await screen.findByLabelText('Team name'), 'Team Nova');
    await user.click(screen.getByRole('button', { name: 'Create team' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
    expect(screen.getByLabelText('Team name')).toHaveValue('Team Nova');
    expect(screen.getByRole('button', { name: 'Create team' })).toBeEnabled();
  });
});