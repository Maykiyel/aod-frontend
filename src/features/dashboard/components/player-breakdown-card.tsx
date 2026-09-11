import { InlineError } from '@/components/states/inline-error/inline-error';
import { Skeleton } from '@/components/states/skeleton/skeleton';
import { RosterTable } from '@/features/dashboard/components/roster-table';
import { ShortPoolNotice } from '@/features/dashboard/components/short-pool-notice';
import { YouVsMedian } from '@/features/dashboard/components/you-vs-median';
import type { PlayerBreakdown } from '@/features/dashboard/types';

interface PlayerBreakdownCardProps {
  breakdown: PlayerBreakdown | undefined;
  error: Error | null;
  onRetry: () => void;
}

/** The per-player block, whichever way the server shaped it. Its own loading and
 *  error treatments, so a failure here leaves the team-wide numbers standing. */
export function PlayerBreakdownCard({ breakdown, error, onRetry }: PlayerBreakdownCardProps) {
  if (error) return <InlineError message={error.message} onRetry={onRetry} />;
  if (!breakdown) return <Skeleton label="Loading the player breakdown" />;

  switch (breakdown.status) {
    case 'short':
      return (
        <ShortPoolNotice
          card="Player stats"
          message={breakdown.message}
          window={breakdown.window}
        />
      );

    case 'roster':
      return <RosterTable players={breakdown.players} />;

    case 'comparison':
      return <YouVsMedian you={breakdown.you} teamMedian={breakdown.teamMedian} />;
  }
}
