import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startRecording } from '@/features/sessions/api/session-actions';
import { useSessionAction } from '@/features/sessions/hooks/use-session-action';
import { useCapture } from '@/lib/capture/hooks';
import type { CaptureRefusal, CaptureRun, CaptureSource } from '@/lib/capture/capture';

export type CaptureState =
  | { phase: 'idle' }
  | { phase: 'asking' }
  | { phase: 'refused'; source: CaptureSource; refusal: CaptureRefusal }
  | { phase: 'capturing'; run: CaptureRun };

/** One player's run, from the click that asks for it to the unmount that ends
 *  it. Capture is player-initiated because the window picker needs a user
 *  gesture, and the server is told only once both tracks are live (spec #40). */
export function useCaptureRun(sessionId: number) {
  const capture = useCapture();
  const queryClient = useQueryClient();
  const announce = useSessionAction(startRecording);
  const { mutate } = announce;

  const [state, setState] = useState<CaptureState>({ phase: 'idle' });
  const held = useRef<CaptureRun | null>(null);

  // A recorder that outlives its Screen renders exactly what a correct one does,
  // and holds the microphone while doing it. This is the release.
  useEffect(
    () => () => {
      held.current?.release();
      held.current = null;
    },
    [],
  );

  async function begin() {
    // A run whose microphone was revoked is released before a new one asks, so
    // the dead one stops holding its streams. Its chunks stay, and the recovery
    // notice is re-read so the player is offered what it captured.
    const previous = held.current;
    previous?.release();
    held.current = null;

    setState({ phase: 'asking' });
    const started = await capture.start(sessionId);

    if (previous) {
      await queryClient.invalidateQueries({ queryKey: ['capture', 'recoverable'] });
    }

    if (!started.granted) {
      setState({ phase: 'refused', source: started.source, refusal: started.refusal });
      return;
    }

    held.current = started.run;
    setState({ phase: 'capturing', run: started.run });
    mutate(sessionId);
  }

  return { state, begin, error: announce.error };
}
