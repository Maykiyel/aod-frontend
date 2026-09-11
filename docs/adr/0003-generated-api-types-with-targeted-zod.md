# Generate API types from the backend's OpenAPI spec, with zod only where it earns it

The backend runs `dedoc/scramble` and serves a live OpenAPI 3.1 document at
`GET /docs/api.json` — 34 paths and 28 schemas, generated from its actual
controllers and form requests. We generate TypeScript types from that spec rather
than transcribing them, and hand-write zod schemas for three things only: the
auth response, the session timeline payload, and broadcast event payloads.

## Considered options

Hand-writing zod for all 28 resources buys runtime validation at the cost of
transcription that drifts silently whenever the backend changes. Generating alone
gives exactness for free but vanishes at compile time. The split puts runtime
checking exactly where a bad shape is hardest to diagnose.

Broadcast payloads are the real gap, and the reason this is not simply "generate
everything": Echo events never appear in an HTTP spec, and their shape lives in
each event's `broadcastWith()`.

## Consequences

The spec under-describes the API in at least one known place. `game_events` on
`POST /sessions/{session}/complete` generates as optional, because Scramble reads
validation rules and its presence is enforced in the controller — completion is
refused without it.

Treat generated optionality as a hint, not a guarantee, and check the controller
when it matters.
