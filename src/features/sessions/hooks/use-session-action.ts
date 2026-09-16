import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionKeys } from '@/features/sessions/api/get-sessions';

/** Every lobby action lands the same way: invalidate, refetch (ADR 0005).
 *  Nothing here writes a Session into the cache. `afterwards` is for the one
 *  action that also has somewhere to go. */
export function useSessionAction(
  action: (sessionId: number) => Promise<unknown>,
  afterwards?: () => Promise<unknown> | void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      await afterwards?.();
    },
  });
}
