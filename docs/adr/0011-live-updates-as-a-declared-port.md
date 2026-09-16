# Live updates are a declared port at the app boundary

Broadcasts are not HTTP, so they cannot reach the boundary every test since #14
mocks. Rather than stub a third-party module or stand up a websocket server, the
app declares what it needs of a connection — `connect`, `disconnect`,
`subscribe(channel, handlers)`, and a connection reading — in
`src/lib/live-updates/live-updates.ts`. A Laravel Echo adapter supplies it in
production and a double supplies it under test.

This is the **second** seam in the repo, and the only one #38 sanctions. It sits
at the highest point in the app: `AppProvider` holds one instance, `AppShell`
opens the socket when the authenticated tree mounts and closes it when that tree
goes, and a Screen takes a channel on mount and releases it on unmount.

Echo rather than raw Pusher. None of the four session events declares
`broadcastAs()`, so the wire name is the full class name, which Echo addresses
with a leading dot and raw Pusher does not. Channel prefixes are the same trap,
and both fail silently when wrong.

## Consequences

A test drives the double and still asserts only on what a person sees at a route.
The one exception is subscription bookkeeping, which is invisible by
construction: two subscriptions render exactly what one does, so the double's
own subscribe and release calls are the only place a leak can be seen.

The adapter is built lazily and `laravel-echo` and `pusher-js` are dynamic
imports, so a checkout with no `VITE_PUSHER_APP_KEY` never loads either, connects
to nothing, and reports itself disconnected. The app starts and the tests run
without credentials, and the reading tells the truth about it rather than
claiming `API:OK`.

Not presence. `session.{id}` is a private channel authorised by reusing
`SessionPolicy::view`, so the live channel is never more or less permissive than
the REST endpoint beside it, and nothing about membership comes from the channel.
A browser that simply closes therefore broadcasts nothing; the participant stays
active until something calls the leave endpoint.
