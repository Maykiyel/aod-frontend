import { Button } from '@/components/ui/button/button';
import { useAuth } from '@/lib/auth-context';

/**
 * Placeholder. The role-aware shell and the real empty state are #2 — this
 * exists so the authenticated half of the routing is reachable and testable,
 * and so logging out can be exercised.
 */
export function DashboardRoute() {
  const { user, logout } = useAuth();

  return (
    <main style={{ padding: 'var(--space-7)', display: 'grid', gap: 'var(--space-5)' }}>
      <h1 style={{ font: 'var(--type-display-m)', textTransform: 'uppercase', margin: 0 }}>
        Signed in
      </h1>
      <p style={{ font: 'var(--type-data)', color: 'var(--text-secondary)', margin: 0 }}>
        {user?.username} · {user?.email}
      </p>
      <div>
        <Button variant="secondary" onClick={() => void logout()}>
          Log out
        </Button>
      </div>
    </main>
  );
}
