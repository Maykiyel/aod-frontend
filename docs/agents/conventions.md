# Project conventions

## Package manager: pnpm, only

`pnpm` for every install, script and binary. Never `npm` or `yarn` — a stray
`npm install` writes a second lockfile and resolves a different tree.
`package-lock.json` has been removed; `pnpm-lock.yaml` is the lockfile.

`pnpm install` currently reports `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` for
five entries (`vite`, `nanoid`, `electron-to-chromium`, `baseline-browser-mapping`,
`update-browserslist-db`). That is a supply-chain policy rejecting packages
published inside a recent cutoff window, not a sign of tampering — the lockfile
dates from the initial commit and the packages are ordinary transitive deps.
Install still completes. **Do not "fix" it by running `pnpm clean --lockfile`**;
that re-resolves the tree and is a decision for the repo owner.

## Architecture: bulletproof-react

<https://github.com/alan2207/bulletproof-react>

A **strong default, not law** — the same standing as the `vercel-composition-patterns`
and `vercel-react-best-practices` skills. Where any of the three fights the
design system's constraints, the design system wins and the departure gets a
sentence in the code saying why.

### Folder structure

```
src
├── app            # routes, provider, router — the application layer
├── assets
├── components     # shared components used across the whole app
│   └── ui         # the design-system primitives
├── config
├── features
│   └── <feature>  # api, assets, components, hooks, stores, types, utils
├── hooks
├── lib            # preconfigured reusable libraries (the HTTP client)
├── stores
├── styles         # the token contract (this repo's addition)
├── testing
├── types
└── utils
```

### Rules

- **kebab-case** for every file and folder under `src`. Component *exports* stay
  PascalCase: `src/components/ui/button/button.tsx` exports `Button`.
- **`@/*` maps to `./src/*`.** Wired in `tsconfig.app.json` and `vite.config.ts`.
  Use it across layers; keep relative imports for colocated files such as a
  component's own `.module.css`.
- **Unidirectional flow: shared → features → app.** A feature never imports
  another feature. `app/` may import from both.
- **No barrel files.** Import the module directly. Both bulletproof-react's own
  docs and the Vercel `bundle-barrel-imports` rule say so, so the reference app's
  per-component `index.ts` is not copied here.
- **Colocate.** Keep state, styles and helpers next to what uses them.
- Limit props; prefer composition through children or slots when a component
  starts collecting them.

## Reconciliations already decided

bulletproof-react leaves several choices open or suggests defaults this repo has
already settled. These are resolved, not open questions:

| Topic | bulletproof-react | This repo |
| --- | --- | --- |
| Styling | lists Tailwind, CSS-in-JS, component libraries | **CSS Modules over token custom properties** — ADR 0002 rejected Tailwind with reasons |
| UI library | suggests adopting one (MUI, Radix, …) | **None.** The 16 primitives are authored here — ADR 0001 |
| Testing | Vitest + Testing Library + MSW; integration tests are the focus | **Same**, narrowed to a single route-level seam — see the spec in #14 |
| Server cache | React Query / SWR | React Query, when the first query lands |
| Auth state | no guidance given | Bearer token in `localStorage` — ADR 0004 |
| Storybook | recommended as a component catalogue | **Not adopted.** Three-week prototype; revisit if the primitives outlive it |

## Testing

Vitest + Testing Library + MSW, matching bulletproof-react. The spec narrows it
to one seam: render a route with the network mocked at the HTTP boundary and
drive it as a user would. Find controls by accessible name. Never assert on
internal state, and never import a hook or store directly in a test.

Component-level unit tests are deliberately **not** written for the primitives —
a primitive's correctness shows up in the screen that uses it.
