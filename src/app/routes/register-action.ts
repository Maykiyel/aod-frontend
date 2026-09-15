import { redirect } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { ApiError } from '@/lib/api-client';
import { register } from '@/lib/auth-store';
import type { RegistrationRequest, Team } from '@/types/api';

export type RegisterActionData =
  | { outcome: 'pending'; team: Team | null }
  | { outcome: 'rejected'; message: string; fieldErrors: Record<string, string[]> };

/** The one atomic `POST /api/register` (#31), as an action: it both mutates and
 *  decides where enrolment ends. An active membership or no team at all is a
 *  redirect; a pending one is not, because the backend has no read path to
 *  recover it from (Joe-Zupo/aod-backend#21). */
export async function registerAction({ request }: ActionFunctionArgs) {
  const payload = (await request.json()) as RegistrationRequest;

  try {
    const outcome = await register(payload);
    if (outcome.team_membership_status === 'pending') {
      return { outcome: 'pending', team: outcome.team } satisfies RegisterActionData;
    }
  } catch (cause) {
    const error =
      cause instanceof ApiError ? cause : new ApiError('Something went wrong. Try again.', 0);
    return {
      outcome: 'rejected',
      message: error.message,
      fieldErrors: error.fieldErrors,
    } satisfies RegisterActionData;
  }

  return redirect('/');
}
