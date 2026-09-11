Use `TimelineTrack` once per player lane, plus one lane for game events. Wrap the stack in a `Surface level={0}`.

```jsx
<TimelineTrack label="PA_WALKER" markers={[{at:'22%',type:'declarative'}]} selectedAt={{at:'41%',type:'compound'}} />
<TimelineTrack label="PB_REYES" absence={{ from: '56%', width: '11%' }} />
```

Every lane shares one clock. Absence is always the hatch — a solid red region turns a measurement into an alarm. If you add a playhead, clip it to the lane area so it never sweeps across the label column.