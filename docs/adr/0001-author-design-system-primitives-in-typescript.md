# Author the design-system primitives in TypeScript rather than ship the bundle

The AOD Comms design system arrived as `_ds_bundle.js`: a 55K IIFE that reads
React off `window.React` and exposes 18 components as a global. No `.jsx` source
and no types shipped, though the manifest's `sourcePath` entries show a source
repo exists somewhere. We author the 16 primitives ourselves in TypeScript
instead of consuming the bundle.

## Considered options

Shipping the bundle was the fast path and we rejected it for three reasons: the
components would be permanently unmodifiable, we would be hand-maintaining 18
type declarations against an opaque blob, and `docs/design/` would become a
runtime dependency instead of the deletable reference folder it is meant to be.

The deciding factor was that **the bundle has no hover states and no
pseudo-elements at all** — it injects no CSS, and substitutes real DOM nodes
where the design wants `::before`/`::after` — while the design mandates 120ms
hover transitions throughout. We would have been patching it from the outside
on the first screen.

Asking the designer for the design-system source repo was the better option and
remains open. **If it turns up, prefer its values — not its components.** See
*The source turned up* below, which is what happened.

## The source turned up

Added 2026-09-11. The design-system repo was located: a remote-less local
checkout on one of the two development machines, `aod-comms-design-system@4.0.0`.
Its source is now vendored at `docs/design/_ds/source/` — 16 primitives as
`.jsx`, each with a hand-written `.d.ts` documenting every prop and a
`.prompt.md` of usage rules.

**This decision does not change, because the deciding factor is in the source
too.** Every primitive styles itself with a React inline `style` object and
nothing else — no `className`, no stylesheet, no pseudo-classes anywhere in the
16 files. The `style` attribute carries no selector, so `:hover`,
`:focus-visible`, `:active`, `::before` and `::after` cannot be expressed in it
at all. The bundle has no hover states because its source has none. Three tells:

- `Button.jsx` declares `transition: background 120ms linear` on an element that
  never changes background — the design's hover timing recorded in the one place
  that cannot act on it.
- `GrooveStrip.jsx` loops out `<span>` nodes for the groove slots because
  pseudo-elements are unavailable.
- `Input.jsx` sets `outline: 'none'` and supplies no replacement, because a
  replacement needs `:focus-visible`. Shipping it as-is would put a field with no
  visible keyboard focus on the login screen.

So the source changes the **cost** of this decision, not its direction. It
supplies the values — geometry, spacing, colour, variant logic — and the prop
APIs, already designed, in the `.d.ts` files. We supply the interaction layer the
authoring model could not hold, in CSS Modules per ADR 0002. Port from the
vendored source; do not import it, link it, or ship the bundle.

One vendored file diverges from upstream on purpose: `NotchedCard.jsx`. Upstream
stretched a single SVG mask to the element box, distorting the notch's 7px fillet
by each card's aspect ratio. `src/styles/tokens/geometry.css` already carries the
fix — a fixed 60px corner tile plus two fills — and the vendored component
matches it.

## Consequences

The two screen-level kits in the manifest, `ReviewBoard` and `SessionsList`, are
deliberately **not** reproduced. They are shaped around the bundle's mock data,
and Screen 12 is built directly against the real timeline payload instead.
