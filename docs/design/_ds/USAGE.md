# Building with AOD Comms

## Setup — no provider

There is no theme provider and no context. A screen needs exactly two things:

```html
<link rel="stylesheet" href="_ds/aod-comms/styles.css">
<script src="_ds/aod-comms/_vendor/react.js"></script>
<script src="_ds/aod-comms/_vendor/react-dom.js"></script>
<script src="_ds/aod-comms/_ds_bundle.js"></script>
```

`styles.css` is `@import`-only; it pulls the seven token files that define every
`--*` custom property. Without it components render unstyled — the tokens resolve
to nothing and you get browser defaults on white. Components are on
`window.AODComms`: `const { Surface, Button, Tag, Icon } = window.AODComms;`

**Gotcha that will bite you: there is no `box-sizing: border-box` reset.** Every
component is content-box, so a `width` and its `padding` add up — `<Surface
level={2} style={{width: 118}}>` with the default `var(--space-6)` padding
measures ~150px. Either set `boxSizing: 'border-box'` yourself on anything you
give an explicit width, or size the content box and let padding extend it.

## The styling idiom — CSS custom properties, inline

No CSS classes, no utility vocabulary, no CSS modules. You style with the `style`
prop, and every value comes from a token:

```jsx
<div style={{ font: 'var(--type-body)', color: 'var(--text-secondary)',
              padding: 'var(--space-5)', gap: 'var(--space-3)' }}>
```

Type is a `font:` **shorthand** token, not separate size/weight props. The full
set: `--type-display-xl`, `--type-display-l`, `--type-display-m`,
`--type-display-s`, `--type-stat`, `--type-body-l`, `--type-body`,
`--type-body-s`, `--type-label`, `--type-data-l`, `--type-data`,
`--type-eyebrow`, `--type-micro`. Eyebrow, micro, label and tag text also take a
matching `letterSpacing`: `--track-eyebrow`, `--track-micro`, `--track-label`,
`--track-tag`. Families: `--font-display` (Big Shoulders Display, uppercase
only), `--font-body` (Inter), `--font-mono` (JetBrains Mono).

Colour: substrate `--void --well --ash --steel --steel-2 --steel-3`; text
`--text-primary --text-secondary --text-muted --text-on-accent --text-on-light`;
borders `--border-recessed --border-soft --border --border-raised
--border-overlay`; signal `--red --red-hover --cyan --aligned`; comm types
`--informative --declarative --compound --absence` (fixed by the data model —
never remap them). Spacing is `--space-1` … `--space-7` plus `--space-section`
and `--space-page-x`. Fixed chrome: `--size-sidebar` 212px, `--size-rail` 328px,
`--size-track-label` 88px, `--page-max`, `--board-max`.

## Rules the components already encode

- **Radius is 0.** Shape comes from cuts: `--clip-button`, `--clip-thumbnail`,
  `--clip-hex`, `--clip-statbar-skew`. Only badge discs and status dots are round.
- **Elevation is stacking order, not importance.** `<Surface level={0..4}>` — E0
  recessed (inputs, tracks), E1 fixed chrome, E2 cards, E3 selection/popovers, E4
  one blocking overlay. Step one rung at a time; an E2 card opens an E3 popover.
- **Groove count equals the level** and `Surface` draws it for you. Pass `behind`
  the colour of the surface underneath — a groove is a cut and shows what's below.
  Grooves belong on panels, cards and dividers only; on a button, input or table
  row they read as damage.
- **One inward notch per screen**, on the flagged item — `<NotchedCard badge={…}>`.
- **Mono means measured.** Timestamps, IDs, metrics and part numbers set in
  `--font-mono`: `SESSION_047`, `TIMELINE_ID:0043-A`, `00:14:22.480`, `ABSENCE 6.4s`.
- **Red is an instrument line, not a wash.** Max two background colours per view.
  `--cyan` only for genuinely live/syncing, `--aligned` only as a positive reading.
- **Icons are a closed set of 15**: `sync target add aperture split close tracks
  burst frame lens role feed filter play flagAdd`. Use `<Icon name="…" size={} />`.
  If a mark is missing, add it to the `GLYPHS` map in `Icon.jsx` — never paste a
  one-off SVG. No emoji, no unicode symbols as icons.
- **Copy reads like a readout**: facts with units, third person, sentence case for
  prose, uppercase for display and mono labels. Silence is counted, never scolded.

## A representative screen fragment

```jsx
const { Surface, SectionHeader, StatBar, Tag, Button, Icon } = window.AODComms;

<Surface level={1} padding="var(--space-6)" behind="var(--void)">
  <SectionHeader eyebrow="Foundations" index="03/09" title="Alignment"
                 lede="How well comms matched what happened in the game." />
  <div style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
    <StatBar label="Comm frequency" value="18.4" unit="/min" fill="var(--red)" />
    <StatBar label="Alignment" value="87" unit="%" fill="var(--aligned)" />
  </div>
  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
    <Tag tone="alert">ABSENCE 6.4s</Tag>
    <Tag tone="compound">COMPOUND</Tag>
    <Tag>SESSION_047</Tag>
  </div>
  <Button variant="live" icon={<Icon name="sync" size={13} color="var(--cyan)" />}>
    Re-sync
  </Button>
</Surface>
```

