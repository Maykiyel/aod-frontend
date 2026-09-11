Use `Icon` for every glyph. The set is closed — if you need a mark that is not in it, add it to `GLYPHS` rather than pasting a one-off SVG.

```jsx
<Icon name="aperture" size={16} color="var(--red)" />
<Icon name="sync" size={13} color="var(--cyan)" />
```

`sync` animates on its own; it belongs only on something actually syncing. Never use emoji or a third-party icon font in this system.