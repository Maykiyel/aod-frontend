# Design-system source — vendored reference

The `.jsx` source behind `_ds_bundle.js`, vendored from the AOD Comms design
system repo (`aod-comms-design-system@4.0.0`, single commit *Import AOD Comms
Design System v4.0 from Claude Design*).

**This is reference material to port from, not code that ships.** Nothing here
is imported by `src/`. See
`docs/adr/0001-author-design-system-primitives-in-typescript.md`.

## Why it is vendored rather than linked

The upstream repo is a local-only checkout that exists on one of the two
machines this project is developed on. It has no remote. Vendoring is the only
thing that makes the port reproducible anywhere else — if you are reading this
on a machine without that checkout, this folder is the whole record.

## What is here

| Path | What it is |
| --- | --- |
| `components/{core,data,navigation}/*.jsx` | The 16 primitives. Reference implementations. |
| `components/**/*.d.ts` | Hand-written prop types **with prose on every prop.** The API is already designed — port these, do not invent new ones. |
| `components/**/*.prompt.md` | Usage rules per component: when to reach for it, what never to do with it. |
| `ui_kits/review-board/*.jsx` | `ReviewBoard` and `SessionsList`, the two screen-level kits. |

The upstream `*.card.html` demos are **not** vendored: they need the upstream
repo's `styles.css` and `support.js` harness to run. For behaviour you can poke
at in a browser, use `_ds_bundle.js` — that is what it is kept for.

## Two things to know before porting

**1. There are no hover states anywhere in this source.** Every primitive styles
itself with a React inline `style` object and nothing else — no `className`, no
injected stylesheet, no pseudo-classes. An inline style cannot express `:hover`,
`:focus-visible`, `::before` or `::after`. `Button.jsx` declares
`transition: background 120ms linear` on an element that has no second state to
transition to, which is the tell. The design mandates 120ms hover transitions
throughout, so **the interaction layer is yours to add** — that is the gap this
source does not close, and the reason ADR 0001 stands even though the source
turned up. Same limitation in the bundle, because the bundle is an honest build
of these files.

**2. `NotchedCard.jsx` diverges from upstream here, deliberately.** Upstream
stretched a single SVG mask to the element box, so the notch's 7px fillet and
10px corner radii distorted with each card's aspect ratio. The fix — already in
the shipped `src/styles/tokens/geometry.css` and in `_ds_bundle.js` — makes
`--notch-mask` a fixed 60px corner tile plus two gradient fills, moves the outer
rounding to `border-radius`, and adds `--notch-tile` / `--notch-radius`. The
component is patched to match, with a comment at the divergence. **Port the
version here, not the upstream one.**

Otherwise the vendored files are byte-identical to upstream, and upstream is
byte-identical to what `_ds_bundle.js` was built from.

## Tokens are not here

Token CSS lives in `src/styles/tokens/` and **ships**. It is already the fixed
version — box-sizing resolved, fonts self-hosted from `public/fonts/`, notch
geometry corrected. Never copy a token value out of this folder; read it from
`src/styles/tokens/`.
