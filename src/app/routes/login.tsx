import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { BrandPanel } from '@/features/auth/components/brand-panel';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import styles from './login.module.css';

/** Screen 01, built against `docs/design/01 Log in.dc.html`. The browser validates
 *  email and password (`type="email"`, `required`) — the spec asks that a malformed
 *  address be caught before a request, not after a round trip. */
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
        cause instanceof ApiError ? cause : new ApiError('Something went wrong. Try again.', 0),
      );
      setPending(false);
    }
  }

  // Bad credentials arrive as a 422 against `email`, so prefer the field
  // message; fall back to the envelope's own, which is server-authored.
  const errorText = error ? (error.fieldError('email') ?? error.message) : null;

  return (
    <div className={styles.screen}>
      <BrandPanel />

      <main className={styles.formSide}>
        <div className={styles.grid} aria-hidden="true" />

        {/* Static in this chunk. A real reading needs a health check the spec
            does not ask for yet. */}
        <div className={styles.apiStatus}>
          <span className={styles.apiDot} />
          API:OK
        </div>

        <div className={styles.formBlock}>
          <div className={styles.titleBlock}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowIndex}>01</span>
              <span className={styles.eyebrowRule} />
              <span>SESSION ACCESS</span>
            </div>
            <h1 className={styles.heading}>Log in</h1>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
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
                placeholder="••••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
              />
            </div>

            {errorText ? (
              <p className={styles.error} role="alert">
                {errorText}
              </p>
            ) : null}

            <div className={styles.actions}>
              <Button type="submit" disabled={pending}>
                {pending ? 'Logging in' : 'Log in'}
              </Button>
              <p className={styles.signUp}>
                <span>New here?</span>
                {/* #4 builds this route; until then the catch-all returns here. */}
                <Link className={styles.signUpLink} to="/register">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>

        <p className={styles.disclaimer}>NOT ENDORSED BY OR AFFILIATED WITH RIOT GAMES</p>
      </main>
    </div>
  );
}
