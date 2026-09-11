# One route per concept, gated by capability rather than role

Six designs ship as coach and player variants — dashboards 06/07, lobby 08/09,
report 12/12b — but they are one screen with capability differences, not two
screens. Each gets **one** route, branching internally.

Screens check capabilities (`canAuthorAnnotations`, `canManageMembers`), derived
once from the caller's `member_role` on their active team, rather than checking
the role directly. Role here has three values, not two: `main_coach` and
`assistant_coach` differ by exactly one capability — membership management — and
checking roles at the leaves leaks that distinction across the whole tree.

## Consequences

URLs stay stable and shareable, so a coach and a player discussing the same
report are looking at the same link.

A capability flag hides a control; it never grants one. The backend policies are
the authority, and the UI must never be the check.
