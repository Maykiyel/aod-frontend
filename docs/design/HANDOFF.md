# Handoff: Beyond Mechanics — Frontend Implementation

## FIRST: ask for the backend repository

**Before writing any code, ask the user to connect the backend repository.**

This package covers the frontend only. Every screen here reads or writes server
data, and the contracts — endpoints, payload shapes, realtime channel names,
event class names, auth flow — live in the backend repo, not in this document.
Do not invent them, and do not scaffold mock API modules you will have to tear
out later.

Ask for the repo, read it, and derive from it:

- Route/endpoint list and the JSON each returns
- Model field names (they will differ from the display labels in these mocks)
- Broadcast channel names and event class names for realtime screens
- Auth mechanism and the shape of the session/user object
- Enum values for comm types, participant states, and session states
- Any existing frontend code, so you extend it rather than starting over

If the user has no backend yet, say so plainly and build against a typed mock
layer confined to a single `src/api/` module with one interface per resource,
so swapping it later touches one folder.

---

## Overview

**Beyond Mechanics** (product name; the analysis engine is referred to in
marketing copy as *the AOD Communication Analysis Framework*) is an audio-based
communication analysis tool for esports teams.

A coach opens a session, players join and grant mic + game-window capture, both
streams record on one shared session clock. After the coach ends the session,
every callout is transcribed and classified into one of four fixed categories,
silences longer than the team's threshold are logged as absence, and the whole
thing is laid out on a single timeline — the **Review Board** — where the coach
annotates moments and players reply.

14 screens are designed: a marketing landing page, a 5-step sign-up flow, two
role-specific dashboards, a 4-screen session/recording flow split by role, and
the Review Board in coach and player variants.

## About the design files

The files in this bundle are **design references authored in HTML**. They are
prototypes showing intended layout, styling and behaviour — **not production
code to copy**.

They are written as "Design Components" (`.dc.html`) in a bespoke authoring
format: a template with `{{ }}` value holes, `<sc-for>`/`<sc-if>` control-flow
tags, a `class Component extends DCLogic` logic block, and `<x-import>` tags
that mount design-system React components. **None of that syntax exists outside
the authoring tool.** Read them for structure, styling and copy; do not port the
markup literally.

Your task is to recreate these designs in the target codebase using its
established patterns. The stated frontend environment is **React + TypeScript +
Vite**. Confirm that against the actual repo before starting.

## Fidelity

**High-fidelity.** Final colours, typography, spacing and interaction states.
Recreate pixel-accurately. Every value comes from the design system's token
files (reproduced under *Design tokens* below) — use those tokens, do not
eyeball values off a screenshot.

## The design system

The screens are built on the **AOD Comms** design system, which ships as real
React components. In this bundle: `_ds/` contains the token CSS files and
`_ds_bundle.js`, which exposes components on `window.AODComms`.

**Use these components. Do not rebuild them.**

| Component | Used for |
| --- | --- |
| `Surface` | Every panel. `level={0..4}`, `padding`, `behind` |
| `Button` | `variant="primary" \| "secondary" \| "live"`, optional `icon` |
| `IconButton` | Icon-only controls |
| `Input` | All text fields. `label`, `placeholder`, `mono` |
| `Tag` | Uppercase mono status pills. `tone`, `dot` |
| `Badge` | Circular disc, used in the notch |
| `NotchedCard` | The one flagged item per screen |
| `GrooveStrip` | Milled edge slots (Surface draws these itself) |
| `Icon` | Closed set of 15: sync target add aperture split close tracks burst frame lens role feed filter play flagAdd |
| `StatBar` | Metric rows with the skewed seam |
| `HexSlot` | Hexagonal player slots |
| `TimelineTrack` | Review Board lanes |
| `AnnotationCard` | Coach notes |
| `NavItem` | Sidebar navigation rows |
| `SectionHeader` | `eyebrow`, `index`, `title`, `lede` |
| `PlateFrame` | Plate silhouette + ring + bolt dots |

In a Vite app, prefer importing the design system's component source
(`components/**/*.jsx`) over the `window` global bundle. Ask the user for the
design-system package if it is distributed separately.

### Non-negotiable system rules

These are encoded in the components and must survive the port:

- **Radius is 0.** Shape comes from cuts: `--clip-button` (10px bottom-right on
  secondary buttons), `--clip-thumbnail` (22px bottom-left), `--clip-hex`,
  `--clip-statbar-skew` (14px diagonal seam). Only badge discs and status dots
  are round.
