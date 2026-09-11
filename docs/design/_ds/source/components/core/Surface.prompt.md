Use `Surface` for any panel, card, well, popover or modal — it is the only correct way to place something on the elevation ladder.

```jsx
<Surface level={2} behind="var(--ash)">
  <h3>Annotation</h3>
</Surface>
```

`level` 0 recessed (inputs, tracks), 1 structure (sidebar, rails, bezel), 2 module (cards — the working level), 3 raised (selection, popover), 4 overlay (modal; one at a time, over `--scrim`).

Set `behind` to the colour of the surface underneath so the grooves read as cuts rather than painted marks. Do not pass `grooves` — the count is derived from `level` on purpose. Pass `grooves={0}` only for a surface too small to carry slots (under ~120px wide).