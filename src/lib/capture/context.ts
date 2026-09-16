import { createContext } from 'react';
import type { Capture } from '@/lib/capture/capture';

/** The port, held at the app boundary so one capture serves every Screen.
 *  Separate from the hooks so oxlint's `only-export-components` stays happy. */
export const CaptureContext = createContext<Capture | null>(null);
