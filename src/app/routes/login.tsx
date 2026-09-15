import { Form, Link, useActionData, useNavigation } from 'react-router';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { BrandPanel } from '@/features/auth/components/brand-panel';
import type { LoginActionData } from '@/app/routes/login-action';
import styles from './login.module.css';

/** Screen 01, built against `docs/design/01 Log in.dc.html`. The browser validates
 *  email and password (`type="email"`, `required`) — the spec asks that a malformed
 *  address be caught before a request, not after a round trip. */
export function LoginRoute() {
  const actionData = useActionData<LoginActionData>();
  const navigation = useNavigation();

  // Stays true through the redirect that follows a success, not just the POST,
  // so the button never re-enables under a user who is already on their way.
  const pending = navigation.state !== 'idle';

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

          <Form className={styles.form} method="post">
            <div className={styles.fields}>
              <Input
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="coach@aod.gg"
                required
                disabled={pending}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                required
                disabled={pending}
              />
            </div>

            {actionData?.error ? (
              <p className={styles.error} role="alert">
                {actionData.error}
              </p>
            ) : null}

            <div className={styles.actions}>
              <Button type="submit" disabled={pending}>
                {pending ? 'Logging in' : 'Log in'}
              </Button>
              <p className={styles.signUp}>
                <span>New here?</span>
                <Link className={styles.signUpLink} to="/register">
                  Sign up
                </Link>
              </p>
            </div>
          </Form>
        </div>

        <p className={styles.disclaimer}>NOT ENDORSED BY OR AFFILIATED WITH RIOT GAMES</p>
      </main>
    </div>
  );
}
