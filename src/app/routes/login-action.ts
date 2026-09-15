import { redirect } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { nextPathFrom } from '@/app/auth-middleware';
import { ApiError } from '@/lib/api-client';
import { login } from '@/lib/auth-store';

export interface LoginActionData {
  error: string;
}

/** Signing in is navigation-coupled, so it is an action: the mutation and the
 *  redirect that follows it are one step the router owns, rather than a store
 *  write that some other route happens to notice. */
export async function loginAction({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  try {
    await login({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    });
  } catch (cause) {
    const error =
      cause instanceof ApiError ? cause : new ApiError('Something went wrong. Try again.', 0);
    // Bad credentials arrive as a 422 against `email`, so prefer the field
    // message; fall back to the envelope's own, which is server-authored.
    return { error: error.fieldError('email') ?? error.message } satisfies LoginActionData;
  }

  return redirect(nextPathFrom(request));
}
