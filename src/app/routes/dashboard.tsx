import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import { InlineError } from '@/components/states/inline-error/inline-error';
import { Skeleton } from '@/components/states/skeleton/skeleton';
import { SectionHeader } from '@/components/ui/section-header/section-header';
import { useMembership } from '@/features/team/hooks/use-membership';

/** Screens 06 and 07 are one route branching on capability (ADR 0007). This
 *  chunk renders only its empty, loading and error states; the figures are #3. */
export function DashboardRoute() {
  const membership = useMembership();

  switch (membership.status) {
    case 'loading':
      return <Skeleton label="Loading the team" />;

    case 'error':
      return <InlineError message={membership.message} onRetry={membership.retry} />;

    case 'teamless':
      return (
        <EmptyState eyebrow="Membership" title="No team yet" reading="MEMBERSHIP:NONE">
          <EmptyStateInstruction>
            Create a team, or join one with its team code, to start recording sessions.
          </EmptyStateInstruction>
        </EmptyState>
      );

    case 'member':
      return (
        <>
          <SectionHeader as="h1" eyebrow="Team dashboard" title={membership.team.team_name} />
          <EmptyState eyebrow="Sessions" title="Nothing recorded yet" reading="0 SESSIONS LOGGED">
            <EmptyStateInstruction>
              {membership.capabilities.canConfigureSessions
                ? 'Create a session to start recording. Figures appear here once the first session has been analysed.'
                : "Figures appear here once your team's first session has been analysed."}
            </EmptyStateInstruction>
          </EmptyState>
        </>
      );
  }
}
