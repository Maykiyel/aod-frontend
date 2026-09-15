import { Outlet } from 'react-router';
import { AppSidebar } from '@/app/layouts/app-sidebar';
import styles from './app-shell.module.css';

/** The App Shell (CONTEXT.md): the fixed chrome every screen composes inside, as
 *  a layout route. In `app/` rather than `components/` because it reads the team
 *  feature, which a shared component may not do (conventions.md). */
export function AppShell() {
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
