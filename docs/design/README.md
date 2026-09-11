# Design reference

Vendored from the Claude Design handoff bundle for Beyond Mechanics. **This is
reference material, not production code**, and it is temporary — see *Lifecycle*.

## What is here

| Path | What it is |
| --- | --- |
| `HANDOFF.md` | The handoff spec: screens, stack decisions, animation rules, copy rules, token reference. The single most useful file here. |
| `*.dc.html` | 17 reference screens in a bespoke authoring format (`{{ }}` holes, `<sc-for>`, `DCLogic`). **That syntax exists nowhere outside the authoring tool — read for structure, styling and copy; never port the markup literally.** |
| `assets/*.png` | Review Board screenshots used as the landing page's product shot. |
| `_ds/_ds_bundle.js` | The design system compiled to an IIFE that reads React off `window.React` and assigns `window.AODComms`. No `.jsx` source ships with it. |
| `_ds/_ds_manifest.json` | The component list and their source paths in the design-system repo. |
| `_ds/source/` | The design system's **`.jsx` source**, vendored from the upstream repo: 16 primitives, each with a documented `.d.ts` and a usage `.prompt.md`. The thing to port from — see `_ds/source/README.md`. |
| `_ds/USAGE.md` | How the design system expects to be used (no provider, inline `style` props, token custom properties). |

## What is NOT here

The upstream `*.card.html` component demos and the `guidelines/*.html` cards.
Both need the design-system repo's own `styles.css` and `support.js` harness to
render, and that repo is a remote-less local checkout present on only one of the
development machines. For behaviour you can open in a browser, use
`_ds/_ds_bundle.js`.

The component **source** was originally absent here — only the compiled bundle
shipped. It has since been obtained and vendored into `_ds/source/`. How this
project consumes the design system is a decision recorded in `docs/adr/`.

## Lifecycle

The token CSS and the fonts were lifted out of this bundle into
`src/styles/tokens/` and `public/fonts/` — **those ship and are permanent.**

Everything in this folder is build-time reference only. Delete the folder once
the frontend is built; git history keeps it, so a screen can always be recovered
with `git show <rev>:docs/design/'<file>'`.

## Warning

`HANDOFF.md` is not authoritative about the backend. It states the backend uses
Laravel session auth with CSRF; it does not — it issues Sanctum bearer tokens.
Treat every backend claim in it as a guess and check the backend checkout, which
sits beside this repo at `../aod-backend`.
