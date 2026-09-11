Use `StatBar` for any headline metric.

```jsx
<StatBar label="COMM FREQUENCY" value="18.4" unit="/min" fill="red" />
<StatBar label="COMM ABSENCE" value="6" unit="gaps" />
```

The two halves interlock via a negative margin and mirrored clip paths — never render them as separate rectangles with a gap. At most one red bar per group; the rest go white on void. `fill="aligned"` only for a genuinely positive reading.