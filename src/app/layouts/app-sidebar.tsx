import { NavLink } from 'react-router';
import { Icon } from '@/components/ui/icon/icon';
import { NavItem } from '@/components/ui/nav-item/nav-item';
import { Surface } from '@/components/ui/surface/surface';
import { DESTINATIONS } from '@/app/navigation';
import { UserMenu } from '@/app/layouts/user-menu';
import { capabilitiesOf, useMembership } from '@/features/team/hooks/use-membership';
import type { MembershipState } from '@/features/team/hooks/use-membership';
import { logout, useAuth } from '@/lib/auth-store';
import type { MemberRole } from '@/types/api';
import styles from './app-sidebar.module.css';

const ROLE_LABELS: Record<MemberRole, string> = {
  main_coach: 'MAIN COACH',
  assistant_coach: 'ASSISTANT COACH',
  player: 'PLAYER',
};

/** Silence is neutral: a membership still loading, or one that failed to load,
 *  is not a fact about the user, so nothing is said in its place. */
function roleReading(state: MembershipState): string | null {
  if (state.status === 'member') return ROLE_LABELS[state.membership.member_role];
  return state.status === 'teamless' ? 'NO TEAM' : null;
}

/** The plate device: stepped silhouette, ring, milled holes and corner bolts.
   Static chrome, so it is hoisted out of the render (`rendering-hoist-jsx`). */
const PLATE = (
  <div aria-hidden="true">
    <div className={styles.plate} />
    <div className={styles.plateRing} />
    <span className={`${styles.hole} ${styles.holeUpper}`} />
    <span className={`${styles.hole} ${styles.holeLower}`} />
    <span className={`${styles.hole} ${styles.holeRight}`} />
    <span className={`${styles.bolt} ${styles.boltTopLeft}`} />
    <span className={`${styles.bolt} ${styles.boltTopRight}`} />
    <span className={`${styles.bolt} ${styles.boltBottomLeft}`} />
    <span className={`${styles.bolt} ${styles.boltBottomRight}`} />
  </div>
);

/** Fixed chrome, so E1 with its single groove. Navigation is filtered by the
 *  capabilities derived from the active membership, which is also what makes a
 *  teamless user's sidebar honest: only the dashboard is reachable. */
export function AppSidebar() {
  const { user } = useAuth();
  const membership = useMembership();

  const capabilities = capabilitiesOf(membership);
  const destinations = DESTINATIONS.filter((destination) =>
    destination.isReachable(capabilities),
  );
  const reading = roleReading(membership);

  return (
    <Surface as="aside" level={1} behind="var(--void)" padding="0" className={styles.sidebar}>
      {PLATE}

      <div className={styles.body}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>Beyond Mechanics</span>
        </div>

        {membership.status === 'member' ? (
          <div className={styles.teamBlock}>
            <Surface
              level={0}
              behind="var(--e1-surface)"
              padding="var(--space-3)"
              className={styles.teamPlate}
            >
              <div className={styles.teamRow}>
                <span className={styles.teamText}>
                  <span className={styles.teamLabel}>TEAM</span>
                  <span className={styles.teamName}>{membership.team.team_name}</span>
                  <span className={styles.teamCode}>{membership.team.team_code}</span>
                </span>
                <Icon name="split" size={13} />
              </div>
            </Surface>
          </div>
        ) : null}

        <nav className={styles.nav} aria-label="Sections">
          {destinations.map((destination) => (
            <NavLink key={destination.to} to={destination.to} end className={styles.navLink}>
              {({ isActive }) => (
                <NavItem
                  label={destination.label}
                  active={isActive}
                  icon={<Icon name={destination.icon} size={15} />}
                />
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.spacer} />

        <div className={styles.footer}>
          {/* Both readings are static, as on screen 01: no build identifier is
              wired and no health check sits behind API:OK. */}
          <div className={styles.readings}>
            <span className={styles.reading}>BUILD:DEV</span>
            <span className={styles.reading}>
              <span className={styles.readingDot} />
              API:OK
            </span>
          </div>

          {/* The design draws the profile block but no account actions. Logging
              out lives behind it rather than beside it, as a menu at E3. */}
          {user ? (
            <UserMenu
              username={user.username}
              reading={reading}
              onLogout={() => void logout()}
            />
          ) : null}
        </div>
      </div>
    </Surface>
  );
}
