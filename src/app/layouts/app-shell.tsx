import { Outlet } from 'react-router';
import { AppSidebar } from '@/app/layouts/app-sidebar';
import { useLiveConnection } from '@/lib/live-updates/hooks';
import styles from './app-shell.module.css';

/** The App Shell (CONTEXT.md): the fixed chrome every screen composes inside, as
 *  a layout route. In `app/` rather than `components/` because it reads the team
 *  feature, which a shared component may not do (conventions.md). */
export function AppShell() {
  // One socket for the authenticated session: this tree mounts when the
  // middleware admits a session and unmounts on a logout or a 401 (spec #38).
  useLiveConnection();

  return (
    <div className={styles.shell}>
      <AppSidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
