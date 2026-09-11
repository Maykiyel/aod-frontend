# AOD Frontend

The React client for Beyond Mechanics, the product name for the AOD Communication
Analysis framework. Coaches run recorded practice games, players capture their own
mic and game window, and the analysis the API produces is presented for coach-led
review.

**Domain terms are defined in the backend, not here.** `Session`, `Timeline`,
`Timestamp`, `Communication Event`, `Dead-Air Period`, `Game Event`, `Annotation`,
`Reviewed`, `Analysis Ready` and the rest live in `D:\Projects\aod-backend\CONTEXT.md`.
Read them there and use them unchanged; this file defines only what is specific to
the client.

## Language

**Primitive**:
One of the sixteen AOD Comms design-system components this repo authors in
TypeScript — `Surface`, `Button`, `Tag`, `TimelineTrack` and the rest. Distinct
from a screen: a Primitive knows nothing about the API.
_Avoid_: widget, atom, UI component (ambiguous with screen-level components)

**Screen**:
One designed view, named by its number in the design handoff (`12 Post-match
report`). A Screen composes Primitives and reads server state; a Screen is not
the same thing as a route, since the coach and player variants of a Screen share
one route.
_Avoid_: page (reserved for the marketing landing page), view

**App Shell**:
The fixed sidebar chrome every Screen from the dashboards onward composes inside.
The landing page and the legal documents sit outside it.
_Avoid_: layout, frame

**Capability**:
A single thing the current user may do in their active team, derived once from
their `member_role` — authoring annotations, managing members, configuring a
session. Screens branch on Capabilities rather than on roles, because
`main_coach` and `assistant_coach` differ by exactly one of them.
_Avoid_: permission (that is the backend's Spatie term), role check

**Review Board**:
The client's name for Screen 12, where a Session's Timeline is presented as lanes
on one clock. The lanes are EVENTS and ABSENCE team-wide, then one per player.
_Avoid_: timeline (that is the backend entity this Screen displays, not the Screen)

**Lane**:
One horizontal row of the Review Board. A player Lane carries that participant's
Communication Events; the two team-wide Lanes carry Game Events and Dead-Air
Periods respectively.
_Avoid_: track (the design system's `TimelineTrack` renders a Lane, but the
concept and the Primitive are not the same thing), row

**Marker**:
The rotated-square glyph placed on a Lane for one Timestamp, coloured strictly by
communication type. Dead Air is the one thing never drawn as a Marker — it is the
system's only region fill.
_Avoid_: point, dot, event (ambiguous with Game Event)
