import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import styles from './login.module.css';

/**
 * Screen 01. Copy is taken from the design reference, not invented.
 *
 * Email and password are validated by the browser (`type="email"`, `required`)
 * rather than by hand: the spec asks that a malformed address be caught "before
 * a request is sent … something the browser already knew".
 *
 * Not yet faithful to `docs/design/01 Log in.dc.html` at the design width — the
 * reference carries a left-hand brand panel and a timeline motif this does not
 * draw. User story 37 is outstanding.
 */
export function LoginRoute() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      await login({ email, password });
      // On success the route guard redirects, unmounting this component — so
      // nothing resets `pending` here deliberately.
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause
          : new ApiError('Something went wrong. Try again.', 0),
      );
      setPending(false);
    }
  }

  // Bad credentials arrive as a 422 against `email`, so prefer the field
  // message; fall back to the envelope's own, which is server-authored.
  const errorText = error ? (error.fieldError('email') ?? error.message) : null;

  return (
    <main className={styles.screen}>
      <form className={styles.panel} onSubmit={handleSubmit} noValidate={false}>
        <p className={styles.eyebrow}>SESSION ACCESS</p>
        <h1 className={styles.heading}>Log in</h1>

        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="coach@aod.gg"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending}
        />

        {errorText ? (
          <p className={styles.error} role="alert">
            {errorText}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? 'Logging in' : 'Log in'}
        </Button>
      </form>
    </main>
  );
}
