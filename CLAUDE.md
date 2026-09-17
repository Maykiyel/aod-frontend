## Agent skills

### Issue tracker

Issues live as GitHub issues in `Maykiyel/aod-frontend`, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, using the default label strings. See `docs/agents/triage-labels.md`.

### Project conventions

Code comments are **one line where possible, three at the outside** — the what
and the why, then stop. Long reasoning belongs in an ADR or a PR body.

`pnpm` only, never `npm`. Architecture follows **bulletproof-react**, and file
and folder names under `src` are kebab-case with `@/*` resolving to `./src/*`.
Treat it as a **strong default, not law**, exactly like the two Vercel skills
below. See `docs/agents/conventions.md` — it also records which bulletproof
suggestions this repo has already decided against, and why.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

`docs/notes/open-questions.md` holds what the code does but nobody has proved.
Not decisions, which are ADRs, and not work, which is the issue tracker.

### Backend contract

The API is a separate repo, `Joe-Zupo/aod-backend`, checked out **as a sibling of
this one** — `../aod-backend` from the repo root. Resolve it that way rather than
by absolute path: this project is developed on more than one machine and the
parent directory differs between them. It is the **authority** on endpoints,
payload shapes, enum values, auth, broadcast channels and event names.

Before writing anything that touches the API, read there:

- `CONTEXT.md` — the domain glossary. Domain terms are defined in that file, not
  in this repo's `CONTEXT.md`. Do not redefine or rename them here.
- `routes/api.php`, `routes/channels.php` — the endpoint and channel surface.
- `docs/adr/` — the decision behind whatever you are about to touch.

Never infer a contract from the design handoff or the diagrams; both are older
than the backend and at least one is known to be wrong about it. If the backend
checkout is missing, say so rather than inventing the shape.

### Design

Reference designs, the handoff spec and the design-system bundle are in
`docs/design/` — see `docs/design/README.md` for what each is and how long it
stays. Tokens are the contract: `src/styles/tokens.css` and the files under
`src/styles/tokens/`. Never eyeball a value off a mock.

The design system's own source is vendored at `docs/design/_ds/source/` — the 16
primitives as `.jsx`, with a documented `.d.ts` and a usage `.prompt.md` each.
**Port from there.** The upstream design-system repo is a remote-less local
checkout that exists on only one of the development machines, so never assume it
is present and never cite an absolute path to it; the vendored copy is the
record. Read `docs/design/_ds/source/README.md` first — it carries the two traps
(no hover states anywhere in the source, and one deliberate divergence in
`NotchedCard`).

### Diagrams

`docs/diagrams/` holds the ERD and end-to-end flow, each in a no-Riot and a
with-Riot variant. The no-Riot pair is current scope; the with-Riot pair is the
reserved future shape.

### React and TypeScript practice

Consult the `vercel-composition-patterns` and `vercel-react-best-practices`
skills for **all** React and TypeScript work in this repo — routes, feature
modules, API layers, hooks and state as much as components. Reaching for them
only when a primitive is being written is the failure mode: waterfalls, bundle
shape, re-render cost and boolean-prop creep bite hardest in feature and route
code, which is most of what gets written here.

Treat both as **strong defaults, not law.** Where a pattern they recommend fights
the design system's constraints — the fixed elevation ladder, groove count equal
to elevation level, comm-type colours fixed by the data model — the design system
wins, and the departure is worth a sentence in the code saying why.

This repo authors the 16 AOD Comms primitives itself (see
`docs/adr/0001-author-design-system-primitives-in-typescript.md`), so both skills
apply there too, alongside the vendored source in `docs/design/_ds/source/`.