- **Elevation is stacking order, not importance.** E0 recessed (inputs, tracks),
  E1 fixed chrome, E2 cards, E3 selection/popovers, E4 one blocking overlay.
  Step one rung at a time.
- **Groove count equals elevation level.** Pass `Surface` the `behind` colour —
  a groove is a cut and shows what is underneath. Panels, cards and dividers
  only; on a button or table row they read as damage.
- **One inward notch per screen**, on the flagged item.
- **Mono means measured.** Timestamps, IDs, metrics, part numbers in JetBrains
  Mono: `SESSION_047`, `TIMELINE_ID:0048-A`, `00:14:22.480`, `ABSENCE 6.4s`.
- **Red is an instrument line, not a wash.** Max two background colours per
  view. Cyan only for genuinely live/syncing; green only as a positive reading.
- **Box-sizing.** The design system ships no reset — its components are
  content-box, so the guide tells you to set `boxSizing: 'border-box'`
  yourself on anything sized. **Tailwind's Preflight already does this globally**,
  which resolves that gotcha but inverts it: width now *includes* padding. Keep
  Preflight on — the reference designs were authored with explicit
  `boxSizing: 'border-box'` on every sized element, so they already assume
  border-box and match Preflight's behaviour. Check only where a design-system
  component gets both an explicit width **and** padding (a sized `Surface` is
  the case to watch; screen 12's rail is the tightest). The fixed chrome tokens
  sit on unpadded wrappers and are unaffected. If one component does break, wrap
  it in a sized div rather than disabling the global reset.
- **Comm-type colours are fixed by the data model.** Never remap them.
- **No emoji.** Status is a coloured dot, a diamond, or a mono tag.

## Frontend stack

Decided with the designer. Confirm against the actual repo before installing —
if a frontend already exists, extend it rather than re-scaffolding.

\`\`\`
vite + @vitejs/plugin-react
react + typescript
react-router
axios
@tanstack/react-query
laravel-echo + pusher-js
tailwindcss              theme configured from _ds/tokens/ — see below
@radix-ui/react-*        unstyled only: dialog, dropdown-menu, tooltip, popover
gsap + ScrollTrigger     see Animation below for where it is allowed
react-hook-form + zod
fix-webm-duration
\`\`\`

Plus the three self-hosted font families from `_ds/fonts/` and the AOD Comms
components themselves.

### Notes on specific choices

**axios** — configured as a single instance with `withCredentials` and CSRF
header handling, since the backend uses Laravel session auth. Don't scatter
`fetch` calls.

**laravel-echo, not raw pusher-js.** Echo supplies four Laravel broadcasting
conventions that are easy to get wrong by hand:
- Channel prefixes. A backend `PresenceChannel('session.47')` is really the
  channel `presence-session.47`; `PrivateChannel` becomes `private-session.47`.
  Echo adds the prefix — `Echo.join('session.47')`, `Echo.private('session.47')`.
- Event names. Laravel broadcasts under the full class name, so raw pusher-js
  needs `channel.bind('App\\Events\\SessionStarted', cb)`. Echo resolves the
  namespace: `channel.listen('SessionStarted', cb)`. The raw form fails
  **silently** when a class moves namespace — no error, the callback just never
  fires.
- The auth handshake for private/presence channels, defaulting to
  `/broadcasting/auth` with CSRF and credentials wired for Laravel.
- Presence sugar — `.here()`, `.joining()`, `.leaving()` — which is exactly
  what screen 09's participant grid consumes.

Two gotchas: Echo needs `window.Pusher = Pusher` assigned **before** construction
or it throws cryptically; and rather than declaration-merging `window.Echo` for
TypeScript, export the instance from a module.

**Every `Echo.join` needs a matching `Echo.leave(channel)` in its effect
cleanup.** Without it, navigating away leaves ghost members in the presence list
and the participant grid shows players who already left. This is the most common
bug in this part of the app.

**Radix primitives, unstyled — and no shadcn.** AOD Comms already ships Surface,
Button, Input, Tag, Badge, StatBar, TimelineTrack, AnnotationCard. shadcn would
introduce a second design system with its own token names, radius scale and
aesthetic, and the UI would drift toward its look. Use Radix for the *behaviour*
AOD Comms doesn't ship — modal focus-trapping, dropdowns, tooltips — and style
those primitives with AOD Comms tokens at E3 (popovers, dropdowns) or E4 (one
blocking modal). You get the accessibility without the visual opinions.

**GSAP + ScrollTrigger replaces the landing page's hand-rolled animation code.**
The reference implementation uses an `IntersectionObserver`, a rAF parallax loop
and a custom count-up; ScrollTrigger covers all three, plus the board pin
(`pin: true`) and the count-ups (`gsap.to(obj, { val: 1842, onUpdate })`).

GSAP is also used inside the app, but under strict limits — see **Animation**
under *Interactions & behaviour*. Read that section before animating anything
on an app screen.

**react-hook-form + zod** — five sign-up screens, team setup, and session config
with keyword sets and the dead air threshold. The zod schemas also validate API
responses, so a backend field rename surfaces as a parse error instead of
`undefined` rendering somewhere in the UI.

**fix-webm-duration** — `MediaRecorder` WebM blobs carry no duration metadata,
so seeking a recorded track misbehaves. Needed if the review board plays back
recordings rather than a separate VOD; otherwise the server can remux instead.
Confirm which applies before installing.

**Fonts are self-hosted, not from a CDN.** Big Shoulders Display at weight 900
carries the hero and every stat number; FOUT on it is very visible.

### Tailwind theme — configure it from the tokens

Tailwind's defaults actively fight this design system: rem-based spacing against
a 4px pixel scale, `rounded-*` against radius 0, its grey ramp against the
substrate colours. Map the theme to the tokens so a utility class means the right
thing, and the escape hatch `bg-[var(--steel)]` stays available:

\`\`\`js
// tailwind.config.js — values from _ds/tokens/
export default {
  theme: {
    extend: {
      colors: {
        void: '#08090C', well: '#0B0D11', ash: '#101317',
        steel: { DEFAULT: '#161A20', 2: '#1C222A', 3: '#232A34' },
        border: {
          recessed: '#14171C', soft: '#1A1E24', DEFAULT: '#22272F',
          raised: '#2A303A', overlay: '#333B47'
        },
        text: {
          primary: '#F3F4F6', secondary: '#8A8F99', muted: '#52565F',
          'on-accent': '#FFFFFF', 'on-light': '#08090C'
        },
        red: { DEFAULT: '#FF2E3E', hover: '#FF4A57' },
        cyan: '#3FE1D6', aligned: '#2ED573',
        informative: '#8B7FFF', declarative: '#FFB020',
        compound: '#FF6FA8', absence: '#FF2E3E'
      },
      spacing: {
        1: '4px', 2: '8px', 3: '12px', 4: '16px',
        5: '20px', 6: '24px', 7: '28px', section: '88px', 'page-x': '48px'
      },
      borderRadius: { none: '0', hair: '2px', pill: '9999px' },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      width: { sidebar: '212px', rail: '328px', 'track-label': '88px' },
      maxWidth: { page: '1200px', board: '1440px' }
    }
  }
}
\`\`\`

Type tokens are CSS `font:` **shorthands** and don't decompose into Tailwind's
separate size/weight/leading utilities. Apply them as `style={{ font:
'var(--type-body)' }}` or via a small set of `@apply`-free component classes —
do not try to rebuild the type scale as `text-*` utilities, or the shorthand's
line-height and weight pairing will drift.

**Do not delete `borderRadius` defaults and leave nothing** — components need
`rounded-pill` for status dots and badge discs, the only round things in the
system.

## Screens

Files are listed per screen. Read each one for exact copy and structure.

### Landing page — `Landing page.dc.html`

Marketing page, the only screen outside the app shell. Fixed 1440px design
width; total height ~4670px.

Sections top to bottom, with measured heights at 1440px:

| Section | Height | Notes |
| --- | --- | --- |
| Nav bar | 77 | `position: sticky; top: 0`, E1 surface, z-index 20 |
| Hero | 943 | Two columns; claim + stat strip left, live review board right |
| 01 The problem | 533 | Three E2 cards in an auto-fit grid |
| 02 How it works | 1080 | Board pins while three steps scroll past |
| 03 Four categories | 477 | Four columns, each with a 2px comm-type top border |
| 04 Privacy | 391 | Prose left, E2 spec card right (`--size-rail` wide) |
| Closing CTA | 374 | Display heading + primary button |
| Footer | 816 | Big footer: brand block, 3 link columns, CTA row, oversized wordmark |

Content max-width is `--page-max` (1200px) except the nav and the "how it
works" section, which use `--board-max` (1440px). Page gutter `--space-page-x`
(48px). Between sections `--space-section` (88px).

Hero headline "COMMUNICATION, MEASURED" is 78px (an override of
`--type-display-xl`'s 104px). Stat numbers 38px. Closing CTA heading 58px.
Footer wordmark 152px at 13% opacity.

**Animations** (all authored here; reimplement with the codebase's motion
approach or CSS):
- Scroll-reveal on section entry: `opacity 0 → 1`, `translateY(20px) → 0`,
  750ms `cubic-bezier(.2,.7,.3,1)`, staggered 80–320ms within a section.
  Driven by `IntersectionObserver` at `threshold: 0.12`,
  `rootMargin: '0px 0px -12% 0px'`, unobserved after firing.
- Count-ups on entry: 1,842 calls / 4:12 dead air / 24:00 session. 1200ms,
  cubic ease-out, `requestAnimationFrame`.
- Sticky pin: the board column is `position: sticky; top: 120px` while the three
  steps scroll past.
- Parallax: decorative layers translate on scroll at factors 0.05–0.2
  (`translate3d(0, scrollY * f, 0)`), rAF-throttled.
- Hover tilt on cards: `perspective(900px)` + `rotateX/rotateY` up to 6°
  from cursor position, `translateY(-3px)`, 250ms.
- Hero board self-plays: markers scale in on a 75ms stagger, playhead sweeps
  9s linear infinite, absence hatch fades in at 1.6s.
- Footer soundwave: 20 bars `scaleY(.42) → 1`, durations 2.1–3.7s,
  0.13s stagger, `transform-origin: top center`.

**The VOD frame is an empty video slot** — `assets/hero-gameplay.mp4`, muted,
looping, `object-fit: cover`, 16:9. The user supplies footage. A 44px grid
placeholder with a label shows until then.

### 01 Log in — `01 Log in.dc.html`

Split composition, full viewport height, no app shell. Left panel 34% width
(min 380px), E1 surface, carrying the BEYOND MECHANICS wordmark, a product
descriptor line, and a mounting-rail plate device. Right panel holds the form.

### 02 Sign up — account type — `02 Sign up role.dc.html`

Same split. Two selectable role plates side by side: **Coach** (E2 when
selected, red hairline border, corner ticks, filled red hex icon, SELECTED tag)
and **Player** (E1 when unselected, hollow hex, outlined marks). Each lists
three capability lines in mono. Selection is local state; Continue retargets
based on it — Coach → 03, Player → 04.

Left panel carries the enrolment ladder: steps 02 / 03 / 05, active step in red
with a filled hex, completed steps clickable.

### 03 Sign up — coach profile — `03 Sign up coach profile.dc.html`
### 04 Sign up — player details — `04 Sign up player details.dc.html`

Role-specific profile forms, same split shell and ladder.

### 05 Team setup — `05 Team setup.dc.html`

CREATE TEAM / JOIN TEAM tab pair (local state). Create shows Team name +
Description; Join shows a single mono Team code field. CTA label follows the
tab. Note: the active tab uses the red instrument treatment, **not** cyan —
cyan is reserved for live/syncing.

### 06 Coach dashboard — `06 Coach dashboard.dc.html`
### 07 Player dashboard — `07 Player dashboard.dc.html`

First screens with the app shell (see *Sidebar shell* below). Structure:
section header, then a two-column row — main column (`flex: 1 1 520px`) and
right rail (`--size-rail`, 328px).

Main column top to bottom: a single stat block (SESSIONS LOGGED / SESSIONS
PLAYED), a 2×2 `StatBar` grid, then the screen's one `NotchedCard`. The stat
grid and the notched card share the same width and left edge.

Coach stats: comm frequency 18.4/min, alignment 87%, absence total 4:12, calls
classified 1,842. Player stats: 21.6/min, 91%, 0:38, 412 calls.

### 08 Session setup — player — `08 Session setup player.dc.html`
### 09 Session setup — coach — `09 Session setup coach.dc.html`

The lobby. **This screen is realtime** — the participant grid reflects who has
joined and who is ready, and the coach's start action propagates to all players.
Get the channel and event names from the backend repo.

Coach side also configures the session: keyword sets per comm type and the dead
air threshold.

### 10 Recording — player — `10 Recording player.dc.html`
### 11 Recording — coach — `11 Recording coach.dc.html`

Header reads **SESSION IN PROGRESS**. Only two things are live during recording:
**recording status and elapsed time**. No live metrics, no in-session analysis —
that is out of scope by explicit product decision. Readings are produced only
after the coach ends the session.

A **level meter** is present and intentional: it is device feedback for the
user, not a metric.

The capture-status table has three columns — PLAYER / MIC / WINDOW. Each row:
a red hex avatar (34×38, `--clip-hex`) with two-letter mono initials, the name
in uppercase display type, the role in mono beneath. Mic and window statuses
right-aligned in mono — `--aligned` green for ON and CAPTURING, `--red` for
MUTED, `--text-muted` for NOT JOINED and NO CONSENT.

Both mic and game window are captured per player. Copy must not imply mic only.

### 12 Post-match report — coach — `12 Post-match report.dc.html`
### 12b Post-match report — player — `12b Post-match report player.dc.html`

The product's centrepiece. A VOD frame above timeline lanes sharing **one
clock**, with a right rail for the selected call and annotations.

Lanes, top to bottom: **EVENTS** (team-wide, seeded game events), **ABSENCE**
(team-wide — absence is *not* per-player in current scope), then one lane per
player. Label column is `--size-track-label` (88px); row height
`--size-track-row` (30px).

- Markers are diamonds (`transform: rotate(45deg)`), coloured **strictly** by
  comm type. `--size-marker` 10px; selected grows to `--size-marker-selected`
  16px and gains a 4px halo.
- **Absence is the only region fill in the system** and is always a 45° hatch
  (`--absence-hatch`) over a 14% tint (`--absence-fill`) — never solid.
- Playhead is a 1px white line with a small diamond head, **clipped to the lane
  area** so it never crosses the label column. A single floating vertical line
  above the lanes is sufficient — there is no separate playhead row.
- The board bezel carries plate brackets on corners and edges only (16–18px
  limbs); they must never reach the timeline.

**Right rail behaviour:** the annotations list scrolls, and the rail column is
measured against the board column so the rail never extends past the bottom of
the review board. Implemented by comparing `offsetHeight` of both columns and
setting the scroll region's `maxHeight` to absorb the slack; falls back to a
fixed 280px when the columns wrap to one column. Re-run on resize.

**Role difference — enforce this:** the **coach authors** annotations (Add note
button below the scroll region, separated by a top border). **Players cannot
author annotations; they can only reply** to the coach's. 12b has no Add note
control.

### 14 Privacy policy — `14 Privacy policy.dc.html`
### 15 Terms of service — `15 Terms of service.dc.html`

Public legal documents, reachable from the landing footer and from the consent
line on sign-up screens 03 and 04. **No sidebar** — they use the landing page's
sticky header instead, and cross-link to each other.

Layout: hero band (grid + corner plate bracket) carrying eyebrow, title and a
mono last-updated line; then a two-column body — document column
(`flex: 1 1 560px`) and a **sticky TOC rail** (`--size-rail`,
`top: 88px`, `align-self: flex-start`). Sections are `<section id>` with
`scroll-margin-top: 96px` so anchor jumps clear the sticky header.

Each section: a mono red number at `--type-data` 13px beside a
`--type-display-m` uppercase heading, over a `--border-soft` hairline. Body
copy is `--type-body-s` / `--text-secondary` at `line-height: 1.8`,
capped at `66ch`. Editorial asides are the same size in italic
`--text-muted`. Privacy §1 is a three-column grid table, not a `<table>`.

**The copy is legal text — do not paraphrase, shorten or "improve" it when
porting.** Move it into a CMS or markdown file rather than hardcoding it in JSX,
because it will be revised by someone who is not a developer. Both documents are
complete as written — no placeholders remain.

**These documents commit the product to behaviour you must implement.** They are
not decoration; each of the following is a stated promise:

| Commitment | Where | What the backend must do |
| --- | --- | --- |
| Recordings deleted after **3 months** | Privacy §4 | A scheduled job that actually deletes raw audio/video past 90 days. Derived timeline data may persist. |
| Deletion requests honoured in **7–14 business days** | Privacy §4 | A real path for account/recording deletion, not a manual favour. |
| **18+ only** | Privacy §7 | The attestation on screens 03/04 is the enforcement point. No under-18 accounts. |
| Passwords **hashed**, access gated by **team + role** | Privacy §6 | Laravel default hashing; every recording/transcript/timeline request authorised against team membership and role. |
| Data is stored **locally in MySQL** | Privacy §3, §6 | If you move to cloud storage or add a third-party processor, both sections must be updated first. |
| Recordings **belong to the team**, not the coach | Terms §3 | Team-scoped ownership. A coach leaving does not remove or take the history. |
| Management **passes to another coach**; teams with no coach are **archived** | Terms §3 | Handover on coach departure, plus a read-only archived state: existing sessions readable, no new sessions startable. |
| Recording needs **per-player acknowledgement**, coach cannot consent for a player | Terms §4 | Screens 08/09 already model this — recording must not start until every required participant has acknowledged. |
| Players may **decline** a session | Terms §4 | Declining is a supported state, not an error. |
| Analysis runs **only after a session ends** | Terms §2, §6 | No live/in-match processing. This is also the current project scope. |

If any of these change, the document changes with them — flag it to the designer
rather than quietly diverging.

### Sidebar shell — `Sidebar shell.dc.html`

The app shell used by screens 06–12b. Fixed `--size-sidebar` (212px), E1
surface, one groove, plate device, `NavItem` rows. This is the one component
extracted as a child — implement it once and compose every app screen inside it.

### Hero board — `Hero board.dc.html`

The self-playing miniature review board used in the landing hero. Shares the
Review Board's visual language but is decorative — it does not need to be a
second implementation of the real board. Contains the video slot.

## Interactions & behaviour

State that is genuinely local (do not put it on the server):

- **02** — selected role; drives the Continue target
- **03/04** — 18+ attestation checkbox (defaults checked in the mock)
- **05** — CREATE / JOIN tab; swaps fields and CTA label
- **10/11** — elapsed timer; level meter animation frame
- **12/12b** — selected marker; annotation scroll fit
- **Landing** — reveal/count-up fired flags, parallax offsets, hover tilt

Everything else — roster, session state, participant capture status, calls,
absence intervals, game events, annotations and replies — is server state, held
in TanStack Query against an axios instance. No global store is needed; nothing
in these screens shares client state across routes.

**Realtime screens** are 08/09 (lobby: join, leave, ready, start) and 12
(analysis-complete notification). Both need the backend's channel and event
names. Client setup and the `Echo.leave` cleanup rule are under *Frontend
stack*.

**Media capture** (screens 10/11) is browser-side work: `getUserMedia` for mic,
`getDisplayMedia` for the game window, `MediaRecorder` for both. The level meter
reads `AnalyserNode.getByteFrequencyData` on an animation frame. Two things to
know: `getDisplayMedia` always shows the browser's own picker, so the player
selects the game window manually every session and it cannot be pre-selected or
skipped; and game *audio* cannot be captured on macOS, only on Windows/Chrome
with tab or system audio — player mic audio is unaffected.

### Animation

The dividing line is **not** landing page versus app. It is **motion that
carries information** versus **motion that decorates**.

This is a tool a coach stares at for three-hour review sessions. Motion that
feels good on the first visit is what they notice and resent on the fiftieth.
Decorative motion in the app is a defect, not a flourish.

**Animate these — the motion is doing work**

| What | Why | How |
| --- | --- | --- |
| Board populating on first report open | Markers landing in time order shows the coach *what* the analysis found and roughly *when* | Once per report open, **not** on re-render. ~75ms stagger, ~500ms each, scale-in from small |
| Absence regions drawing in | Absence is the easiest finding to miss; it should be seen arriving | Fade the hatch in after the markers settle |
| Marker selection | 10px → 16px plus the 4px halo. Already a transition; a tween makes it crisper | ≤200ms |
| A player joining or leaving the lobby (08/09) | A row appearing with no transition reads as a rendering glitch | Short fade + height, ≤200ms |
| Analysis-complete arriving over Pusher (12) | The processing → ready state change deserves more than a hard swap | ≤200ms |

**Do not animate these**

Route transitions. Sidebar hover. Dashboard cards on mount. Stat bars filling.
Any page-level scroll reveal. Each of these costs the coach time on every visit
and tells them nothing. This is the specific way instrument tools go wrong.

**The rule, stated once**

GSAP is allowed on any screen, for **data-driven state changes only**, capped at
**200ms**, with **no easing that overshoots or bounces**. Never on navigation,
never on hover.

Hover, focus and border states stay as the design system specifies: **120ms
linear CSS transitions**, no GSAP. Hover lightens a border to
`--text-primary` or shifts a red fill to `--red-hover`; there is no
press-scale. The sync ring rotating at 3.4s while genuinely syncing and live
status dots pulsing at 1.8s remain the only continuous motion in the app.

**The playhead is not a tween.** The video is the clock — read
`video.currentTime` on an animation frame and position the playhead from it. A
GSAP tween would run its own timeline and drift out of sync with the footage.
This is the one place where reaching for the animation library is wrong.

**The landing page is the exception, and stays one.** Reveals, parallax, hover
tilt, count-ups and the self-playing hero board are all deliberate there. Do not
strip them, and do not carry them into app screens.

**Responsive.** The Review Board is a desktop tool and **scrolls horizontally
below 1060px rather than reflowing**. Other app screens use flex/grid with
wrapping columns. The landing page is a fixed 1440px design.

**Accessibility.** Minimum hit target `--size-hit-min` (44px). Body copy never
below 13px — the product is read for three-hour stretches. Comm types are
distinguished by colour alone in the current design; if the codebase has an
accessibility bar, raise this with the user rather than silently adding shape
coding.

## Design tokens

Reproduced verbatim from the design system. Prefer importing the token CSS files
in this bundle (`_ds/tokens/`) over transcribing these values.

### Colour

\`\`\`
substrate    --void #08090C  --well #0B0D11  --ash #101317
             --steel #161A20  --steel-2 #1C222A  --steel-3 #232A34
borders      --border-recessed #14171C  --border-soft #1A1E24
             --border #22272F  --border-raised #2A303A  --border-overlay #333B47
text         --text-primary #F3F4F6  --text-secondary #8A8F99
             --text-muted #52565F  --text-on-accent #FFFFFF  --text-on-light #08090C
signal       --red #FF2E3E  --red-hover #FF4A57  --cyan #3FE1D6  --aligned #2ED573
comm types   --informative #8B7FFF  --declarative #FFB020
             --compound #FF6FA8  --absence #FF2E3E
hairlines    --hairline-e1 rgba(255,255,255,.045)  --hairline-e2 rgba(255,255,255,.06)
             --hairline-e3 rgba(255,255,255,.09)   --hairline-e4 rgba(255,255,255,.13)
plate        --plate-silhouette rgba(255,255,255,.055)  --plate-ring rgba(255,255,255,.05)
             --plate-grid rgba(255,255,255,.028)        --plate-bolt #2A303A
scrim        --scrim rgba(8,9,12,.6)
absence      --absence-fill rgba(255,46,62,.14)
             --absence-hatch repeating-linear-gradient(45deg, rgba(255,46,62,.85) 0 2px, transparent 2px 9px)
\`\`\`

### Typography

Families: **Big Shoulders Display** (display, uppercase only), **Inter** (body),
**JetBrains Mono** (measured). Type tokens are CSS `font:` **shorthands**, not
separate size/weight props.

\`\`\`
--type-display-xl  900 104px/.86   display
--type-display-l   800 52px/1      display
--type-display-m   800 30px/1      display
--type-display-s   800 24px/1      display
--type-stat        900 44px/1      display
--type-body-l      400 16.5px/1.5  body
--type-body        400 14.5px/1.5  body
--type-body-s      400 13px/1.45   body
--type-label       600 13px/1.2    body
--type-data-l      500 15px/1.6    mono
--type-data        400 12px/1.6    mono
--type-eyebrow     400 11.5px/1.4  mono
--type-micro       400 10.5px/1.4  mono

--track-eyebrow .16em   --track-micro .14em
--track-label   .04em   --track-tag   .08em
\`\`\`

Eyebrow, micro, label and tag text must carry the matching `letterSpacing`.

### Spacing and layout

\`\`\`
--space-1 4px   --space-2 8px   --space-3 12px  --space-4 16px
--space-5 20px  --space-6 24px  --space-7 28px
--space-section 88px   --space-page-x 48px

--size-sidebar 212px       --size-rail 328px
--size-track-label 88px    --size-track-row 30px
--size-marker 10px         --size-marker-selected 16px
--size-hit-min 44px        --size-icon 24px
--page-max 1200px          --board-max 1440px
\`\`\`

### Elevation

\`\`\`
E0 recessed  --well            #14171C  inset 0 2px 3px rgba(0,0,0,.85)                          0 grooves
E1 structure --ash             #1A1E24  inset 0 1px 0 hairline-e1                                1 groove
E2 module    --steel           #22272F  inset 0 1px 0 hairline-e2, 0 2px 6px rgba(0,0,0,.5)      2 grooves
E3 raised    --steel-2         #2A303A  inset 0 1px 0 hairline-e3, 0 6px 18px rgba(0,0,0,.55)    3 grooves
E4 overlay   --steel-3         #333B47  inset 0 1px 0 hairline-e4, 0 18px 40px rgba(0,0,0,.72)   4 grooves

--bezel-shadow  inset 0 1px 0 hairline-e1, 0 30px 70px rgba(0,0,0,.6)   (Review Board only)
\`\`\`

### Geometry

\`\`\`
grooves   --groove-width 18px  --groove-depth 6px  --groove-gap 8px  --groove-inset 24px
          --groove-divider-width 26px  --groove-divider-depth 7px
notch     --notch-mask (inline SVG, see tokens/geometry.css)
          --notch-badge-size 28px  --notch-badge-offset 9px  --notch-clearance 56px
radii     --radius-none 0  --radius-hair 2px (ceiling)  --radius-pill 9999px
clips     --clip-button 10px  --clip-thumbnail 22px
          --clip-statbar-skew 14px  --clip-statbar-skew-compact 12px
          --clip-hex polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)
border    --border-width 1px
\`\`\`

The notch is cut with an SVG mask so whatever sits behind shows through. Because
a mask clips the whole render tree, **the badge must be a sibling of the masked
panel** inside a shared relative wrapper, and the masked panel loses its border —
depth comes from tint and shadow alone.

## Copy rules

The product is an instrument; copy reads like a readout.

- Third person and impersonal for anything measured. Second person only in
  instructions. Never "we".
- Facts over adjectives, every number with its unit. Never round a measurement
  to look tidier.
- Display headings and mono labels uppercase; body copy sentence case; tags
  always uppercase.
- Identifiers look like part numbers: `SESSION_047`, `TIMELINE_ID:0048-A`,
  `BUILD:4.0.2`.
- **Terminology is fixed by the data model:** *informative*, *declarative*,
  *compound*, *absence*. Never invent a fifth comm type or rename one.
- **Silence is neutral.** Dead air is an interval that was counted, never an
  error. "6 gaps", not "6 failures".
- Don't over-use the word "consent" — say what actually happens ("grants mic and
  screen access", "declined") rather than repeating the abstraction.
- Section labels are numbered in mono: `01 // Foundations`, `03/09`.

## Assets

- `assets/review-board.png` — screenshot of the real Review Board (screen 12),
  used as the product shot in the landing page's "how it works" section. 2×.
- `assets/review-board-full.png` — wider crop of the same, 2×.
- `assets/hero-gameplay.mp4` — **not present.** The user supplies gameplay
  footage. The landing hero's VOD frame references this path and shows a grid
  placeholder until it exists.

No logo or brand mark exists. The wordmark is set in plain type (Big Shoulders
Display, uppercase) wherever a mark would go — **do not draw one.**

No illustrations or photography. All decorative art is CSS: plate silhouettes
via `clip-path`, grid rules via `repeating-linear-gradient`, glows via
`radial-gradient`.

## Files in this bundle

**App screens**
\`\`\`
01 Log in.dc.html
02 Sign up role.dc.html
03 Sign up coach profile.dc.html
04 Sign up player details.dc.html
05 Team setup.dc.html
06 Coach dashboard.dc.html
07 Player dashboard.dc.html
08 Session setup player.dc.html
09 Session setup coach.dc.html
10 Recording player.dc.html
11 Recording coach.dc.html
12 Post-match report.dc.html
12b Post-match report player.dc.html
14 Privacy policy.dc.html
15 Terms of service.dc.html
Sidebar shell.dc.html
\`\`\`

**Landing page**
\`\`\`
Landing page.dc.html            the real one, animated
Hero board.dc.html              self-playing board in the hero
\`\`\`

**Design system**
\`\`\`
_ds/tokens/*.css      the token contract — import these
_ds/styles.css        @import-only entry point
_ds/_ds_bundle.js     components on window.AODComms
_ds/fonts/            Big Shoulders Display, Inter, JetBrains Mono
\`\`\`

**Assets**
\`\`\`
assets/review-board.png
assets/review-board-full.png
\`\`\`

To view a design file, open it directly in a browser — each is a standalone
document.

## Suggested order

1. **Ask for the backend repo.** Read it before writing code.
2. Scaffold per *Frontend stack* above — fonts self-hosted, token CSS imported,
   Tailwind theme mapped from the tokens, design-system components importable.
3. `Sidebar shell` — every app screen composes inside it.
4. **12 Post-match report.** Build the hardest screen first. If the timeline,
   the shared clock, marker selection and the rail-height fit work, everything
   else is straightforward. Getting it last means discovering its constraints
   after the rest is built around wrong assumptions.
5. 06 / 07 dashboards.
6. Sign-up flow 01 → 05.
7. 08–11 session and recording, including media capture and realtime.
8. 12b player report (12 with authoring removed, replies added).
9. Landing page last — it shares almost nothing with the app.
10. 14/15 legal pages — static content, no app chrome; do them alongside the landing page.
