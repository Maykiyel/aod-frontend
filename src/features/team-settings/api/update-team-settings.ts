import { api } from '@/lib/api-client';
import type { TeamSettings } from '@/types/api';

type SettingsBody = { settings: TeamSettings };

/** `dead_air_threshold_ms` is `required` on the endpoint, so a write sends it
 *  whether or not it changed. The other two fields belong to a later ticket. */
export const updateDeadAirThreshold = async (deadAirThresholdMs: number) =>
  (await api.put<SettingsBody>('/teams/settings', { dead_air_threshold_ms: deadAirThresholdMs }))
    .settings;

/** The request carries the complete desired list per category; the server
 *  reconciles it against what is stored. */
export const updateTeamKeywords = async (lists: {
  informative_keywords: string[];
  declarative_keywords: string[];
}) => (await api.put<SettingsBody>('/teams/settings/keywords', lists)).settings;
