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
pseudo-elements at all** — it injects no CSS and draws grooves as inline
gradients — while the design mandates 120ms hover transitions throughout. We
would have been patching it from the outside on the first screen.

Asking the designer for the design-system source repo was the better option and
remains open. If it turns up, prefer it over what we write.

## Consequences

The two screen-level kits in the manifest, `ReviewBoard` and `SessionsList`, are
deliberately **not** reproduced. They are shaped around the bundle's mock data,
and Screen 12 is built directly against the real timeline payload instead.
