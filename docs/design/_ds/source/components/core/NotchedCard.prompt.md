Use `NotchedCard` for the ONE flagged item on a screen — a selected moment, a called-out anomaly. Never two on the same screen.

```jsx
<NotchedCard badge={<Diamond color="var(--compound)" />} style={{ width: 300 }}>
  <div style={{ font: 'var(--type-display-m)' }}>MID TAKE CALL</div>
</NotchedCard>
```

The mask clips the whole render tree, so the badge is rendered as a sibling inside a shared relative wrapper — never as a child of the masked panel. The clipped panel also loses its border; depth comes from surface tint and shadow alone. The mask stretches to the element box, so at extreme aspect ratios the radii go slightly oval — give the card a sane width and height.