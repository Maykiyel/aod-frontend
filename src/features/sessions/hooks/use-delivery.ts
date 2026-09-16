import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sessionKeys } from '@/features/sessions/api/get-sessions';
import { uploadRecording } from '@/features/sessions/api/upload-recording';
import type { CaptureRun } from '@/lib/capture/capture';

export type DeliveryState =
  | { phase: 'holding' }
  | { phase: 'finishing' }
  | { phase: 'uploading'; progress: number }
  | { phase: 'delivered' }
  | { phase: 'failed'; message: string };

const FAILED = 'Your recording did not reach the session.';

/** Delivering one player's own take. It starts on the Coach's end-of-run
 *  broadcast rather than on a control of this player's own, so that nobody has
 *  to remember to deliver (spec #40). */
export function useDelivery(sessionId: number, run: CaptureRun | null, ended: boolean) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<DeliveryState>({ phase: 'holding' });
  const asked = useRef(false);

  const deliver = useCallback(async () => {
    if (!run) return;

    setState({ phase: 'finishing' });

    try {
      const take = await run.finish();
      setState({ phase: 'uploading', progress: 0 });

      await uploadRecording(sessionId, take, (progress) =>
        setState({ phase: 'uploading', progress }),
      );

      // Only now is the browser's copy redundant. Clearing it any earlier would
      // destroy something that had not reached the Session (ADR 0006).
      await run.delivered();
      setState({ phase: 'delivered' });
      await queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    } catch (cause) {
      setState({ phase: 'failed', message: cause instanceof Error ? cause.message : FAILED });
    }
  }, [queryClient, run, sessionId]);

  useEffect(() => {
    if (!ended || !run || asked.current) return;
    asked.current = true;
    void deliver();
  }, [deliver, ended, run]);

  // The browser can only say its own generic sentence, so the Screen carries the
  // real one beside it.
  useEffect(() => {
    if (state.phase !== 'finishing' && state.phase !== 'uploading') return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [state.phase]);

  return { state, retry: deliver };
}
