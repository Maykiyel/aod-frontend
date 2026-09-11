import { useQuery } from '@tanstack/react-query';
import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import { InlineError } from '@/components/states/inline-error/inline-error';
import { Skeleton } from '@/components/states/skeleton/skeleton';
import { SectionHeader } from '@/components/ui/section-header/section-header';
import {
  dashboardHeaderQuery,
  dashboardPlayersQuery,
} from '@/features/dashboard/api/get-dashboard';
import { CommMixCard } from '@/features/dashboard/components/comm-mix-card';
import { KpiGrid } from '@/features/dashboard/components/kpi-grid';
import { PlayerBreakdownCard } from '@/features/dashboard/components/player-breakdown-card';
import { SessionPoolCard } from '@/features/dashboard/components/session-pool-card';
import { ShortPoolNotice } from '@/features/dashboard/components/short-pool-notice';
import { formatSpan } from '@/features/dashboard/format';
import type { DashboardHeader, PlayerBreakdown } from '@/features/dashboard/types';
import type { Capabilities } from '@/features/team/capabilities';
import { useMembership } from '@/features/team/hooks/use-membership';
import styles from './dashboard.module.css';

/** Screens 06 and 07 are one route branching on capability (ADR 0007). */
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
      return <TeamDashboard capabilities={membership.capabilities} />;
  }
}

/** The numbers, pooled over the team's most recent analysis-ready sessions.
 *  Mounted only once a membership resolves, so it never asks for a dashboard the
 *  caller has no team for. Both queries are issued together, not in sequence. */
function TeamDashboard({ capabilities }: { capabilities: Capabilities }) {
  const header = useQuery(dashboardHeaderQuery());
  const breakdown = useQuery(dashboardPlayersQuery());

  if (header.isPending) return <Skeleton label="Loading the dashboard" />;

  if (header.error) {
    return <InlineError message={header.error.message} onRetry={() => void header.refetch()} />;
  }

  return (
    <>
      <DashboardIdentity header={header.data} breakdown={breakdown.data} />

      <div className={styles.columns}>
        <div className={styles.main}>
          {header.data.kpi.status === 'pooled' ? (
            <KpiGrid kpi={header.data.kpi.value} />
          ) : (
            <ShortPoolNotice
              card="Communication KPI"
              message={header.data.kpi.message}
              window={header.data.window}
            />
          )}

          <SessionPoolCard
            window={header.data.window}
            analysisReadyCount={header.data.analysisReadyCount}
            canConfigureSessions={capabilities.canConfigureSessions}
          />

          <PlayerBreakdownCard
            breakdown={breakdown.data}
            error={breakdown.error}
            onRetry={() => void breakdown.refetch()}
          />
        </div>

        <aside className={styles.rail}>
          {header.data.commMix.status === 'pooled' ? (
            <CommMixCard mix={header.data.commMix.value} />
          ) : (
            <ShortPoolNotice
              card="Comm mix"
              message={header.data.commMix.message}
              window={header.data.window}
            />
          )}
        </aside>
      </div>
    </>
  );
}

/** The identity block. Its framing follows the shape `GET /dashboard/players`
 *  chose — the server's own role branch, which is the authority ADR 0007 points
 *  at, so the screen reads neither `member_role` nor a sixth capability. */
function DashboardIdentity({
  header,
  breakdown,
}: {
  header: DashboardHeader;
  breakdown: PlayerBreakdown | undefined;
}) {
  const personal = breakdown?.status === 'comparison';

  return (
    <SectionHeader
      as="h1"
      eyebrow={personal ? 'My dashboard — player' : 'Team dashboard — coach'}
      index={formatSpan(header.window.from, header.window.to) ?? undefined}
      title={personal ? header.user.username : header.team.team_name}
    />
  );
}