Use a library component for any control; use the tokens above for your own layout
glue. Before styling anything unusual, read `styles.css`'s token files and the
component's own `.prompt.md` and `.d.ts` — they are the contract, not this summary.

---

# AOD Comms Design System

The visual system for **AOD Comms** — an audio-based communication analysis tool for esports
teams. Coaches upload scrim audio-on-demand plus VOD, the product classifies every callout by
type, measures dead air, and scores how well comms aligned with what actually happened in the
game. One screen carries the product: the **Review Board**.

Version 4.0. Two mechanisms were added in this version: a five-rung **elevation ladder**, and
**edge grooves** whose count encodes a surface's elevation level.

## Sources

Everything here derives from material supplied by the project owner:

- `uploads/aod-comms-handoff-prompt.md` — the written brief: product context, audience, tone, the anti-patterns to avoid.
- `uploads/aod-comms-design-system-v3.html` — the previous version of this system. Its colour, type and component decisions were kept; v4 rebuilt the document around them.
- `uploads/edge-grooves.jpg` — reference photograph of a machined plate with milled edge slots. Source of the groove device.
- `uploads/Inverted-borders-inward-curves.jpg`, `uploads/path-douiri.org.svg` — reference for the inward notch. The SVG is the authoritative outline and is embedded as `--notch-mask`.
- `uploads/surfaces.jpg`, `uploads/shapesORicons.jpg` — surface and shape-language references.
- `AOD Comms Design System.dc.html` — the human-readable spec document this system was extracted from. Nine sections plus a fully mocked Review Board.
- `aod-comms-tokens.json` — the same tokens in Tokens Studio format, for import into Figma.

No codebase or Figma file was provided. No logo or brand mark was supplied, so the wordmark is
set in plain type (Big Shoulders Display, uppercase) wherever a mark would go — **do not draw one.**

## Content fundamentals

The product is an instrument. Copy reads like a readout, not like marketing.

- **Voice.** Third person and impersonal for anything measured ("Call lands after the rotate is already committed"). Second person only in instructions. Never "we".
- **Facts over adjectives.** "ABSENCE 6.4s", not "Long silence". Every number carries its unit. Never round a measurement to look tidier.
- **Casing.** Display headings and mono labels are uppercase. Body copy is sentence case. Tags are always uppercase.
- **Mono means measured.** If a string is a timestamp, an ID, a metric or a part number, it sets in JetBrains Mono. This single rule carries most of the instrumented character.
- **Identifiers look like part numbers.** `SESSION_047`, `TIMELINE_ID:0043-A`, `MOMENT_ID:0043-A`, `BUILD:4.0.2`. Underscores, colons, no spaces.
- **Terminology is fixed** by the data model: *informative*, *declarative*, *compound*, *absence*. Never invent a fifth comm type or rename one.
- **Silence is neutral.** Dead air is an interval that was counted, never an error. Copy never scolds — "6 gaps", not "6 failures".
- **No emoji.** Not in UI, not in docs. Status is a coloured dot, a diamond, or a mono tag.
- **Section labels are numbered** in mono: `01 // Foundations`, `03/09`.

## Visual foundations

**Palette.** A near-black substrate (`#08090C` through `#232A34`) and one brand accent, red
`#FF2E3E`, used as an instrument line: a 1px rule, a small badge fill, a corner mark, an active
indicator. Cyan `#3FE1D6` appears only where something is genuinely live or syncing; green
`#2ED573` only as a positive reading. Comm-type hues (violet, amber, pink) are fixed by the data
model and never remapped. Maximum two background colours per view. A large red wash turns an
analysis tool into a game skin — that is the single most important thing not to do.

**Type.** Three faces, three jobs, no overlap. Big Shoulders Display (800–900, uppercase) for
headlines, section titles and stat numbers. Inter (400–700) for everything read as prose. JetBrains
Mono for everything measured. Body copy never below 13px; the product is read for three-hour
stretches.

**Corners and shape.** Radius is 0 everywhere; 2px is the absolute ceiling for a rectangular
surface. Shape comes from cuts, not softening: a hexagonal clip for player slots, a single
bottom-left 22px clip on session thumbnails, a 10px bottom-right clip on secondary buttons, a 14px
diagonal seam joining the two halves of a stat bar. The only round things in the system are badge
discs and status dots.

**Elevation.** Five rungs, each carrying three stacked cues — a surface tint step, a 1px top-edge
highlight where light would catch a machined edge, and a shadow that tightens as a surface sits
closer to the plate. E0 is recessed (inset shadow, no highlight) for anything that receives input
or holds a track. E1 is fixed chrome. E2 is the working level for cards. E3 is selection and
transient surfaces. E4 is a single blocking overlay over a 60% void scrim. Every step is
deliberately small: the hierarchy should be felt, not noticed. Elevation encodes **stacking order,
not importance**, and a surface steps one rung at a time — an E2 card opens an E3 popover, never
an E4.

