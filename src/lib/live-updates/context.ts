import { createContext } from 'react';
import type { LiveUpdates } from '@/lib/live-updates/live-updates';

/** The port, held at the app boundary so one connection serves every Screen.
 *  Separate from the hooks so oxlint's `only-export-components` stays happy. */
export const LiveUpdatesContext = createContext<LiveUpdates | null>(null);
