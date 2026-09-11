# Broadcast events invalidate queries; they never patch the cache

When an Echo event arrives we invalidate the affected TanStack Query and let it
refetch, rather than writing the event's payload into the cache with
`setQueryData`.

The payloads are deliberately thin — `SessionStatusChanged` carries only
`session_id`, `team_id` and `status` — because `broadcastWith()` is shaped for
cheapness, not completeness. Patching from a partial means reconstructing entity
shape from fragments, and any omitted field silently keeps a stale value. The
event volume here is five players in a lobby, so the extra round trip costs
nothing worth protecting.

**The rule: a broadcast payload says that something changed, never what it now
is.**

## Consequences

One exception, and it is not a cache write. `SessionStatusChanged` arriving with
`analysis_ready` is a signal to open the timeline route, not data to store.
