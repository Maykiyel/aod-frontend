import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import type { DashboardWindow } from '@/features/dashboard/types';

interface ShortPoolNoticeProps {
  /** The card that collapsed, e.g. 'Communication KPI'. */
  card: string;
  /** The server's own wording, shown rather than replaced. */
  message: string;
  window: DashboardWindow;
}

/** A data card the backend collapsed because the pool came up short. The empty
 *  treatment, not the error one: fewer sessions than asked for is a count, not
 *  a failure, and must not read as one. */
export function ShortPoolNotice({ card, message, window: pool }: ShortPoolNoticeProps) {
  return (
    <EmptyState
      eyebrow="Session pool"
      title={card}
      reading={`ANALYSED ${pool.sessions_analyzed} OF ${pool.sessions_requested}`}
    >
      <EmptyStateInstruction>{message}</EmptyStateInstruction>
    </EmptyState>
  );
}
