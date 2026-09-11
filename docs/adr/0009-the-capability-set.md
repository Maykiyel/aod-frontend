# The capability set, and the backend policy behind each

ADR 0007 settled that screens branch on capabilities rather than on
`member_role`. It did not say which capabilities exist. Ticket #2 has to derive
them, so this records the set and, for each, the backend policy that is the
actual authority.

| Capability | Roles | Backend authority |
| --- | --- | --- |
| `canViewTeamData` | any active member | `TeamPolicy::view`, `SessionPolicy::viewAny` |
| `canConfigureSessions` | `main_coach`, `assistant_coach` | `SessionPolicy::create`, `::start`, `::complete`, `::transition` |
| `canAuthorAnnotations` | `main_coach`, `assistant_coach` — but see below | `SessionPolicy::annotateTimeline` |
| `canConfigureTeamSettings` | `main_coach`, `assistant_coach` | `TeamSettingsPolicy::update` |
| `canManageMembers` | `main_coach` | `TeamPolicy::manageMembers` |

Derived in `src/features/team/capabilities.ts` from the membership, not the role,
so the teamless case is answered in one place rather than at every call site.

## Considered options

Three of these are true for exactly the same two roles today, which argues for
collapsing them into one `isCoach` flag. Rejected: that is a role check wearing a
capability's name, and it is precisely what ADR 0007 exists to prevent. Each flag
names a distinct policy that can move on its own — `annotateTimeline` already
diverges by session status in a way the others do not.

`canAuthorAnnotations` is the loosest fit. The backend also lets a *player*
annotate once a session is `analysis_ready`, so the real rule is session-scoped
and this team-scoped flag only answers "may author while the timeline is under
review". Ticket #9 or #10 will have to narrow it against a session; it is
recorded here so that narrowing is a known job rather than a surprise.

## Consequences

`canViewTeamData` and `canConfigureTeamSettings` gate sidebar destinations, so a
player is not offered Settings and a user with no team is offered only the
dashboard. `canConfigureSessions` picks the dashboard's empty-state instruction.

`canManageMembers` and `canAuthorAnnotations` have no surface yet — there is no
Team screen and no Review Board. They are derived and exported now because the
whole point of ADR 0007 is that the derivation happens once; their first
consumers arrive with those screens.

A flag still only ever hides a control. The policies above are the authority.
