import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import type { Session } from '@/types/api';

/** A destination this ticket routes to but does not build: the lobby (#5),
 *  recording (#7) and the Review Board (#9/#10). A later ticket replaces the
 *  Screen, not the route (spec #33). */
export function SessionPlaceholder({
  session,
  destination,
}: {
  session: Session;
  destination: string;
}) {
  return (
    <EmptyState
      eyebrow={session.session_code ?? 'Session'}
      title={destination}
      reading={`SESSION:${session.status.toUpperCase()}`}
    >
      <EmptyStateInstruction>
        No view has been built for this section. Nothing is missing from the session
        behind it.
      </EmptyStateInstruction>
    </EmptyState>
  );
}

/** A status this client does not know. The Session is real and the server served
 *  it, so the Screen says so rather than reporting a failure. */
export function UnknownSession({ session }: { session: Session }) {
  return (
    <EmptyState
      eyebrow={session.session_code ?? 'Session'}
      title={session.session_name}
      reading={`SESSION:${session.status.toUpperCase()}`}
    >
      <EmptyStateInstruction>
        This session is in a state this version of the client does not know how to
        show. Reload to pick up a newer one.
      </EmptyStateInstruction>
    </EmptyState>
  );
}