**Edge grooves.** Slots milled into a surface's top edge — 18×6px, 8px apart, 24px in from the
left. The count equals the elevation level, so depth stays readable in a screenshot with no
shadows. Slot fill always matches the surface behind, because a groove is a cut and shows what is
underneath. Structural panels, cards and section dividers only: on a button, an input or a table
row the slots read as damage.

**The inward notch.** The signature device. A rectangular step cut from a card's top-left corner
with a circular badge nested in the clearance — 7px radii on the outer and step corners, a fillet
at the inner joint. Cut with an SVG mask so whatever sits behind shows through; no background
matching, no fake patch. One per screen, on the flagged item. Because a mask clips the whole
render tree, the badge is always a **sibling** of the masked panel inside a shared relative
wrapper, and the masked panel loses its border — depth comes from tint and shadow alone.

**Machined plate texture.** A stepped plate silhouette at 5.5% white tucked into the corner of
real structural chrome, a 1px ring at 5%, and 3px bolt dots at all four corners. It appears on the
sidebar, the right rail and the board bezel. Never as a hero graphic on its own.

**Backgrounds.** Flat near-black with a 140px vertical rule at 2.8% white on document pages. No
gradients, no imagery behind content, no glassmorphism. The VOD frame uses a 44px grid and a dim
watermark as a placeholder for real footage.

**Data visualisation.** Every timeline lane shares one clock. Markers are diamonds coloured
strictly by comm type; the selected marker grows from 10px to 16px and gains a 4px halo. Absence
is the only region fill in the system and is always a 45° hatch at 85% over a 14% tint — never
solid. The playhead is a 1px white line with a small diamond head, clipped to the lane area so it
never sweeps across the 88px label column.

**Borders, shadows, transparency.** All borders are 1px, and the border colour is part of the
elevation rung. Shadows are always neutral black — never a coloured glow. Transparency is used only
for hairline highlights, hatches, plate texture and tag fills; there is no blur anywhere.

**Animation.** Almost none. The sync ring rotates continuously at 3.4s while something is
actually syncing. Live status dots pulse at 1.8s. Colour and border transitions are 120ms linear.
Nothing eases, bounces, or slides. Hover lightens a border to `--text-primary` or shifts a red
fill to `--red-hover`; there is no press-scale.

**Layout.** Fixed chrome widths: 212px sidebar, 328px review rail, 88px timeline label column.
Documents cap at 1200px, the board at 1440px, with 48px page gutters and 88px between sections.
The board is a desktop tool and scrolls horizontally below 1060px rather than reflowing. Sibling
groups always lay out with flex/grid and `gap`.

## Iconography

There is no third-party icon set and no icon font. The system uses a **closed set of 15 machined
marks** — rings, nuts, brackets, reticles — authored on a 24px grid with a 2px stroke and square
caps, and shipped as `components/core/Icon.jsx`: `sync, target, add, aperture, split, close,
tracks, burst, frame, lens, role, feed, filter, play, flagAdd`.

Rules: no generic dashboard glyphs; no emoji; no unicode symbols used as icons. `sync` is the only
glyph that animates, and only while something is genuinely syncing. If a needed mark is missing,
**add it to the `GLYPHS` map** rather than pasting a one-off SVG — that is what keeps the set closed.

## Intentional additions

The source material defined no formal component inventory, so the component list was derived from
the spec document's own sections. Two pieces are conveniences rather than things the document names:

- `Icon` — a wrapper around the document's inline glyph set, so the closed set has one home.
- `PlateFrame` — factors out the plate silhouette + ring + bolt-dot treatment the document applies by hand to the sidebar, rail and bezel.

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | The single stylesheet to link. `@import` lines only. |
| `tokens/` | `fonts`, `colors`, `typography`, `elevation`, `geometry`, `spacing`, `base`. |
| `components/core/` | Surface, GrooveStrip, NotchedCard, Button, IconButton, Tag, Badge, Input, Icon. |
| `components/data/` | StatBar, HexSlot, TimelineTrack, AnnotationCard. |
| `components/navigation/` | NavItem, SectionHeader, PlateFrame. |
| `ui_kits/review-board/` | The Review Board and the Sessions list it opens from. |
| `guidelines/` | 18 specimen cards: colour, type, elevation, grooves, brand devices, spacing. |
| `AOD Comms Design System.dc.html` | The full human-readable spec, nine sections. |
| `aod-comms-tokens.json` | Tokens Studio export for Figma. |
| `SKILL.md` | Agent Skills entry point. |

## Using it in Figma

Import `aod-comms-tokens.json` through Tokens Studio (Tools → Load from file → Apply to document).
Import colours before elevation — the elevation surface and border tokens are aliases. Install Big
Shoulders Display, Inter and JetBrains Mono locally first. The notch imports as a vector: drag
`uploads/path-douiri.org.svg` onto the canvas.
