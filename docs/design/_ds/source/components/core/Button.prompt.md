Use `Button` for every action. One primary per view.

```jsx
<Button>Start review</Button>
<Button variant="secondary">Export clip</Button>
<Button variant="live" icon={<SyncRing />}>Re-sync</Button>
```

`live` is reserved for actions that touch a live or syncing state — never as a second accent. Never add a border radius or a groove to a button; at this scale slots read as damage.