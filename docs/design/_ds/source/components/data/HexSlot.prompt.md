Use `HexSlot` wherever a player is represented as a figure.

```jsx
<HexSlot initials="PA" role="IGL" state="active" />
<HexSlot initials="PB" role="DUEL" />
```

Never substitute a circular avatar. In a header row drop to `width={34} height={38}` and omit `role`.