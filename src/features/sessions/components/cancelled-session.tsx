import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import type { Session } from '@/types/api';

/** Terminal, and built here because no later ticket owns it. Cancelling deletes
 *  the recordings delivered so far, so there is nothing behind this to reach.
 *  No date: the API carries when the Session was created, not when it ended. */
export function CancelledSession({ session }: { session: Session }) {
  return (
    <EmptyState
      eyebrow={session.session_code ?? 'Session'}
      title={session.session_name}
      reading="SESSION:CANCELLED"
    >
      <EmptyStateInstruction>
        This session was cancelled. Its recordings were discarded, so it has no
        timeline to review.
      </EmptyStateInstruction>
    </EmptyState>
  );
}
