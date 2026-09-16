import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { InlineError } from '@/components/states/inline-error/inline-error';
import { Skeleton } from '@/components/states/skeleton/skeleton';
import { sessionQuery } from '@/features/sessions/api/get-session';
import { teamSessionsQuery } from '@/features/sessions/api/get-sessions';
import { CancelledSession } from '@/features/sessions/components/cancelled-session';
import { ProcessingSession } from '@/features/sessions/components/processing-session';
import { RecordingScreen } from '@/features/sessions/components/recording-screen';
import { RecoveredTake } from '@/features/sessions/components/recovered-take';
import {
  SessionPlaceholder,
  UnknownSession,
} from '@/features/sessions/components/session-placeholder';
import { SessionLobby } from '@/features/sessions/components/session-lobby';
import { sessionState } from '@/features/sessions/session-state';
import { TeamSettingsPanel } from '@/features/team-settings/components/team-settings-panel';
import { useMembership } from '@/features/team/hooks/use-membership';
import { useAuth } from '@/lib/auth-store';
import type { Session } from '@/types/api';
import styles from './session.module.css';

const NOT_YOUR_TEAM = 'This session belongs to a team you are not an active member of.';

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

  // A processing Session serves no body, so it is narrowed out here rather than
  // branched around the recovery notice.
  const readable = read.data.status === 'readable' ? read.data.session : null;

  return (
    <div className={styles.stack}>
      {/* Above whichever Screen the status dispatches to, processing included:
          a Coach who completes puts every player's Session there, so it is the
          commonest place an orphan's owner will ever look again. */}
      <RecoveredTake sessionId={sessionId} live={readable ? isLive(readable.status) : false} />
      {readable ? (
        <SessionScreen session={readable} />
      ) : (
        <ProcessingReading sessionId={sessionId} />
      )}
    </div>
  );
}

/** A Session still taking deliveries. Anything else can no longer be delivered
 *  to, which is the difference the recovery notice has to state. */
const isLive = (status: string) => ['queuing', 'in_progress', 'delivering'].includes(status);

function SessionScreen({ session }: { session: Session }) {
  switch (sessionState(session.status).screen) {
    case 'lobby':
      return <Lobby session={session} />;
    case 'recording':
      return <Recording session={session} />;
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

/** The roster, the caller's capabilities and the Team Settings module are all
 *  resolved here: the lobby lives in the sessions feature, and a feature may not
 *  import another feature (conventions.md). */
function Lobby({ session }: { session: Session }) {
  const membership = useMembership();
  const { user } = useAuth();

  switch (membership.status) {
    case 'loading':
      return <Skeleton label="Loading the team" />;

    case 'error':
      return <InlineError message={membership.message} onRetry={membership.retry} />;

    // The endpoint denies an outsider as not found, so only a membership that
    // failed to resolve reaches this — it still gets an answer.
    case 'teamless':
      return <InlineError message={NOT_YOUR_TEAM} />;

    case 'member':
      return (
        <SessionLobby
          session={session}
          members={membership.team.members ?? []}
          selfId={user?.id ?? null}
          canRunSession={membership.capabilities.canConfigureSessions}
          settings={
            membership.capabilities.canConfigureTeamSettings ? <TeamSettingsPanel /> : undefined
          }
        />
      );
  }
}

/** The roster, the caller's capabilities and their own identity, resolved the
 *  same way the lobby's are and for the same reason: the Screen lives in the
 *  sessions feature, which may not import another (conventions.md). */
function Recording({ session }: { session: Session }) {
  const membership = useMembership();
  const { user } = useAuth();

  switch (membership.status) {
    case 'loading':
      return <Skeleton label="Loading the team" />;

    case 'error':
      return <InlineError message={membership.message} onRetry={membership.retry} />;

    case 'teamless':
      return <InlineError message={NOT_YOUR_TEAM} />;

    case 'member':
      return (
        <RecordingScreen
          session={session}
          members={membership.team.members ?? []}
          selfId={user?.id ?? null}
          canRunSession={membership.capabilities.canConfigureSessions}
        />
      );
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
