import { useQueryClient } from '@tanstack/react-query';
import { sessionKeys } from '@/features/sessions/api/get-sessions';
import { SESSION_EVENTS, sessionChannel } from '@/features/sessions/live';
import { useLiveChannel } from '@/lib/live-updates/hooks';

/** Hold the Session's channel for as long as the Screen is mounted. Every one of
 *  the five events invalidates rather than patches, and the refetch is the new
 *  state (ADR 0005) — including the status move that takes the Screen away. */
export function useSessionLive(sessionId: number): void {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: sessionKeys.all });

  useLiveChannel(sessionChannel(sessionId), {
    [SESSION_EVENTS.participantJoined]: invalidate,
    [SESSION_EVENTS.participantLeft]: invalidate,
    [SESSION_EVENTS.participantStatusChanged]: invalidate,
    [SESSION_EVENTS.sessionStatusChanged]: invalidate,
    [SESSION_EVENTS.participantRecordingUploaded]: invalidate,
  });
}
