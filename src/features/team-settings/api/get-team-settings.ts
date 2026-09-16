import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { TeamSettings } from '@/types/api';

/** Team-wide detection settings, not this Session's. The endpoint resolves the
 *  caller's active team and admits any active Coach. */
export const teamSettingsKeys = { settings: ['team', 'settings'] as const };

export const teamSettingsQuery = queryOptions({
  queryKey: teamSettingsKeys.settings,
  queryFn: async ({ signal }) => {
    const { settings } = await api.get<{ settings: TeamSettings }>('/teams/settings', { signal });
    return settings;
  },
});
