import { useQuery } from '@tanstack/react-query';
import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import { InlineError } from '@/components/states/inline-error/inline-error';
import { Skeleton } from '@/components/states/skeleton/skeleton';
import { SectionHeader } from '@/components/ui/section-header/section-header';
import { teamSessionsQuery } from '@/features/sessions/api/get-sessions';
import {
  ActiveSessionNotice,
  CreateSessionForm,
} from '@/features/sessions/components/create-session-form';
import { SessionList } from '@/features/sessions/components/session-list';
import type { Capabilities } from '@/features/team/capabilities';
import { useMembership } from '@/features/team/hooks/use-membership';
import type { Session, Team } from '@/types/api';
import styles from './sessions.module.css';

/** The Sessions Screen: the team's sessions, and the one control that makes a
 *  new one. Any active member reaches it; only a coach is offered the control. */
export function SessionsRoute() {
  const membership = useMembership();

  switch (membership.status) {
    case 'loading':
      return <Skeleton label="Loading the team" />;

    case 'error':
      return <InlineError message={membership.message} onRetry={membership.retry} />;

    case 'teamless':
      // The sidebar withholds this destination without a team, so only a typed
      // address arrives here — it still gets an answer rather than a blank.
      return (
        <EmptyState eyebrow="Membership" title="No team yet" reading="MEMBERSHIP:NONE">
          <EmptyStateInstruction>
            Sessions belong to a team. Create one, or join one with its team code.
          </EmptyStateInstruction>
        </EmptyState>
      );

    case 'member':
      return <TeamSessions team={membership.team} capabilities={membership.capabilities} />;
  }
}

/** One request feeds this Screen and the dashboard's two session blocks. */
function TeamSessions({ team, capabilities }: { team: Team; capabilities: Capabilities }) {
  const index = useQuery(teamSessionsQuery(team.id));

  if (index.isPending) return <Skeleton label="Loading the sessions" />;

  if (index.error) {
    return <InlineError message={index.error.message} onRetry={() => void index.refetch()} />;
  }

  const { all, live } = index.data;

  return (
    <>
      <div className={styles.head}>
        {/* The screen names itself in the h1: the dashboard already takes the
            team name, and two routes with one heading tell the reader nothing. */}
        <SectionHeader
          as="h1"
          eyebrow={team.team_name}
          index={`${all.length} SESSIONS`}
          title="Sessions"
        />
        {capabilities.canConfigureSessions ? (
          <div className={styles.control}>
            <CreateControl teamId={team.id} live={live} />
          </div>
        ) : null}
      </div>

      {all.length > 0 ? (
        <SessionList label="Sessions" sessions={all} />
      ) : (
        <EmptyState eyebrow="Sessions" title="No sessions yet" reading="SESSIONS:0">
          <EmptyStateInstruction>
            {capabilities.canConfigureSessions
              ? 'Name a session above to start recording against it.'
              : 'A coach starts sessions for the team. One appears here once they do.'}
          </EmptyStateInstruction>
        </EmptyState>
      )}
    </>
  );
}

/** A team runs one Session at a time, so the control is withheld before it is
 *  tried rather than after the server refuses (spec #33). */
function CreateControl({ teamId, live }: { teamId: number; live: Session | null }) {
  return live ? <ActiveSessionNotice session={live} /> : <CreateSessionForm teamId={teamId} />;
}
