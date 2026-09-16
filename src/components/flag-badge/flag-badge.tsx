import { Badge } from '@/components/ui/badge/badge';
import { Icon } from '@/components/ui/icon/icon';

/** The disc a notched card nests in its clearance. Named, so the flagged item is
 *  perceivable rather than only visible — there is one per screen and which item
 *  carries it is a decision (HANDOFF.md, non-negotiable system rules).
 *  Shared rather than a primitive: the sixteen are fixed (ADR 0001), and what it
 *  names is a screen-level rule rather than anything sessions owns. */
export function FlagBadge() {
  return (
    <Badge role="img" aria-label="Flagged">
      <Icon name="flagAdd" size={14} />
    </Badge>
  );
}
