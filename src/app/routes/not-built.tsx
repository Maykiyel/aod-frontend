import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';

/** A destination the sidebar reaches but no screen has been written for. Without
 *  it the link bounces off the catch-all back to the dashboard. Replace the
 *  element, not the route, when the screen arrives. */
export function NotBuiltRoute({ title }: { title: string }) {
  return (
    <EmptyState eyebrow="Not built" title={title} reading="SCREEN:PENDING">
      <EmptyStateInstruction>
        No view has been built for this section. Nothing is missing from the data
        behind it.
      </EmptyStateInstruction>
    </EmptyState>
  );
}
