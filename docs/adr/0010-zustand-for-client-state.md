# Zustand for client state, starting with the session

Server state stays in React Query. Client state that outlives a component and
crosses routes goes in a Zustand store. The session — `status` and `user` — is
the first and currently only such state, and moves out of React context into
`src/lib/auth-store.ts`.

## Considered options

**This overrides the handoff.** `docs/design/HANDOFF.md` and the spec in #14 both
say "no global store is needed; nothing in these screens shares client state
across routes", and that was accurate for the two screens they described. The
decision to standardise on one store library anyway is the repo owner's, taken
so the answer is settled before the lobby and the recording screens arrive rather
than argued per ticket.

Keeping React context was the alternative and it worked. Against it: a context
value can only be read from inside the tree, every consumer re-renders on any
change to the value, and the provider has to exist before anything can read it.
A store has none of those constraints. For the session specifically, the old
provider had to be mounted above the router purely so the route guards could ask
whether a token had been proved yet.

Redux Toolkit and Jotai were not seriously weighed. Nothing here needs Redux's
middleware or devtools story, and the atom model would fragment the session into
pieces that always change together.

## Consequences

`AuthProvider` and `AuthContext` are gone. `AppProvider` now wraps only the query
client, plus the one effect that proves a stored token on load.

Actions — `login`, `logout`, `restoreSession` — are plain exported functions, not
store fields, so a component that only calls one does not subscribe to it. The
401 handler is wired at module scope instead of in an effect, because the store
outlives every component that reads it.

The store is a module singleton, so it survives between tests in a file where a
remounted provider would not. `renderApp` resets it, which is what mounting a
fresh app already meant.

`initialAuthState()` reads the token at store creation, so a reload that already
has one starts at `checking` rather than flashing the login screen. That timing
is the one subtlety worth knowing: the read happens once, at module load.

Nothing else moves. Screen-local state — the composer's draft, a selected
marker, an elapsed timer — stays local, and anything the server owns stays in
React Query. A store is for state that genuinely crosses routes.
