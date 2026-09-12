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
import { formatCount, formatSpan } from '@/features/dashboard/format';
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
      <DashboardIdentity
        header={header.data}
        breakdown={breakdown.data}
        capabilities={capabilities}
      />

      <div className={styles.columns}>
        <div className={styles.main}>
          {/* The single stat block screens 06 and 07 put above the grid. The
              team-wide total, so it stands in both roles and in a short pool. */}
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>SESSIONS LOGGED</span>
            <span className={styles.statValue}>{formatCount(header.data.analysisReadyCount)}</span>
          </div>

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

/** Whether to frame the screen as screen 07 rather than 06. The shape
 *  `GET /dashboard/players` chose is the server's own role branch and answers
 *  first; a short pool shapes no body, so the coach capability stands in for
 *  copy alone — it still hides nothing and grants nothing (ADR 0007). */
function isPersonal(breakdown: PlayerBreakdown | undefined, capabilities: Capabilities): boolean {
  if (breakdown?.status === 'comparison') return true;
  if (breakdown?.status === 'roster') return false;
  return !capabilities.canConfigureSessions;
}

/** The identity block: screen 06 names the team, screen 07 names the player. */
function DashboardIdentity({
  header,
  breakdown,
  capabilities,
}: {
  header: DashboardHeader;
  breakdown: PlayerBreakdown | undefined;
  capabilities: Capabilities;
}) {
  const personal = isPersonal(breakdown, capabilities);

  return (
    <SectionHeader
      as="h1"
      eyebrow={personal ? 'My dashboard — player' : 'Team dashboard — coach'}
      index={formatSpan(header.window.from, header.window.to) ?? undefined}
      title={personal ? header.user.username : header.team.team_name}
    />
  );
}
