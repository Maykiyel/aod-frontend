# CSS Modules over Tailwind

The design handoff prescribes Tailwind with its theme remapped from the token
files. We use CSS Modules over the token custom properties instead: one
`.module.css` beside each component, with values referenced as `var(--space-6)`.

## Considered options

Tailwind's case did not survive the specifics.

The hard parts of this design — grooves, the notch SVG mask, the 45° absence
hatch, `clip-path` hex and skew geometry, the sync-ring rotation, the status
pulse, and the mandated 120ms hover transitions — are all real CSS that utilities
do not express, so we are writing CSS either way.

The type scale cannot be utilities at all, because the tokens are CSS `font:`
shorthands; the handoff itself concedes they must be applied as
`style={{ font: 'var(--type-body)' }}`.

And two of Tailwind's benefits here are already ours: `tokens/base.css` ships the
`box-sizing: border-box` reset and the body defaults, making Preflight redundant,
while `borderRadius` would have to be gutted because radius is 0 in this system.

What remained was layout shorthand, at the cost of maintaining a second
vocabulary for values that already exist as custom properties.

## Consequences

Inline `style` props — the design system's own idiom — are also rejected. They
cannot express `:hover` or `::before`, both of which this design requires.
