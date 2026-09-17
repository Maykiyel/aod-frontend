# Chunk recordings to IndexedDB; keep zero-offset clock maths but capture the offsets

Two decisions about recording, taken together because they share one backend
migration.

**Durability.** `MediaRecorder` runs with a 5s `timeslice`, and each chunk is
appended to IndexedDB as it arrives, reassembled and uploaded on stop, then
cleared on success. On boot, orphaned chunks surface as a recoverable recording.
Holding the whole take in memory was simpler and loses everything to a closed tab
or a sleeping laptop; the worst case here is the last five seconds instead.

This is a fallback, not a backup — it is same-browser-same-device only. A take
that genuinely matters should also be recorded locally with OBS.

**The clock.** The backend assumes all recordings share t=0 (its ADR 0004, the
"zero-offset assumption"), but five browsers do not start recording at the same
moment. We keep rendering on zero-offset maths, which sits inside tolerance given
dead-air thresholds measured in seconds and a 5000ms default alignment window.
But each upload carries a nullable `client_started_at` that the backend stores
unused.

> **Amended during #7, and this paragraph rewritten with it.** Two premises here
> were wrong, and both are settled the other way now.
>
> Recording does **not** start when a Pusher event reaches each client.
> `getDisplayMedia` requires a transient user activation, so no client can begin
> capturing off the back of a broadcast: capture is player-initiated, and the
> client calls `start-recording` once both tracks are live. The skew between
> players is therefore the interval each of them spent picking a window, which is
> seconds rather than the 50–300ms this ADR estimated. That makes capturing
> `client_started_at` more worth having, not less.
>
> The elapsed reading on screens 10 and 11 is **not** the Session's. It counts
> that player's own recorder, whose zero their browser already holds, and a Coach
> has no recorder and so no elapsed clock at all. The design's
> `ELAPSED ON SESSION CLOCK` label is wrong about it.
>
> The conclusions stand: chunk to IndexedDB, keep zero-offset maths, capture the
> offsets. What the paragraph above says about **why** does not.
>
> #7 also found a branch this ADR does not cover. `MediaRecorder` cannot resume
> across a page load, and two separately-headered WebM streams do not concatenate
> into a valid file without remuxing, so a reload leaves a player holding two
> takes while the endpoint stores one per participant. The earlier take is
> offered as a file to save and a fresh recorder starts; see
> `0012-capture-as-a-declared-port.md`, which also records where the browser's
> copy is cleared.

## Consequences

Capturing the offset now costs one column in the same migration as the per-player
upload endpoint. Discovering in week three that dead-air boundaries look wrong,
with no data to check it against, costs a second round trip to the backend and a
second migration. The Riot variant of the ERD already carries `sync_offset_ms` in
this position, so the shape is where the design was heading anyway.

Drift does not hurt where it looks like it should. Communication Events are
per-player, so being 200ms out inside one lane is invisible. Dead Air is computed
across the whole team's merged spans, and Alignment compares comms to Game Events
the coach typed from the VOD — a third clock again. Those are the two readings to
distrust first if the numbers ever look wrong.
