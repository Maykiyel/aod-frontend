## Agent skills

### Issue tracker

Issues live as GitHub issues in `Maykiyel/aod-frontend`, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, using the default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Backend contract

The API is a separate repo, `Joe-Zupo/aod-backend`, cloned locally at
`D:\Projects\aod-backend`. It is the **authority** on endpoints, payload shapes,
enum values, auth, broadcast channels and event names.

Before writing anything that touches the API, read there:

- `CONTEXT.md` — the domain glossary. Domain terms are defined in that file, not
  in this repo's `CONTEXT.md`. Do not redefine or rename them here.
- `routes/api.php`, `routes/channels.php` — the endpoint and channel surface.
- `docs/adr/` — the decision behind whatever you are about to touch.

Never infer a contract from the design handoff or the diagrams; both are older
than the backend and at least one is known to be wrong about it. If the backend
clone is missing, say so rather than inventing the shape.

### Design

Reference designs, the handoff spec and the design-system bundle are in
`docs/design/` — see `docs/design/README.md` for what each is and how long it
stays. Tokens are the contract: `src/styles/tokens.css` and the files under
`src/styles/tokens/`. Never eyeball a value off a mock.

### Diagrams

`docs/diagrams/` holds the ERD and end-to-end flow, each in a no-Riot and a
with-Riot variant. The no-Riot pair is current scope; the with-Riot pair is the
reserved future shape.
