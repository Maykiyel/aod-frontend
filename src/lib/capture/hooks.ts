import { useContext, useSyncExternalStore } from 'react';
import { CaptureContext } from '@/lib/capture/context';
import type { Capture, CaptureReading, CaptureRun } from '@/lib/capture/capture';

/** No run yet, so nothing is capturing and the meter sits at rest. */
const AT_REST: CaptureReading = { level: 0, microphone: false, display: false };

export function useCapture(): Capture {
  const capture = useContext(CaptureContext);
  if (!capture) throw new Error('Capture is only available inside AppProvider.');
  return capture;
}

/** The run's own readings. Subscribed by the two leaves that draw them rather
 *  than by the Screen: the level moves at the frame rate, and re-rendering a
 *  capture table around it would cost the coach a frame per bar. */
export function useCaptureReading(run: CaptureRun | null): CaptureReading {
  return useSyncExternalStore(
    run ? run.watch : noWatch,
    run ? run.reading : atRest,
  );
}

const noWatch = () => () => {};
const atRest = () => AT_REST;
