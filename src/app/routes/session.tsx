import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { InlineError } from '@/components/states/inline-error/inline-error';
import { Skeleton } from '@/components/states/skeleton/skeleton';
import { sessionQuery } from '@/features/sessions/api/get-session';
import { teamSessionsQuery } from '@/features/sessions/api/get-sessions';
import { CancelledSession } from '@/features/sessions/components/cancelled-session';
import { ProcessingSession } from '@/features/sessions/components/processing-session';
import {
  SessionPlaceholder,
  UnknownSession,
} from '@/features/sessions/components/session-placeholder';
import { sessionState } from '@/features/sessions/session-state';
import { useMembership } from '@/features/team/hooks/use-membership';
import type { Session } from '@/types/api';

const NOT_A_SESSION = 'That address does not name a session.';

/** Opening a Session: one route that dispatches on its status. The mapping is
 *  the decision this ticket makes; later tickets replace a Screen, not a route. */
export function SessionRoute() {
  const params = useParams();
  const sessionId = Number(params.sessionId);
  const isRoutable = Number.isInteger(sessionId) && sessionId > 0;

  const read = useQuery({ ...sessionQuery(sessionId), enabled: isRoutable });

  if (!isRoutable) return <InlineError message={NOT_A_SESSION} />;

  if (read.isPending) return <Skeleton label="Loading the session" />;

  // A session that does not exist, or belongs to another team, is denied as not
  // found — the server's own message is the legible one.
  if (read.error) {
    return <InlineError message={read.error.message} onRetry={() => void read.refetch()} />;
  }

  return read.data.status === 'processing' ? (
    <ProcessingReading sessionId={sessionId} />
  ) : (
    <ReadableSession session={read.data.session} />
  );
}

function ReadableSession({ session }: { session: Session }) {
  switch (sessionState(session.status).screen) {
    case 'lobby':
      return <SessionPlaceholder session={session} destination="Session lobby" />;
    case 'recording':
      return <SessionPlaceholder session={session} destination="Recording" />;
    case 'review':
      return <SessionPlaceholder session={session} destination="Review board" />;
    case 'cancelled':
      return <CancelledSession session={session} />;
    // Unreachable through a served body — the endpoint answers a processing
    // session with a conflict — but the mapping stays total.
    case 'processing':
      return <ProcessingSession session={session} />;
    case 'unknown':
      return <UnknownSession session={session} />;
  }
}

/** The membership is read here rather than in the feature, which may not import
 *  another feature (conventions.md). */
function ProcessingReading({ sessionId }: { sessionId: number }) {
  const membership = useMembership();

  return membership.status === 'member' ? (
    <ProcessingFromIndex teamId={membership.team.id} sessionId={sessionId} />
  ) : (
    <ProcessingSession />
  );
}

/** The index is the one endpoint that still lists a processing Session, and the
 *  only place its transcription figure is carried. A session past the first page
 *  is not found here, and the treatment stands without its figures. */
function ProcessingFromIndex({ teamId, sessionId }: { teamId: number; sessionId: number }) {
  const index = useQuery(teamSessionsQuery(teamId));

  if (index.isPending) return <Skeleton label="Loading the session" />;

  return <ProcessingSession session={index.data?.all.find((row) => row.id === sessionId)} />;
}
