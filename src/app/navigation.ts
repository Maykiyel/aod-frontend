import type { IconName } from '@/components/ui/icon/icon';
import type { Capabilities } from '@/features/team/capabilities';

export interface Destination {
  to: string;
  label: string;
  icon: IconName;
  /** Whether this user's capabilities reach it. Hiding a row spares the user a
   *  screen the server would refuse; it is never itself the check (ADR 0007). */
  isReachable: (capabilities: Capabilities) => boolean;
}

/** The sidebar's four destinations, in the order the design lists them. */
export const DESTINATIONS: readonly Destination[] = [
  // Reachable with no team at all: it is where the teamless state is told.
  { to: '/', label: 'Dashboard', icon: 'frame', isReachable: () => true },
  { to: '/sessions', label: 'Sessions', icon: 'tracks', isReachable: (c) => c.canViewTeamData },
  { to: '/team', label: 'Team', icon: 'role', isReachable: (c) => c.canViewTeamData },
  {
    to: '/settings',
    label: 'Settings',
    icon: 'filter',
    isReachable: (c) => c.canConfigureTeamSettings,
  },
];
