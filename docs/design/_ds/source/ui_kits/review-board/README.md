# AOD Comms — Review Board UI kit

The product's core surface: one bordered monitor object holding a sidebar, the VOD frame,
the canonical timeline and a review rail. Coaches sit in this screen for hours, so it is the
screen every other decision in the system was made against.

## Screens

| File | What it is |
| --- | --- |
| `ReviewBoard.jsx` | The board mid-review, with a compound callout selected and its annotation pinned to the frame. Playhead parked at the selected moment; the Pause button toggles it. |
| `SessionsList.jsx` | The session index the board is opened from. Composed entirely of documented components — thumbnails with the bottom-left clip, stat bars, hex rosters. |

`index.html` wires them together: the list opens a session, the sidebar's Dashboard row goes back.

## Elevation in this screen

- **E1** — bezel, sidebar, right rail. One groove each, bolt dots at the corners, plate texture in the corner of both rails.
- **E0** — VOD frame, timeline well, anchor readout, progress track. Everything measured sits below the plate.
- **E2** — annotation cards at rest.
- **E3** — the Selected Moment card, the pinned callout on the frame, and the presence rail that breaks outside the bezel.

## Notes

- The VOD frame is a placeholder: a grid, a watermark and a dim label. Drop real footage in when you have it — do not add invented UI over it.
- The board scrolls horizontally below 1060px rather than reflowing. It is a desktop tool.
